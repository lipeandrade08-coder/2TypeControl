import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { orders } from "../../../db/schema";
import { NextRequest } from "next/server";

function toRouteErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const detail =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const combined = `${message}\n${detail}`;

  if (combined.includes("no such table") || combined.includes('from "orders"')) {
    return "The orders table is unavailable. Generate the migration locally with `npm run db:generate`, then deploy so the platform can apply the generated SQL to the real D1 database.";
  }

  return message;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(50);

    return Response.json({ orders: rows });
  } catch (error) {
    return Response.json(
      { error: toRouteErrorMessage(error) },
      { status: 500 }
    );
  }
}

// Configurar o CORS para aceitar requests do index.html (Barbosa Restaurante)
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      customer?: string;
      channel?: string;
      detail?: string;
      total?: number;
      time?: string;
      status?: string;
      feePending?: boolean;
    };
    
    const customer = payload.customer?.trim() ?? "Cliente";
    const detail = payload.detail?.trim() ?? "Pedido sem detalhes";
    const total = payload.total ?? 0;
    const channel = payload.channel ?? "Site";
    const status = payload.status ?? "Novo";
    const feePending = payload.feePending ?? false;
    const time = payload.time ?? "agora";

    const db = getDb();
    const [order] = await db.insert(orders).values({ 
      customer, 
      channel, 
      detail, 
      total, 
      time, 
      status, 
      feePending 
    }).returning();
    
    return Response.json(
      { order }, 
      { 
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
        }
      }
    );
  } catch (error) {
    return Response.json(
      { error: toRouteErrorMessage(error) },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        }
      }
    );
  }
}
