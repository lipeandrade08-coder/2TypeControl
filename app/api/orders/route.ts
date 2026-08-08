import { desc } from "drizzle-orm";
import { ensureOrdersStorage, getDb } from "../../../db";
import { orders } from "../../../db/schema";
import { NextRequest } from "next/server";
import { parseOrderPayload } from "./order-payload";

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
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    Vary: "Origin",
  };
}

function isAuthorized(request: NextRequest): boolean {
  const apiKey = process.env.ORDERS_API_KEY;
  return !apiKey || request.headers.get("x-api-key") === apiKey;
}

function publicRouteError(error: unknown): string {
  console.error("Orders API failed", error);
  return "Não foi possível processar os pedidos agora. Tente novamente em instantes.";
}

function publicOrder<T extends { total: number }>(order: T) {
  return { ...order, total: order.total / 100 };
}

function forbiddenOrigin() {
  return Response.json(
    { error: "Origem não autorizada." },
    { status: 403, headers: JSON_HEADERS },
  );
}

export async function GET(request: NextRequest) {
  const cors = corsHeaders(request);
  if (!cors) return forbiddenOrigin();

  try {
    await ensureOrdersStorage();
    const db = getDb();
    const rows = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(50);

    return Response.json(
      { orders: rows.map(publicOrder) },
      { headers: { ...JSON_HEADERS, ...cors } },
    );
  } catch (error) {
    return Response.json(
      { error: publicRouteError(error) },
      { status: 500, headers: { ...JSON_HEADERS, ...cors } },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const cors = corsHeaders(request);
  if (!cors) return forbiddenOrigin();

  return new Response(null, {
    status: 204,
    headers: cors,
  });
}

export async function POST(request: NextRequest) {
  const cors = corsHeaders(request);
  if (!cors) return forbiddenOrigin();
  if (!isAuthorized(request)) {
    return Response.json(
      { error: "Credencial inválida." },
      { status: 401, headers: { ...JSON_HEADERS, ...cors } },
    );
  }

  try {
    const payload = await request.json();
    const parsed = parseOrderPayload(payload);
    if (!parsed.ok) {
      return Response.json(
        { error: parsed.error },
        { status: 400, headers: { ...JSON_HEADERS, ...cors } },
      );
    }

    await ensureOrdersStorage();
    const db = getDb();
    const [order] = await db
      .insert(orders)
      .values(parsed.value)
      .returning();

    return Response.json(
      { order: publicOrder(order) },
      {
        status: 201,
        headers: { ...JSON_HEADERS, ...cors },
      },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "JSON inválido." },
        { status: 400, headers: { ...JSON_HEADERS, ...cors } },
      );
    }

    return Response.json(
      { error: publicRouteError(error) },
      {
        status: 500,
        headers: { ...JSON_HEADERS, ...cors },
      },
    );
  }
}
