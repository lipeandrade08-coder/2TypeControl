import { NextRequest } from "next/server";
import { ensureStorage, getDb } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { getSessionFromRequest, isAdmin, hashPassword } from "../../_lib/auth";

function withCors(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

function unauthorized() {
  return withCors(Response.json({ error: "Não autorizado. Faça login como Administrador." }, { status: 401 }));
}

type CreateUserPayload = { name: string; email: string; password: string; role: string };
type UpdateUserPayload = { id: number; name?: string; email?: string; password?: string; role?: string };

export async function OPTIONS() {
  return withCors(new Response(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!isAdmin(session)) return unauthorized();

  try {
    await ensureStorage();
    const db = getDb();
    const rows = await db.select().from(users);
    const safeUsers = rows.map(({ password: _pwd, ...user }) => user);
    return withCors(Response.json(safeUsers));
  } catch (err: unknown) {
    return withCors(Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 }));
  }
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!isAdmin(session)) return unauthorized();

  try {
    const raw = await req.json();
    const payload = raw as CreateUserPayload;

    if (!payload.name || !payload.email || !payload.password || !payload.role) {
      return withCors(Response.json({ error: "Todos os campos são obrigatórios" }, { status: 400 }));
    }

    await ensureStorage();
    const db = getDb();
    const hashedPassword = await hashPassword(payload.password);

    const [newUser] = await db
      .insert(users)
      .values({ name: payload.name, email: payload.email, password: hashedPassword, role: payload.role })
      .returning();

    const { password: _pwd, ...safeUser } = newUser;
    return withCors(Response.json(safeUser));
  } catch (err: unknown) {
    return withCors(Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 }));
  }
}

export async function DELETE(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!isAdmin(session)) return unauthorized();

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return withCors(Response.json({ error: "id é obrigatório" }, { status: 400 }));

    await ensureStorage();
    const db = getDb();
    await db.delete(users).where(eq(users.id, parseInt(id, 10)));
    return withCors(Response.json({ success: true }));
  } catch (err: unknown) {
    return withCors(Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 }));
  }
}

export async function PUT(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!isAdmin(session)) return unauthorized();

  try {
    const raw = await req.json();
    const payload = raw as UpdateUserPayload;
    if (!payload.id) return withCors(Response.json({ error: "id é obrigatório" }, { status: 400 }));

    await ensureStorage();
    const db = getDb();

    const updateData: Partial<{ name: string; email: string; password: string; role: string }> = {};
    if (payload.name) updateData.name = payload.name;
    if (payload.email) updateData.email = payload.email;
    if (payload.password) updateData.password = await hashPassword(payload.password);
    if (payload.role) updateData.role = payload.role;

    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, payload.id)).returning();
    const { password: _pwd, ...safeUser } = updatedUser;
    return withCors(Response.json(safeUser));
  } catch (err: unknown) {
    return withCors(Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 }));
  }
}
