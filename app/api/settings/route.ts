import { NextRequest } from "next/server";
import { ensureStorage, getDb } from "../../../db";
import { settings } from "../../../db/schema";
import { getSessionFromRequest, isAdmin } from "../../_lib/auth";

function withCors(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

function unauthorized() {
  return withCors(Response.json({ error: "Não autorizado. Faça login como Administrador." }, { status: 401 }));
}

export async function OPTIONS() {
  return withCors(new Response(null, { status: 204 }));
}

// GET: qualquer usuário autenticado pode ler as configurações
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    await ensureStorage();
    const db = getDb();
    const rows = await db.select().from(settings);
    const map = rows.reduce((acc, row) => { acc[row.key] = row.value; return acc; }, {} as Record<string, string>);
    return withCors(Response.json(map));
  } catch (err: unknown) {
    return withCors(Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 }));
  }
}

// POST: só Admin pode alterar configurações
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!isAdmin(session)) return unauthorized();

  try {
    const raw = await req.json();
    const payload = raw as Record<string, unknown>;
    if (!payload || typeof payload !== "object") {
      return withCors(Response.json({ error: "Payload inválido" }, { status: 400 }));
    }

    await ensureStorage();
    const db = getDb();

    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        const valStr = String(value);
        await db
          .insert(settings)
          .values({ key, value: valStr })
          .onConflictDoUpdate({ target: settings.key, set: { value: valStr } });
      }
    }

    return withCors(Response.json({ success: true }));
  } catch (err: unknown) {
    return withCors(Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 }));
  }
}
