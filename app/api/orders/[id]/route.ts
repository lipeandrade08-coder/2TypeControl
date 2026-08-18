import { eq } from "drizzle-orm";
import { ensureStorage, getDb } from "../../../../db";
import { orders } from "../../../../db/schema";
import { NextRequest } from "next/server";

const JSON_HEADERS = { "Cache-Control": "no-store" };

function allowedOrigins(request: NextRequest): Set<string> {
  const configured = (process.env.ORDERS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  configured.push(request.nextUrl.origin);
  return new Set(configured);
}

function corsHeaders(request: NextRequest): Record<string, string> | null {
  const origin = request.headers.get("origin");
  if (!origin) return {};
  if (!allowedOrigins(request).has(origin)) return null;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    Vary: "Origin",
  };
}

function isAuthorized(request: NextRequest): boolean {
  const apiKey = process.env.ORDERS_API_KEY;
  return !apiKey || request.headers.get("x-api-key") === apiKey;
}

export async function OPTIONS(request: NextRequest) {
  const cors = corsHeaders(request);
  if (!cors) return Response.json({ error: "Origem não autorizada." }, { status: 403, headers: JSON_HEADERS });

  return new Response(null, {
    status: 204,
    headers: cors,
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cors = corsHeaders(request);
  if (!cors) return Response.json({ error: "Origem não autorizada." }, { status: 403, headers: JSON_HEADERS });
  if (!isAuthorized(request)) {
    return Response.json({ error: "Credencial inválida." }, { status: 401, headers: { ...JSON_HEADERS, ...cors } });
  }

  const { id } = await params;

  try {
    const payload = await request.json();
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) throw new Error("ID inválido");

    await ensureStorage();
    const db = getDb();

    // build update payload
    const updateData: any = {};
    if (payload.status) updateData.status = payload.status;
    if (payload.feePending !== undefined) updateData.feePending = payload.feePending;
    if (payload.driver) updateData.driver = payload.driver;
    if (payload.driverFee !== undefined) updateData.driverFee = payload.driverFee;
    if (payload.total !== undefined) updateData.total = payload.total;

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "Nenhum dado para atualizar." }, { status: 400, headers: { ...JSON_HEADERS, ...cors } });
    }

    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    if (!updated) {
      return Response.json({ error: "Pedido não encontrado." }, { status: 404, headers: { ...JSON_HEADERS, ...cors } });
    }

    return Response.json({ order: updated }, { status: 200, headers: { ...JSON_HEADERS, ...cors } });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500, headers: { ...JSON_HEADERS, ...cors } });
  }
}
