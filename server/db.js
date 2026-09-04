'use strict';

const { MongoClient } = require('mongodb');
const config = require('./config');

/**
 * Single shared MongoClient. The n8n workflows already treat `escalations` and
 * `admins` as plain document collections keyed by `case_id` / `admin_id`
 * (NOT Mongo's `_id`), so we do the same here — no ODM, no schema layer.
 */

let client;
let db;

async function connect() {
  if (db) return db;
  client = new MongoClient(config.mongoUri, {
    serverSelectionTimeoutMS: 8000,
  });
  await client.connect();
  db = client.db(config.mongoDbName);
  // Touch the server so a bad URI fails at startup, not on first request
  // (the bootstrap in index.js turns this into a loud process.exit(1)).
  await db.command({ ping: 1 });
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not connected — call connect() first');
  return db;
}

const escalations = () => getDb().collection('escalations');
const admins = () => getDb().collection('admins');

async function close() {
  if (client) await client.close();
  client = undefined;
  db = undefined;
}

module.exports = { connect, getDb, escalations, admins, close };
