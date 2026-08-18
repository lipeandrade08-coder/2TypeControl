import { eq } from "drizzle-orm";
import { ensureStorage, getDb } from "../../../../db";
import { menu_items } from "../../../../db/schema";
import { NextRequest } from "next/server";

const JSON_HEADERS = { "Cache-Control": "no-store" };

function corsHeaders(request: NextRequest): Record<string, string> | null {
  const origin = request.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    Vary: "Origin",
  };
}

export async function OPTIONS(request: NextRequest) {
  const cors = corsHeaders(request) || {};
  return new Response(null, { status: 204, headers: cors });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cors = corsHeaders(request) || {};

  try {
    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) throw new Error("ID inválido");

    const payload = (await request.json()) as any;
    await ensureStorage();
    const db = getDb();

    const updateData: any = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.category !== undefined) updateData.category = payload.category;
    if (payload.price !== undefined) updateData.price = payload.price;
    if (payload.available !== undefined) updateData.available = payload.available;

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "Sem dados." }, { status: 400, headers: { ...JSON_HEADERS, ...cors } });
    }

    const [updated] = await db
      .update(menu_items)
      .set(updateData)
      .where(eq(menu_items.id, itemId))
      .returning();

    if (!updated) {
      return Response.json({ error: "Item não encontrado." }, { status: 404, headers: { ...JSON_HEADERS, ...cors } });
    }

    return Response.json({ item: updated }, { status: 200, headers: { ...JSON_HEADERS, ...cors } });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500, headers: { ...JSON_HEADERS, ...cors } });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cors = corsHeaders(request) || {};

  try {
    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) throw new Error("ID inválido");

    await ensureStorage();
    const db = getDb();

    const [deleted] = await db
      .delete(menu_items)
      .where(eq(menu_items.id, itemId))
      .returning();

    if (!deleted) {
      return Response.json({ error: "Item não encontrado." }, { status: 404, headers: { ...JSON_HEADERS, ...cors } });
    }

    return Response.json({ success: true }, { status: 200, headers: { ...JSON_HEADERS, ...cors } });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500, headers: { ...JSON_HEADERS, ...cors } });
  }
}
