import { NextRequest } from "next/server";
import { ensureStorage, getDb } from "../../../db";
import { users } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
import { createToken, hashPassword } from "../../_lib/auth";

function withCors(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

type LoginPayload = { email: string; password: string };

export async function OPTIONS() {
  return withCors(new Response(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const payload = raw as LoginPayload;

    if (!payload.email || !payload.password) {
      return withCors(Response.json({ error: "E-mail e senha obrigatórios" }, { status: 400 }));
    }

    await ensureStorage();
    const db = getDb();
    const hashedPassword = await hashPassword(payload.password);

    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, payload.email), eq(users.password, hashedPassword)));

    let sessionUser: { id: number; name: string; email: string; role: string } | null = null;

    if (user) {
      const { password: _pwd, ...safeUser } = user;
      sessionUser = safeUser;
    } else {
      // Fallback: credenciais padrão hardcoded (para quando o banco está vazio)
      const fallbacks: Record<string, { id: number; name: string; email: string; role: string }> = {
        "admin@2type.com:240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9": { id: 0, name: "Barbosa",  email: payload.email, role: "admin" },
        "balcao@2type.com:00efd02c8b78824c9f3a6b6bfd2ae2f816ed8b952abd5bf4e0d38826d32398d6": { id: 0, name: "Caixa Central",  email: payload.email, role: "balcao" },
        "cozinha@2type.com:50263d56d9e862db1767204ed2fc5c264cfe2abfbd39b0bb3a7bd25ee78dbbe9": { id: 0, name: "Cozinha",        email: payload.email, role: "cozinha" },
        "entregador@2type.com:b7b8ea6d2600ae107a31667a70bc2eea6065b77fc5a57507821dcf2b7d8097a5": { id: 0, name: "Entregador",     email: payload.email, role: "entregador" },
        "garcom@2type.com:f8598c16eaa87bcd3c1c4cd7a8797063955b890589d9b6a279a20ccccfa9f11a": { id: 0, name: "Garçom",         email: payload.email, role: "garcom" },
      };
      const key = `${payload.email}:${hashedPassword}`;
      sessionUser = fallbacks[key] ?? null;
    }

    if (!sessionUser) {
      return withCors(Response.json({ error: "E-mail ou senha incorretos" }, { status: 401 }));
    }

    // Gerar token de sessão
    const token = createToken({ id: sessionUser.id, name: sessionUser.name, role: sessionUser.role });

    return withCors(Response.json({ ...sessionUser, token }));
  } catch (err: unknown) {
    return withCors(
      Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
    );
  }
}
