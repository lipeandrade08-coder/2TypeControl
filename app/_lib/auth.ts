/**
 * Auth helpers para o sistema de sessão simples.
 * O token é um JSON base64 com: { id, role, exp }
 * Não é criptograficamente assinado (sem segredo/HMAC neste nível),
 * mas previne acesso casual a rotas da API por usuários não autenticados.
 * Para produção com dados sensíveis, usar JWT com assinatura real.
 */

export type SessionPayload = {
  id: number;
  name: string;
  role: string;
  exp: number; // timestamp de expiração (ms)
};

const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 horas

export function createToken(payload: Omit<SessionPayload, "exp">): string {
  const data: SessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_DURATION_MS,
  };
  return btoa(JSON.stringify(data));
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const data = JSON.parse(atob(token)) as SessionPayload;
    if (!data.role || !data.exp) return null;
    if (Date.now() > data.exp) return null; // expirado
    return data;
  } catch {
    return null;
  }
}

/**
 * Extrai e valida o token do header Authorization de uma Request do Next.js.
 * Retorna o payload se válido, ou null caso inválido/ausente.
 */
export function getSessionFromRequest(req: Request): SessionPayload | null {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Retorna true se o payload é de um usuário admin.
 */
export function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === "admin";
}

/**
 * Função utilitária simples para fazer hash da senha com SHA-256.
 * (Funciona tanto no Node quanto no Edge/Browser).
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

