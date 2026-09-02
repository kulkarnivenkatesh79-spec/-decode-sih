"""
================================================================================
 facility.py · Arogya Sahayak / SIH
 A flexible, multi-source health-facility lookup API.
================================================================================

DESIGN
------
Accepts ONE of three input shapes: lat+lng, a 6-digit PIN code, or a free-text
query (landmark / village / area name). Resolves to a coordinate, then
searches for nearby health facilities through a fallback chain:

    1. sih.facilities  (MongoDB $geoNear)   -- fast, free, curated
    2. Overpass (OSM)  live query           -- fills DB gaps, self-caches back
    3. Google Places Nearby Search          -- last resort, requires API key,
                                                never cached (Places ToS)

Every external call has its own timeout, and a global deadline caps the whole
waterfall so a single request can never hang indefinitely — later stages are
skipped once the budget runs out, and the response says so via `partial`.

This is intentionally a standalone, reusable HTTP API — not tied to Telegram
or n8n. Anything that can make a GET request can use it.

ENDPOINTS
---------
  GET /api/facility
      ?lat=..&lng=..                      (direct coordinates)
      ?pincode=......                     (6-digit Indian PIN)
      ?query=some+landmark+or+village      (free text)
      &ownership=all|government|private   (default: all)
      &type=PHC|CHC|DH|SDH|MC|SC           (optional, exact facility-type filter)
      &radius_km=25                        (default 25, max 50)
      &limit=5                             (default 5, max 20)
      &source=auto|db|live                 (default auto; 'db' skips OSM/Google
                                             entirely, 'live' forces OSM/Google
                                             even if DB already has coverage)

  GET /api/facility?mode=geocode&pincode=... (or &query=...)
      Returns just the resolved coordinate, no facility search. Useful
      standalone for anything else you build that needs India geocoding.

ENV VARS
--------
  MONGO_URI              required
  GOOGLE_MAPS_API_KEY     optional — Google Places/Geocoding fallback disabled
                          entirely if unset (everything else still works)
  SERVICE_API_KEY         optional — if set, callers must send header
                          `X-API-Key: <value>`. If unset, the endpoint is open.

DEPLOY
------
  vercel --prod
  (requirements.txt + vercel.json included alongside this file)
================================================================================
"""

from __future__ import annotations

import os
import re
import time
import math
from datetime import datetime, timezone

import requests
from flask import Flask, request, jsonify
from pymongo import MongoClient, GEOSPHERE
from pymongo.errors import PyMongoError

app = Flask(__name__)

# ==============================================================================
# CONFIG
# ==============================================================================

MONGO_URI = os.environ.get("MONGO_URI", "")
GOOGLE_MAPS_API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY", "")
SERVICE_API_KEY = os.environ.get("SERVICE_API_KEY", "")

DB_NAME = "sih"
FACILITIES_COLLECTION = "facilities"
PIN_CENTROIDS_COLLECTION = "pin_centroids"

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
PHOTON_URL = "https://photon.komoot.io/api/"
POSTALPINCODE_URL = "https://api.postalpincode.in/pincode/{pincode}"
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
GOOGLE_PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

# A descriptive User-Agent identifying the app + contact is required by
# Nominatim's usage policy (https://operations.osmfoundation.org/policies/nominatim/).
# Replace the email before you rely on this in production.
USER_AGENT = "ArogyaSahayak-FacilityAPI/1.0 (contact: your-email@example.com)"

INDIA_BBOX = (6.5, 68.0, 35.7, 97.5)  # south, west, north, east

DEFAULT_RADIUS_KM = 25
MAX_RADIUS_KM = 50
DEFAULT_LIMIT = 5
MAX_LIMIT = 20

# On Vercel this was capped tight (8s) to survive the serverless Hobby plan's
# hard 10s function limit. Render runs this as a persistent process instead —
# no platform-imposed wall — so this is raised to give Overpass the room it
# genuinely needs (documented 10-30s response times in earlier testing).
# Tune down if you'd rather fail fast than wait; tune up if Overpass is still
# timing out for your users. This is a UX tradeoff, not a platform limit.
TOTAL_BUDGET_S = 20.0


# ==============================================================================
# FACILITY-TYPE / OWNERSHIP CLASSIFICATION
# Mirrors the taxonomy used in build_facilities_db.py so DB-sourced and
# live-sourced records use the same `type` codes. If you tune the regexes in
# that script, mirror the change here too.
# ==============================================================================

TYPE_PATTERNS = [
    ("SC",  r"\b(sub[\s\-]?cent(re|er)|sub[\s\-]?health|hwc|health\s*(and|&)\s*wellness|anganwadi|upkendra)\b"),
    ("PHC", r"\b(p\.?h\.?c\.?|primary\s+health|prathmik\s+swasthya)\b"),
    ("CHC", r"\b(c\.?h\.?c\.?|community\s+health|samudayik\s+swasthya)\b"),
    ("MC",  r"\b(medical\s+college|aiims|institute\s+of\s+medical)\b"),
    ("DH",  r"\b(district\s+hospital|civil\s+hospital|general\s+hospital|sadar\s+hospital)\b"),
    ("SDH", r"\b(sub[\s\-]?divisional\s+hospital|taluk\s+hospital|area\s+hospital)\b"),
]

GOV_HINTS = re.compile(
    r"\b(govt|government|sarkari|district|civil|community|primary\s+health|"
    r"p\.?h\.?c\.?|c\.?h\.?c\.?|sub[\s\-]?cent(re|er)|aiims|municipal|"
    r"corporation|state|taluk|sadar|zilla|anganwadi)\b",
    re.IGNORECASE,
)
PRIVATE_HINTS = re.compile(
    r"\b(private|pvt|clinic|nursing\s+home|apollo|fortis|max\b|manipal|"
    r"medanta|columbia\s+asia|narayana|care\s+hospital)\b",
    re.IGNORECASE,
)


def classify_type(name: str) -> str:
    n = (name or "").lower()
    for code, pattern in TYPE_PATTERNS:
        if re.search(pattern, n, re.IGNORECASE):
            return code
    if "hospital" in n:
        return "DH"
    return "OTHER"


def classify_ownership(name: str, osm_tags: dict | None = None) -> tuple[bool | None, str]:
    """Returns (is_government, confidence). confidence in {high, medium, low}."""
    name = name or ""
    if osm_tags:
        operator_type = (osm_tags.get("operator:type") or "").lower()
        if operator_type in ("government", "public"):
            return True, "medium"
        if operator_type == "private":
            return False, "medium"
    if GOV_HINTS.search(name):
        return True, "medium"
    if PRIVATE_HINTS.search(name):
        return False, "medium"
    return None, "low"


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def in_india(lat, lon) -> bool:
    s, w, n, e = INDIA_BBOX
    return s <= lat <= n and w <= lon <= e


def maps_link(lat, lon) -> str:
    return f"https://www.google.com/maps?q={lat},{lon}"


# ==============================================================================
# MONGODB
# ==============================================================================

_client: MongoClient | None = None


def get_db():
    global _client
    if _client is None:
        if not MONGO_URI:
            raise RuntimeError("MONGO_URI not set")
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=6000, connectTimeoutMS=6000)
    return _client[DB_NAME]


def db_get_pin_centroid(pincode: str):
    try:
        db = get_db()
        doc = db[PIN_CENTROIDS_COLLECTION].find_one({"_id": pincode})
        if doc and "latitude" in doc and "longitude" in doc:
            return float(doc["latitude"]), float(doc["longitude"])
    except (PyMongoError, RuntimeError):
        pass
    return None


def db_cache_pin_centroid(pincode: str, lat: float, lng: float, source: str):
    try:
        db = get_db()
        db[PIN_CENTROIDS_COLLECTION].update_one(
            {"_id": pincode},
            {"$set": {"latitude": lat, "longitude": lng, "source": source,
                      "cached_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
    except (PyMongoError, RuntimeError):
        pass  # cache is best-effort, never block the response on it


def db_search_facilities(lat, lng, radius_km, ownership, type_filter, limit):
    try:
        db = get_db()
        match = {}
        if ownership == "government":
            match["is_government"] = True
        elif ownership == "private":
            match["is_government"] = False
        if type_filter:
            match["type"] = type_filter

        pipeline = [
            {"$geoNear": {
                "near": {"type": "Point", "coordinates": [lng, lat]},
                "distanceField": "distance_m",
                "spherical": True,
                "maxDistance": radius_km * 1000,
                "query": match,
            }},
            {"$sort": {"verified": -1, "distance_m": 1}},
            {"$limit": limit},
        ]
        out = []
        for doc in db[FACILITIES_COLLECTION].aggregate(pipeline):
            coords = (doc.get("location") or {}).get("coordinates") or [None, None]
            out.append({
                "name": doc.get("name"),
                "type": doc.get("type"),
                "is_government": doc.get("is_government"),
                "classification_confidence": "high",  # curated/registry data
                "verified": doc.get("verified", False),
                "phone": doc.get("phone"),
                "address": doc.get("address"),
                "district": doc.get("district"),
                "state": doc.get("state"),
                "distance_km": round(doc.get("distance_m", 0) / 1000, 1),
                "latitude": coords[1],
                "longitude": coords[0],
                "source": "db",
            })
        return out
    except (PyMongoError, RuntimeError):
        return []


def db_upsert_facility(record: dict):
    """Cache a live-discovered (OSM only — never Google) facility back into
    sih.facilities so future lookups in this area hit the fast DB path."""
    try:
        db = get_db()
        db[FACILITIES_COLLECTION].update_one(
            {"_id": record["facility_id"]},
            {
                "$set": {k: v for k, v in record.items() if k != "facility_id"},
                "$setOnInsert": {"created_at": datetime.now(timezone.utc)},
            },
            upsert=True,
        )
    except (PyMongoError, RuntimeError):
        pass  # caching is best-effort


# ==============================================================================
# GEOCODING — pincode / free text -> (lat, lng, source)
# ==============================================================================

def geocode_nominatim(query: str, timeout: float):
    try:
        r = requests.get(
            NOMINATIM_URL,
            params={"q": query, "format": "json", "limit": 1, "countrycodes": "in"},
            headers={"User-Agent": USER_AGENT},
            timeout=timeout,
        )
        data = r.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception:
        pass
    return None


def geocode_photon(query: str, timeout: float):
    try:
        r = requests.get(
            PHOTON_URL,
            params={"q": query, "limit": 1, "lang": "en"},
            headers={"User-Agent": USER_AGENT},
            timeout=timeout,
        )
        data = r.json()
        feats = data.get("features") or []
        if feats:
            lon, lat = feats[0]["geometry"]["coordinates"]
            return float(lat), float(lon)
    except Exception:
        pass
    return None


def geocode_google(query: str, timeout: float):
    if not GOOGLE_MAPS_API_KEY:
        return None
    try:
        r = requests.get(
            GOOGLE_GEOCODE_URL,
            params={"address": query, "region": "in", "key": GOOGLE_MAPS_API_KEY},
            timeout=timeout,
        )
        data = r.json()
        results = data.get("results") or []
        if results:
            loc = results[0]["geometry"]["location"]
            return float(loc["lat"]), float(loc["lng"])
    except Exception:
        pass
    return None


def geocode_pincode_district_state(pincode: str, timeout: float):
    """Fallback: resolve PIN -> district/state text via India Post's free API,
    then geocode that text. Coarser than a direct PIN match, but works when
    Nominatim/Photon don't have the raw PIN indexed."""
    try:
        r = requests.get(POSTALPINCODE_URL.format(pincode=pincode), timeout=timeout)
        data = r.json()
        if data and data[0].get("Status") == "Success":
            po = (data[0].get("PostOffice") or [{}])[0]
            district, state = po.get("District"), po.get("State")
            if district and state:
                return f"{district}, {state}, India"
    except Exception:
        pass
    return None


def resolve_pincode(pincode: str, deadline: float):
    if not re.fullmatch(r"\d{6}", pincode or ""):
        return None, "invalid_pincode"

    cached = db_get_pin_centroid(pincode)
    if cached:
        return cached, "pin_centroid_cache"

    for fn, name in ((geocode_nominatim, "nominatim"), (geocode_photon, "photon")):
        remaining = deadline - time.monotonic()
        if remaining <= 0.5:
            break
        result = fn(pincode + ", India", min(4.0, remaining))
        if result and in_india(*result):
            db_cache_pin_centroid(pincode, result[0], result[1], name)
            return result, name

    remaining = deadline - time.monotonic()
    if remaining > 1.0:
        district_state = geocode_pincode_district_state(pincode, min(4.0, remaining))
        if district_state:
            for fn, name in ((geocode_nominatim, "nominatim_district"), (geocode_photon, "photon_district")):
                remaining = deadline - time.monotonic()
                if remaining <= 0.5:
                    break
                result = fn(district_state, min(4.0, remaining))
                if result and in_india(*result):
                    db_cache_pin_centroid(pincode, result[0], result[1], name)
                    return result, name

    remaining = deadline - time.monotonic()
    if remaining > 1.0:
        result = geocode_google(pincode + ", India", min(4.0, remaining))
        if result and in_india(*result):
            db_cache_pin_centroid(pincode, result[0], result[1], "google")
            return result, "google"

    return None, "unresolved"


def resolve_text(query: str, deadline: float):
    for fn, name in ((geocode_nominatim, "nominatim"), (geocode_photon, "photon")):
        remaining = deadline - time.monotonic()
        if remaining <= 0.5:
            break
        result = fn(query, min(4.0, remaining))
        if result and in_india(*result):
            return result, name

    remaining = deadline - time.monotonic()
    if remaining > 1.0:
        result = geocode_google(query, min(4.0, remaining))
        if result and in_india(*result):
            return result, "google"

    return None, "unresolved"


# ==============================================================================
# LIVE FALLBACK: OVERPASS (OSM)
# ==============================================================================

def overpass_search(lat, lng, radius_km, timeout: float):
    radius_m = int(radius_km * 1000)
    query = f"""
    [out:json][timeout:{int(timeout)}];
    (
      node["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:{radius_m},{lat},{lng});
      way["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:{radius_m},{lat},{lng});
      node["healthcare"](around:{radius_m},{lat},{lng});
    );
    out center tags;
    """
    for url in OVERPASS_URLS:
        try:
            r = requests.post(url, data={"data": query},
                               headers={"User-Agent": USER_AGENT}, timeout=timeout)
            if r.status_code != 200:
                continue
            data = r.json()
            elements = data.get("elements") or []
            out = []
            for el in elements:
                tags = el.get("tags", {})
                name = tags.get("name") or tags.get("name:en")
                if not name:
                    continue
                elat = el.get("lat") or (el.get("center") or {}).get("lat")
                elon = el.get("lon") or (el.get("center") or {}).get("lon")
                if elat is None or elon is None:
                    continue
                elat, elon = float(elat), float(elon)
                if not in_india(elat, elon):
                    continue
                is_gov, confidence = classify_ownership(name, tags)
                out.append({
                    "facility_id": f"osm_{el['type']}_{el['id']}",
                    "name": name,
                    "type": classify_type(name),
                    "is_government": is_gov if is_gov is not None else False,
                    "classification_confidence": confidence,
                    "verified": False,
                    "phone": tags.get("phone") or tags.get("contact:phone"),
                    "address": tags.get("addr:full") or None,
                    "district": tags.get("addr:district"),
                    "state": tags.get("addr:state"),
                    "distance_km": round(haversine_km(lat, lng, elat, elon), 1),
                    "latitude": elat,
                    "longitude": elon,
                    "location": {"type": "Point", "coordinates": [elon, elat]},
                    "source": "osm_live",
                    "source_type": "osm",
                })
            return out
        except Exception:
            continue  # try next mirror
    return []


# ==============================================================================
# LIVE FALLBACK: GOOGLE PLACES
# NOTE: this uses the legacy Nearby Search endpoint. If your API key is
# provisioned only for the newer Places API (New), this call may 403 — the
# new API uses a different POST-based `places:searchNearby` request shape.
# Verify against your own key before relying on this in production.
# ==============================================================================

def google_places_search(lat, lng, radius_km, timeout: float):
    if not GOOGLE_MAPS_API_KEY:
        return []
    try:
        r = requests.get(
            GOOGLE_PLACES_NEARBY_URL,
            params={
                "location": f"{lat},{lng}",
                "radius": int(radius_km * 1000),
                "type": "hospital",
                "key": GOOGLE_MAPS_API_KEY,
            },
            timeout=timeout,
        )
        data = r.json()
        if data.get("status") not in ("OK", "ZERO_RESULTS"):
            return []
        out = []
        for place in data.get("results") or []:
            name = place.get("name")
            loc = (place.get("geometry") or {}).get("location") or {}
            plat, plng = loc.get("lat"), loc.get("lng")
            if plat is None or plng is None:
                continue
            is_gov, confidence = classify_ownership(name)
            out.append({
                "name": name,
                "type": classify_type(name),
                "is_government": is_gov if is_gov is not None else False,
                "classification_confidence": confidence,
                "verified": False,
                "phone": None,  # requires a separate Place Details call (billed extra)
                "address": place.get("vicinity"),
                "district": None,
                "state": None,
                "distance_km": round(haversine_km(lat, lng, plat, plng), 1),
                "latitude": plat,
                "longitude": plng,
                "source": "google_places",
            })
        return out
    except Exception:
        return []


# ==============================================================================
# MERGE / DEDUPE / RANK
# ==============================================================================

# Common abbreviation <-> full-form pairs so "PHC Kolar" and "Primary Health
# Centre Kolar" normalize to the same string before dedup comparison. Applied
# BEFORE punctuation-stripping, longest patterns first so "chc" doesn't
# partially match inside a longer phrase.
_ABBREV_EXPANSIONS = [
    (r"\bp\.?h\.?c\.?\b", "primary health centre"),
    (r"\bc\.?h\.?c\.?\b", "community health centre"),
    (r"\bs\.?d\.?h\.?\b", "sub divisional hospital"),
    (r"\bd\.?h\.?\b", "district hospital"),
    (r"\bs\.?c\.?\b", "sub centre"),
    (r"\bgovt\.?\b", "government"),
    (r"\bdist\.?\b", "district"),
    (r"\bhosp\.?\b", "hospital"),
    (r"\bctr\.?\b|\bcntr\.?\b", "centre"),
    (r"\bcenter\b", "centre"),
]


def _norm_name(name: str) -> str:
    n = (name or "").lower()
    for pattern, expansion in _ABBREV_EXPANSIONS:
        n = re.sub(pattern, expansion, n)
    n = re.sub(r"[^a-z0-9]", "", n)
    return n


def merge_results(*groups, radius_km, ownership, type_filter, limit):
    all_items = [item for group in groups for item in group]

    # dedupe: same normalized name within ~300m of each other -> keep first
    # (groups are passed in priority order, so db beats osm beats google)
    kept = []
    for item in all_items:
        dupe = False
        for k in kept:
            if _norm_name(item["name"]) == _norm_name(k["name"]):
                d = haversine_km(item["latitude"], item["longitude"], k["latitude"], k["longitude"])
                if d < 0.3:
                    dupe = True
                    break
        if not dupe:
            kept.append(item)

    if ownership == "government":
        kept = [k for k in kept if k.get("is_government") is True]
    elif ownership == "private":
        kept = [k for k in kept if k.get("is_government") is False]

    if type_filter:
        kept = [k for k in kept if k.get("type") == type_filter]

    source_rank = {"db": 0, "osm_live": 1, "google_places": 2}
    kept.sort(key=lambda k: (source_rank.get(k["source"], 9), k["distance_km"]))

    for k in kept:
        k["maps_link"] = maps_link(k["latitude"], k["longitude"])
        k.pop("location", None)  # internal-only field used for caching

    return kept[:limit]


# ==============================================================================
# FLASK ROUTE
# ==============================================================================

@app.before_request
def _check_auth():
    if SERVICE_API_KEY:
        if request.headers.get("X-API-Key") != SERVICE_API_KEY:
            return jsonify({"error": "unauthorized"}), 401


@app.route("/api/facility", methods=["GET"])
def facility_lookup():
    deadline = time.monotonic() + TOTAL_BUDGET_S

    mode = request.args.get("mode", "search")
    lat_raw = request.args.get("lat")
    lng_raw = request.args.get("lng")
    pincode = (request.args.get("pincode") or "").strip()
    query_text = (request.args.get("query") or "").strip()
    ownership = request.args.get("ownership", "all")
    type_filter = (request.args.get("type") or "").strip().upper() or None
    source_mode = request.args.get("source", "auto")

    try:
        radius_km = min(float(request.args.get("radius_km", DEFAULT_RADIUS_KM)), MAX_RADIUS_KM)
    except ValueError:
        radius_km = DEFAULT_RADIUS_KM
    try:
        limit = min(int(request.args.get("limit", DEFAULT_LIMIT)), MAX_LIMIT)
    except ValueError:
        limit = DEFAULT_LIMIT

    if ownership not in ("all", "government", "private"):
        return jsonify({"error": "ownership must be all, government, or private"}), 400

    # ---- resolve input to a coordinate -------------------------------------
    lat = lng = None
    resolved_from = None

    if lat_raw and lng_raw:
        try:
            lat, lng = float(lat_raw), float(lng_raw)
            resolved_from = "coordinates"
        except ValueError:
            return jsonify({"error": "lat/lng must be numeric"}), 400
    elif pincode:
        coords, src = resolve_pincode(pincode, deadline)
        if not coords:
            return jsonify({"error": f"could not resolve pincode {pincode}", "detail": src}), 404
        lat, lng = coords
        resolved_from = f"pincode:{src}"
    elif query_text:
        coords, src = resolve_text(query_text, deadline)
        if not coords:
            return jsonify({"error": f"could not resolve query '{query_text}'", "detail": src}), 404
        lat, lng = coords
        resolved_from = f"query:{src}"
    else:
        return jsonify({"error": "provide lat & lng, or pincode, or query"}), 400

    if not in_india(lat, lng):
        return jsonify({"error": "resolved coordinate is outside India bounding box",
                         "latitude": lat, "longitude": lng}), 400

    if mode == "geocode":
        return jsonify({"latitude": lat, "longitude": lng, "resolved_from": resolved_from})

    # ---- search facilities ---------------------------------------------------
    sources_used = []
    partial = False

    db_results = []
    if source_mode != "live":
        db_results = db_search_facilities(lat, lng, radius_km, ownership, type_filter, limit)
        sources_used.append("db")

    osm_results, google_results = [], []
    need_more = source_mode == "live" or len(db_results) < min(3, limit)

    if source_mode != "db" and need_more:
        remaining = deadline - time.monotonic()
        if remaining > 1.5:
            osm_results = overpass_search(lat, lng, radius_km, timeout=min(6.0, remaining - 0.5))
            if osm_results:
                sources_used.append("osm_live")
                for rec in osm_results:
                    db_upsert_facility(rec)  # self-heal the DB for next time
        else:
            partial = True

        remaining = deadline - time.monotonic()
        if not osm_results and remaining > 1.0:
            google_results = google_places_search(lat, lng, radius_km, timeout=min(4.0, remaining - 0.3))
            if google_results:
                sources_used.append("google_places")
        elif remaining <= 1.0:
            partial = True

    results = merge_results(
        db_results, osm_results, google_results,
        radius_km=radius_km, ownership=ownership, type_filter=type_filter, limit=limit,
    )

    warnings = []
    if results and all(r["source"] != "db" for r in results):
        warnings.append("No verified government-registry match nearby — showing live/unverified data only.")
    if not results:
        warnings.append("No facilities found within radius. Try a larger radius_km or a different location.")
    if partial:
        warnings.append("Search stopped early due to time budget — results may be incomplete.")

    return jsonify({
        "query": {
            "latitude": lat, "longitude": lng, "resolved_from": resolved_from,
            "radius_km": radius_km, "ownership": ownership, "type": type_filter,
        },
        "sources_used": sources_used,
        "partial": partial,
        "count": len(results),
        "facilities": results,
        "warnings": warnings,
    })


@app.errorhandler(Exception)
def handle_error(e):
    return jsonify({"error": "internal_error", "detail": str(e)}), 500