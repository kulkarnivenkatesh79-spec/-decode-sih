'use strict';

/**
 * Central configuration. Loads `.env`, validates that every required variable
 * is present, and fails fast (process.exit(1)) with a clear message otherwise —
 * a half-configured server that only breaks on the first real request is the
 * worst thing to debug live during a demo.
 */

require('dotenv').config();

// Vars with no sensible default. `MONGO_DB_NAME` is intentionally absent — it
// defaults to "sih" (the existing Atlas cluster) below.
const REQUIRED = [
  'MONGO_URI',
  'DASHBOARD_API_AUTH_HEADER_NAME',
  'DASHBOARD_API_AUTH_HEADER_VALUE',
  'N8N_INTERNAL_AUTH_HEADER_NAME',
  'N8N_INTERNAL_AUTH_HEADER_VALUE',
  'ALLOWED_ORIGIN',
  'N8N_ESCALATION_MANAGER_BASE_URL',
];

const missing = REQUIRED.filter((key) => !process.env[key] || !String(process.env[key]).trim());

if (missing.length) {
  console.error('\n[config] FATAL — missing required environment variables:\n');
  missing.forEach((key) => console.error(`  - ${key}`));
  console.error('\nCopy server/.env.example to server/.env and fill in the values.\n');
  process.exit(1);
}

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoUri: process.env.MONGO_URI.trim(),
  mongoDbName: (process.env.MONGO_DB_NAME || 'sih').trim(),

  // Shared secret n8n attaches on its HTTP Request nodes (Header Auth
  // credential). Guards the inbound POST /upsert routes. Express lower-cases
  // incoming header names, so we lower-case the expected name to match.
  n8nInternalAuthHeaderName: process.env.N8N_INTERNAL_AUTH_HEADER_NAME.trim().toLowerCase(),
  n8nInternalAuthHeaderValue: process.env.N8N_INTERNAL_AUTH_HEADER_VALUE,

  // Shared secret the dashboard frontend sends on GET reads. NOTE: this is a
  // static string baked into frontend JS — it only deters casual scraping of
  // the read endpoints, it is not real authentication against a determined
  // attacker. Same lower-casing note as above.
  dashboardAuthHeaderName: process.env.DASHBOARD_API_AUTH_HEADER_NAME.trim().toLowerCase(),
  dashboardAuthHeaderValue: process.env.DASHBOARD_API_AUTH_HEADER_VALUE,

  // Origin(s) allowed via CORS. Comma-separated list supported.
  allowedOrigins: process.env.ALLOWED_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),

  // This backend attaches n8nInternalAuth* on OUTBOUND calls to n8n's ack webhook.
  n8nEscalationManagerBaseUrl: process.env.N8N_ESCALATION_MANAGER_BASE_URL.trim().replace(/\/+$/, ''),
};

config.n8nAckWebhookUrl = `${config.n8nEscalationManagerBaseUrl}/webhook/arogya-escalation-ack`;

module.exports = config;
