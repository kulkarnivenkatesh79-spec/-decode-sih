# Arogya Dashboard Backend

Thin bridge between the `arogya_escalation_manager` n8n workflow and the
ArogyaSetu dashboard's **Critical Action Queue** + **Field Responders** panel.

```
n8n  ──POST /api/escalations/upsert──►  MongoDB  ◄──GET /api/escalations──  dashboard (polls ~8s)
n8n  ──POST /api/admins/upsert──────►  MongoDB  ◄──GET /api/admins───────  dashboard
dashboard ──POST /api/escalations/:id/respond──►  backend  ──POST /webhook/arogya-escalation-ack──►  n8n
```

The browser never holds n8n's internal secret — only this backend does.

## Auth model

Two separate shared-header secrets:

- **`N8N_INTERNAL_AUTH_HEADER_NAME` / `_VALUE`** — the header n8n already attaches
  on its HTTP Request nodes. Required on the inbound `POST /upsert` routes.
- **`DASHBOARD_API_AUTH_HEADER_NAME` / `_VALUE`** — a static string baked into the
  dashboard's frontend JS. Required on the GET reads and the dashboard-initiated
  `/respond` + `/resolve` routes. It only deters casual scraping — every browser
  visitor can read it, so treat the read endpoints as effectively public.

## Setup

```bash
cd server
npm install
cp .env.example .env      # then fill in the values
npm start
```

The server **refuses to start** if any required `.env` key is missing
(`MONGO_DB_NAME` is the one exception — it defaults to `sih`).

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/escalations/upsert` | n8n header | n8n pushes one escalation (keyed by `case_id`) |
| POST | `/api/admins/upsert` | n8n header | n8n pushes one admin (keyed by `admin_id`) |
| GET | `/api/escalations?status=active\|all&limit=50` | dashboard header | queue read, most-severe first, `limit` capped at 200 |
| GET | `/api/escalations/:case_id` | dashboard header | single case, 404 if unknown |
| GET | `/api/admins?status=` | dashboard header | responder roster |
| POST | `/api/escalations/:case_id/respond` | dashboard header | `{admin_id, action:"accept"\|"decline"}` → proxied to n8n ack webhook |
| PATCH | `/api/escalations/:case_id/resolve` | dashboard header | dashboard-only: sets `status:"resolved"` (no n8n call) |
| GET | `/health` | none | Render health check → `{ ok: true }` |

## Quick smoke test

```bash
set -a; source .env; set +a
curl -X POST http://localhost:3000/api/escalations/upsert \
  -H "Content-Type: application/json" \
  -H "$N8N_INTERNAL_AUTH_HEADER_NAME: $N8N_INTERNAL_AUTH_HEADER_VALUE" \
  -d '{"case_id":"test-1","chat_id":"999","status":"in_progress","severity_score":0.9,"severity_label":"emergency","patient":{"name":"Test Patient","age":45,"contact_number":"9876543210"},"symptoms":"chest pain","location":{"landmark":"near bus stand","decoded_location":"Ballia, UP"},"current_admin_id":"adm_001","current_admin_snapshot":{"name":"Dr. Asha Verma","designation":"ASHA Coordinator","phone":"9876543210"},"attempt_number":1}'

curl "http://localhost:3000/api/escalations?status=active" \
  -H "$DASHBOARD_API_AUTH_HEADER_NAME: $DASHBOARD_API_AUTH_HEADER_VALUE"
```
