import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customer: text("customer").notNull(),
    channel: text("channel").notNull().default("Site"),
    detail: text("detail").notNull(),
    // Valores monetários são persistidos em centavos para evitar arredondamento.
    total: integer("total").notNull(),
    time: text("time").notNull(),
    status: text("status").notNull().default("Novo"),
    feePending: integer("fee_pending", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_orders_created_at_id").on(table.createdAt, table.id),
  ],
);
