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
    driver: text("driver"),
    driverFee: integer("driver_fee"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_orders_created_at_id").on(table.createdAt, table.id),
  ],
);

export const menu_items = sqliteTable("menu_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  sold: integer("sold").notNull().default(0),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
