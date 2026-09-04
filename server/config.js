'use strict';

/**
 * Central configuration. Loads `.env`, validates that every required variable
 * is present, and fails fast (process.exit(1)) with a clear message otherwise —
 * a half-configured server that only breaks on the first real request is the
 * worst thing to debug live during a demo.
 */

require('dotenv').config();

const REQUIRED = [
  'MONGODB_URI',
  'MONGODB_DB_NAME',
  'DASHBOARD_API_AUTH_HEADER_NAME',
  'DASHBOARD_API_AUTH_HEADER_VALUE',
  'N8N_INTERNAL_AUTH_HEADER_NAME',
  'N8N_INTERNAL_AUTH_HEADER_VALUE',
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
  mongoUri: process.env.MONGODB_URI.trim(),
  mongoDbName: process.env.MONGODB_DB_NAME.trim(),

  // Header the dashboard-API expects on inbound calls FROM n8n.
  dashboardAuthHeaderName: process.env.DASHBOARD_API_AUTH_HEADER_NAME.trim().toLowerCase(),
  dashboardAuthHeaderValue: process.env.DASHBOARD_API_AUTH_HEADER_VALUE,

  // Header this backend attaches on OUTBOUND calls TO n8n's ack webhook.
  n8nInternalAuthHeaderName: process.env.N8N_INTERNAL_AUTH_HEADER_NAME.trim(),
  n8nInternalAuthHeaderValue: process.env.N8N_INTERNAL_AUTH_HEADER_VALUE,

  n8nEscalationManagerBaseUrl: process.env.N8N_ESCALATION_MANAGER_BASE_URL.trim().replace(/\/+$/, ''),
};

config.n8nAckWebhookUrl = `${config.n8nEscalationManagerBaseUrl}/webhook/arogya-escalation-ack`;

module.exports = config;
