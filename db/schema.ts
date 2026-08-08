import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customer: text("customer").notNull(),
  channel: text("channel").notNull().default("Site"),
  detail: text("detail").notNull(),
  total: integer("total").notNull(), // Assuming total in cents, or we can use real. Let's use real for R$
  time: text("time").notNull(), // We can store the human readable time, or just let created_at handle it
  status: text("status").notNull().default("Novo"),
  feePending: integer("fee_pending", { mode: 'boolean' }).default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
