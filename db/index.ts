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

export async function ensureOrdersStorage(): Promise<void> {
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
          created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
        )`),
        d1.prepare(`CREATE INDEX IF NOT EXISTS idx_orders_created_at_id
          ON orders (created_at DESC, id DESC)`),
      ])
      .then(() => undefined)
      .catch((error: unknown) => {
        initialization = undefined;
        throw error;
      });
  }

  return initialization;
}
