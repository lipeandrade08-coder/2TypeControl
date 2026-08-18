import { desc } from "drizzle-orm";
import { ensureStorage, getDb } from "../../../db";
import { menu_items } from "../../../db/schema";
import { NextRequest } from "next/server";

const JSON_HEADERS = { "Cache-Control": "no-store" };

function corsHeaders(request: NextRequest): Record<string, string> | null {
  const origin = request.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    Vary: "Origin",
  };
}

export async function GET(request: NextRequest) {
  const cors = corsHeaders(request) || {};

  try {
    await ensureStorage();
    const db = getDb();
    const rows = await db
      .select()
      .from(menu_items)
      .orderBy(desc(menu_items.id));

    if (rows.length === 0) {
      // Seed data if DB is empty
      const { initialMenuItems } = await import("../../_data/mock-data");
      for (const io of initialMenuItems) {
        await db.insert(menu_items).values({
          name: io.name,
          category: io.category,
          price: io.price,
          sold: io.sold,
          available: io.available,
        }).catch(() => {});
      }
      const seeded = await db.select().from(menu_items).orderBy(desc(menu_items.id));
      return Response.json({ items: seeded }, { headers: { ...JSON_HEADERS, ...cors } });
    }

    return Response.json(
      { items: rows },
      { headers: { ...JSON_HEADERS, ...cors } },
    );
  } catch (error) {
    return Response.json(
      { error: "Erro ao carregar cardápio" },
      { status: 500, headers: { ...JSON_HEADERS, ...cors } },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const cors = corsHeaders(request) || {};
  return new Response(null, { status: 204, headers: cors });
}

export async function POST(request: NextRequest) {
  const cors = corsHeaders(request) || {};

  try {
    const payload = await request.json();
    if (!payload.name || !payload.category || payload.price === undefined) {
      return Response.json({ error: "Dados inválidos." }, { status: 400, headers: { ...JSON_HEADERS, ...cors } });
    }

    await ensureStorage();
    const db = getDb();
    const [item] = await db
      .insert(menu_items)
      .values({
        name: payload.name,
        category: payload.category,
        price: payload.price,
        sold: payload.sold || 0,
        available: payload.available !== undefined ? payload.available : true,
      })
      .returning();

    return Response.json({ item }, { status: 201, headers: { ...JSON_HEADERS, ...cors } });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500, headers: { ...JSON_HEADERS, ...cors } });
  }
}
