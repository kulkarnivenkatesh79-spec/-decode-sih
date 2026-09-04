# Arogya Dashboard Backend

Thin bridge between the `arogya_escalation_manager` n8n workflow and the
ArogyaSetu dashboard's **Critical Action Queue** + **Field Responders** panel.

```
n8n  ──POST /api/escalations/upsert──►  MongoDB  ◄──GET /api/escalations──  dashboard (polls ~8s)
n8n  ──POST /api/admins/upsert──────►  MongoDB  ◄──GET /api/admins───────  dashboard
dashboard ──POST /api/escalations/:id/respond──►  backend  ──POST /webhook/arogya-escalation-ack──►  n8n
```

The browser never holds n8n's internal secret — only this backend does.

## Setup

```bash
cd server
npm install
cp .env.example .env      # then fill in the values
npm start
```

Required `.env` keys are listed in `.env.example`. The server **refuses to start**
if any are missing.

- `DASHBOARD_API_AUTH_HEADER_NAME` / `_VALUE` — must match n8n's *"Arogya Dashboard API Auth"* credential (validates inbound calls from n8n).
- `N8N_INTERNAL_AUTH_HEADER_NAME` / `_VALUE` — must match n8n's *"Arogya Internal Webhook Auth"* credential (attached to the outbound ack call).
- `N8N_ESCALATION_MANAGER_BASE_URL` — e.g. `https://mayank12345.app.n8n.cloud`

The backend also serves the dashboard (`index.html` in the repo root) at
`http://localhost:<PORT>` so a demo can run same-origin. If you serve the
frontend elsewhere, edit `window.ESCALATION_API_BASE` in `index.html`.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/escalations/upsert` | dashboard header | n8n pushes one escalation (keyed by `case_id`) |
| POST | `/api/admins/upsert` | dashboard header | n8n / seed pushes one admin (keyed by `admin_id`) |
| GET | `/api/escalations?status=active\|all` | none | queue read, sorted by `severity_score desc, created_at asc` |
| GET | `/api/escalations/:case_id` | none | single case |
| GET | `/api/admins` | none | responder roster |
| POST | `/api/escalations/:case_id/respond` | none | `{admin_id, action:"accept"\|"decline"}` → proxied to n8n ack webhook |
| PATCH | `/api/escalations/:case_id/resolve` | none | dashboard-only: sets `status:"resolved"` (no n8n call) |

## Quick smoke test

```bash
source .env
curl -X POST http://localhost:3000/api/escalations/upsert \
  -H "Content-Type: application/json" \
  -H "$DASHBOARD_API_AUTH_HEADER_NAME: $DASHBOARD_API_AUTH_HEADER_VALUE" \
  -d '{"case_id":"test-1","chat_id":"999","status":"in_progress","severity_score":0.9,"severity_label":"emergency","patient":{"name":"Test Patient","age":45,"contact_number":"9876543210"},"symptoms":"chest pain","location":{"landmark":"near bus stand","decoded_location":"Ballia, UP"},"current_admin_id":"adm_001","current_admin_snapshot":{"name":"Dr. Asha Verma","designation":"ASHA Coordinator","phone":"9876543210"},"attempt_number":1,"created_at":"2026-01-01T00:00:00Z","updated_at":"2026-01-01T00:00:00Z"}'

curl "http://localhost:3000/api/escalations?status=active"
```
