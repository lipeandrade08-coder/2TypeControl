import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

let initialization: Promise<void> | undefined;

export function getD1() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return env.DB;
}

export function getDb() {
  return drizzle(getD1(), { schema });
}

export async function ensureStorage(): Promise<void> {
  if (!initialization) {
    const d1 = getD1();
    initialization = d1
      .batch([
        d1.prepare(`CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          customer TEXT NOT NULL,
          channel TEXT DEFAULT 'Site' NOT NULL,
          detail TEXT NOT NULL,
          total INTEGER NOT NULL,
          time TEXT NOT NULL,
          status TEXT DEFAULT 'Novo' NOT NULL,
          fee_pending INTEGER DEFAULT 0 NOT NULL,
          driver TEXT,
          driver_fee INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
        )`),
        
        d1.prepare(`CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        )`),
        d1.prepare(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
        )`),
        d1.prepare(`CREATE TABLE IF NOT EXISTS menu_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          price INTEGER NOT NULL,
          sold INTEGER DEFAULT 0 NOT NULL,
          available INTEGER DEFAULT 1 NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
        )`),
        d1.prepare(`CREATE INDEX IF NOT EXISTS idx_orders_created_at_id
          ON orders (created_at DESC, id DESC)`),
      ])
      .then(() => {
        // Safe alter tables for missing columns in existing local DBs
        d1.exec(`ALTER TABLE orders ADD COLUMN driver TEXT`).catch(() => {});
        d1.exec(`ALTER TABLE orders ADD COLUMN driver_fee INTEGER`).catch(() => {});
        return undefined;
      })
      .catch((error: unknown) => {
        initialization = undefined;
        throw error;
      });
  }

  return initialization;
}
