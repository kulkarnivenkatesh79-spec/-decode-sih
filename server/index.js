'use strict';

/**
 * Arogya Dashboard Backend
 * ------------------------
 * A thin, honest layer between the `arogya_escalation_manager` n8n workflow and
 * the ArogyaSetu dashboard's Critical Action Queue:
 *
 *   n8n  --POST /api/escalations/upsert-->  Mongo  <--GET /api/escalations--  dashboard
 *   n8n  --POST /api/admins/upsert------->  Mongo  <--GET /api/admins-------  dashboard
 *
 *   dashboard --POST /api/escalations/:id/respond--> this backend --POST /webhook/arogya-escalation-ack--> n8n
 *
 * The browser never holds n8n's internal secret; only this backend does.
 */

const path = require('path');
const express = require('express');
const cors = require('cors');

const config = require('./config');
const dbClient = require('./db');

const app = express();

// CORS: only the dashboard origin(s) in ALLOWED_ORIGIN may call this API.
// GET/POST only, and the custom auth header names must be allowed through.
app.use(cors({
  origin(origin, cb) {
    // Non-browser callers (curl, n8n, health checks) send no Origin — allow them;
    // the per-route auth guards are what actually gate those requests.
    if (!origin || config.allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`origin ${origin} not allowed by CORS`));
  },
  // GET/POST per the API contract; PATCH is only for the dashboard-only
  // /api/escalations/:id/resolve bookkeeping route.
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', config.n8nInternalAuthHeaderName, config.dashboardAuthHeaderName],
}));
app.use(express.json({ limit: '256kb' }));

/* ------------------------------------------------------------------ logging */

function log(scope, msg, extra) {
  const stamp = new Date().toISOString();
  if (extra !== undefined) {
    console.log(`[${stamp}] [${scope}] ${msg}`, extra);
  } else {
    console.log(`[${stamp}] [${scope}] ${msg}`);
  }
}

/* --------------------------------------------------------- auth guards */

// Guards the INBOUND POST /upsert routes — the shared secret n8n attaches on
// its HTTP Request nodes (Header Auth credential). Express lower-cases incoming
// header names; config.n8nInternalAuthHeaderName is already lower-cased.
function requireN8nAuth(req, res, next) {
  const got = req.headers[config.n8nInternalAuthHeaderName];
  if (!got || got !== config.n8nInternalAuthHeaderValue) {
    log('auth', `401 rejected ${req.method} ${req.path} (n8n header "${config.n8nInternalAuthHeaderName}" missing/mismatch)`);
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  return next();
}

// Guards the dashboard GET reads. IMPORTANT: this header/value pair is a static
// string baked into the frontend JS that every browser visitor downloads. It
// keeps casual scrapers off the read endpoints; it is NOT authentication and
// will not stop anyone who opens devtools. Treat these endpoints as public.
function requireDashboardAuth(req, res, next) {
  const got = req.headers[config.dashboardAuthHeaderName];
  if (!got || got !== config.dashboardAuthHeaderValue) {
    log('auth', `401 rejected ${req.method} ${req.path} (dashboard header "${config.dashboardAuthHeaderName}" missing/mismatch)`);
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  return next();
}

/* ============================================================= INBOUND (n8n) */

// n8n upserts a single escalation, keyed by case_id. Any node in the workflow
// (intake, admin-assignment, timeout, ack) may fire with a variable subset of
// fields — case_id is the only guaranteed one.
app.post('/api/escalations/upsert', requireN8nAuth, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.case_id) {
      log('upsert', `400 escalation missing case_id`);
      return res.status(400).json({ ok: false, error: 'case_id is required' });
    }

    const now = new Date().toISOString();
    const { case_id, _id, created_at, ...rest } = body; // never let a caller set _id
    // `created_at` is fixed at first insert — keep it out of $set so it can't
    // collide with $setOnInsert (Mongo rejects the same path in both).
    const doc = { ...rest, updated_at: now }; // always server-set; don't trust a stale client value

    await dbClient.escalations().updateOne(
      { case_id },
      { $set: doc, $setOnInsert: { case_id, created_at: created_at || now } },
      { upsert: true },
    );

    log('upsert', `escalation ${case_id} status=${body.status || '?'} severity=${body.severity_label || '?'} admin=${body.current_admin_id || 'unassigned'}`);
    return res.json({ ok: true, case_id });
  } catch (err) {
    log('upsert', `500 escalation upsert failed (case_id=${req.body && req.body.case_id}): ${err.message}`);
    return res.status(500).json({ ok: false, error: 'internal error' });
  }
});

// n8n upserts an admin — only on the "not working" path, so partial updates
// ({ admin_id, status, marked_unavailable_at, marked_unavailable_reason,
// last_case_id }) are expected. Otherwise the roster is seeded by hand.
app.post('/api/admins/upsert', requireN8nAuth, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.admin_id) {
      log('upsert', `400 admin missing admin_id`);
      return res.status(400).json({ ok: false, error: 'admin_id is required' });
    }

    const now = new Date().toISOString();
    const { admin_id, _id, created_at, ...rest } = body;
    const doc = { ...rest, updated_at: now };

    await dbClient.admins().updateOne(
      { admin_id },
      { $set: doc, $setOnInsert: { admin_id, created_at: created_at || now } },
      { upsert: true },
    );

    log('upsert', `admin ${admin_id} status=${body.status || '?'}`);
    return res.json({ ok: true, admin_id });
  } catch (err) {
    log('upsert', `500 admin upsert failed (admin_id=${req.body && req.body.admin_id}): ${err.message}`);
    return res.status(500).json({ ok: false, error: 'internal error' });
  }
});

/* ============================================================ READ (dashboard) */

const ACTIVE_STATUSES = ['pending', 'in_progress'];

// `status`: exact match, or the convenience values "active" (default — pending +
// in_progress) / "all". `limit`: default 50, capped at 200.
app.get('/api/escalations', requireDashboardAuth, async (req, res) => {
  try {
    const status = (req.query.status || 'active').toLowerCase();
    let filter = {};
    if (status === 'active') {
      filter = { status: { $in: ACTIVE_STATUSES } };
    } else if (status !== 'all') {
      filter = { status };
    }

    let limit = parseInt(req.query.limit, 10);
    if (!Number.isFinite(limit) || limit <= 0) limit = 50;
    limit = Math.min(limit, 200);

    const cases = await dbClient.escalations()
      .find(filter, { projection: { _id: 0 } })
      // most severe, longest-waiting first; updated_at breaks ties
      .sort({ severity_score: -1, created_at: 1, updated_at: -1 })
      .limit(limit)
      .toArray();

    return res.json({ ok: true, count: cases.length, escalations: cases });
  } catch (err) {
    log('read', `500 GET /api/escalations failed (status=${req.query.status}): ${err.message}`);
    return res.status(500).json({ ok: false, error: 'internal error' });
  }
});

app.get('/api/escalations/:case_id', requireDashboardAuth, async (req, res) => {
  try {
    const doc = await dbClient.escalations().findOne(
      { case_id: req.params.case_id },
      { projection: { _id: 0 } },
    );
    if (!doc) {
      log('read', `404 GET /api/escalations/${req.params.case_id} — not found`);
      return res.status(404).json({ ok: false, error: 'not found' });
    }
    return res.json({ ok: true, escalation: doc });
  } catch (err) {
    log('read', `500 GET /api/escalations/${req.params.case_id} failed: ${err.message}`);
    return res.status(500).json({ ok: false, error: 'internal error' });
  }
});

app.get('/api/admins', requireDashboardAuth, async (req, res) => {
  try {
    const filter = req.query.status ? { status: String(req.query.status).toLowerCase() } : {};
    const roster = await dbClient.admins()
      .find(filter, { projection: { _id: 0 } })
      .sort({ priority: 1, name: 1 })
      .toArray();
    return res.json({ ok: true, count: roster.length, admins: roster });
  } catch (err) {
    log('read', `500 GET /api/admins failed (status=${req.query.status}): ${err.message}`);
    return res.status(500).json({ ok: false, error: 'internal error' });
  }
});

/* =========================================================== ACT (dashboard) */

// Proxy the dashboard's Accept / Reassign click into n8n's ack webhook.
app.post('/api/escalations/:case_id/respond', requireDashboardAuth, async (req, res) => {
  const caseId = req.params.case_id;
  const { admin_id: adminId, action } = req.body || {};

  if (!adminId || !action) {
    return res.status(400).json({ ok: false, error: 'admin_id and action are required' });
  }
  if (action !== 'accept' && action !== 'decline') {
    return res.status(400).json({ ok: false, error: 'action must be "accept" or "decline"' });
  }

  const payload = { case_id: caseId, admin_id: adminId, action };
  log('respond', `--> n8n ack webhook case=${caseId} admin=${adminId} action=${action}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const upstream = await fetch(config.n8nAckWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [config.n8nInternalAuthHeaderName]: config.n8nInternalAuthHeaderValue,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await upstream.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { ok: upstream.ok, message: text };
    }

    log('respond', `<-- n8n ${upstream.status} case=${caseId} action=${action}`, data);

    if (!upstream.ok) {
      return res.status(502).json({
        ok: false,
        error: 'n8n rejected the acknowledgement',
        status: upstream.status,
        message: data && data.message ? data.message : text,
      });
    }

    return res.json({
      ok: data.ok !== undefined ? data.ok : true,
      message: data.message || 'Acknowledgement delivered to escalation manager.',
    });
  } catch (err) {
    const reason = err.name === 'AbortError' ? 'timed out' : err.message;
    log('respond', `502 n8n ack call failed (${reason}) case=${caseId} action=${action}`);
    return res.status(502).json({
      ok: false,
      error: `Could not reach the escalation manager (${reason}). The responder was not notified.`,
    });
  } finally {
    clearTimeout(timeout);
  }
});

// Dashboard-only bookkeeping. Does NOT call n8n — by the time a case is
// acknowledged, n8n's retry/timeout loop has already stopped watching it.
// This just lets a PHC Medical Officer archive a case out of the active queue.
app.patch('/api/escalations/:case_id/resolve', requireDashboardAuth, async (req, res) => {
  try {
    const caseId = req.params.case_id;
    const now = new Date().toISOString();
    const result = await dbClient.escalations().findOneAndUpdate(
      { case_id: caseId },
      {
        $set: {
          status: 'resolved',
          updated_at: now,
          ended_at: now,
          end_reason: (req.body && req.body.reason) || 'resolved_from_dashboard',
        },
      },
      { returnDocument: 'after', projection: { _id: 0 } },
    );

    const doc = result && (result.value || result); // driver v5 vs v6 shape
    if (!doc || !doc.case_id) return res.status(404).json({ ok: false, error: 'not found' });

    log('resolve', `case ${caseId} marked resolved from dashboard`);
    return res.json({ ok: true, escalation: doc });
  } catch (err) {
    log('resolve', `500 PATCH resolve failed: ${err.message}`);
    return res.status(500).json({ ok: false, error: 'internal error' });
  }
});

/* ------------------------------------------------------- health + static UI */

// Render's health check hits this — must stay unauthenticated and cheap.
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'arogya-dashboard-backend' }));

// Serve the existing dashboard (repo root) so a demo can run from one origin.
app.use(express.static(path.join(__dirname, '..')));

// JSON 404 for unmatched /api routes.
app.use('/api', (req, res) => res.status(404).json({ ok: false, error: 'not found' }));

/* --------------------------------------------------------------- bootstrap */

(async () => {
  try {
    await dbClient.connect();
    log('startup', `MongoDB connected (db="${config.mongoDbName}")`);
  } catch (err) {
    console.error(`[startup] FATAL — could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  app.listen(config.port, () => {
    log('startup', `listening on http://localhost:${config.port}`);
    log('startup', `n8n ack webhook target: ${config.n8nAckWebhookUrl}`);
  });
})();

process.on('SIGINT', async () => {
  await dbClient.close();
  process.exit(0);
});
