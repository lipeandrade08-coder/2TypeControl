export const ORDER_CHANNELS = ["WhatsApp", "Site", "Salão"] as const;
export const ORDER_STATUSES = [
  "Novo",
  "Confirmado",
  "Em preparo",
  "Pronto",
  "Saiu",
] as const;

type OrderChannel = (typeof ORDER_CHANNELS)[number];
type OrderStatus = (typeof ORDER_STATUSES)[number];

export type ParsedOrder = {
  customer: string;
  channel: OrderChannel;
  detail: string;
  total: number;
  time: string;
  status: OrderStatus;
  feePending: boolean;
};

export type OrderPayloadResult =
  | { ok: true; value: ParsedOrder }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(
  value: unknown,
  fallback: string,
  field: string,
  maxLength: number,
): { ok: true; value: string } | { ok: false; error: string } {
  if (value === undefined || value === null) {
    return { ok: true, value: fallback };
  }
  if (typeof value !== "string") {
    return { ok: false, error: `${field} deve ser um texto.` };
  }

  const cleaned = value.trim() || fallback;
  if (cleaned.length > maxLength) {
    return {
      ok: false,
      error: `${field} deve ter no máximo ${maxLength} caracteres.`,
    };
  }
  return { ok: true, value: cleaned };
}

export function parseOrderPayload(payload: unknown): OrderPayloadResult {
  if (!isRecord(payload)) {
    return { ok: false, error: "O corpo da requisição deve ser um objeto JSON." };
  }

  const customer = cleanText(payload.customer, "Cliente", "customer", 120);
  if (!customer.ok) return customer;

  const detail = cleanText(
    payload.detail,
    "Pedido sem detalhes",
    "detail",
    500,
  );
  if (!detail.ok) return detail;

  const time = cleanText(payload.time, "agora", "time", 40);
  if (!time.ok) return time;

  const channel = payload.channel ?? "Site";
  if (!ORDER_CHANNELS.includes(channel as OrderChannel)) {
    return { ok: false, error: "channel inválido." };
  }

  const status = payload.status ?? "Novo";
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    return { ok: false, error: "status inválido." };
  }

  const total = payload.total ?? 0;
  if (
    typeof total !== "number" ||
    !Number.isFinite(total) ||
    total < 0 ||
    total > 1_000_000
  ) {
    return {
      ok: false,
      error: "total deve ser um número entre 0 e 1.000.000.",
    };
  }

  const feePending = payload.feePending ?? false;
  if (typeof feePending !== "boolean") {
    return { ok: false, error: "feePending deve ser booleano." };
  }

  return {
    ok: true,
    value: {
      customer: customer.value,
      channel: channel as OrderChannel,
      detail: detail.value,
      total: Math.round(total * 100),
      time: time.value,
      status: status as OrderStatus,
      feePending,
    },
  };
}
