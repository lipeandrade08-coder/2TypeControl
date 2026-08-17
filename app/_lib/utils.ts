import type { Order } from "../_types";

// ─── Formatação de moeda ───────────────────────────────────────────────────
export const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

// ─── Validação de pedido (type guard) ─────────────────────────────────────
export function isOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Partial<Order>;
  return (
    typeof o.id === "number" &&
    typeof o.customer === "string" &&
    (o.channel === "WhatsApp" || o.channel === "Site" || o.channel === "Salão") &&
    typeof o.detail === "string" &&
    typeof o.total === "number" &&
    Number.isFinite(o.total) &&
    typeof o.time === "string" &&
    (o.status === "Novo" || o.status === "Confirmado" || o.status === "Em preparo" ||
      o.status === "Pronto" || o.status === "Saiu") &&
    (o.feePending === undefined || typeof o.feePending === "boolean")
  );
}

// ─── Audio ────────────────────────────────────────────────────────────────
let isMuted = false;
export function toggleMute() { isMuted = !isMuted; return isMuted; }
export function getMuted() { return isMuted; }

const audioContextRef: { current: AudioContext | null } = { current: null };

export function playSound(type: "pop" | "ding" | "success") {
  if (isMuted || typeof window === "undefined") return;
  if (!audioContextRef.current) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AC) audioContextRef.current = new AC();
  }
  const ctx = audioContextRef.current;
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === "pop") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start(); osc.stop(ctx.currentTime + 0.05);
  } else if (type === "ding") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(); osc.stop(ctx.currentTime + 0.4);
  } else if (type === "success") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(); osc.stop(ctx.currentTime + 0.4);
  }
}
