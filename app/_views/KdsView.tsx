"use client";

import type { Order } from "../_types";

export function KdsView({
  orders,
  onAdvance,
  onExit,
}: {
  orders: Order[];
  onAdvance: (id: number) => void;
  onExit: () => void;
}) {
  const pendingOrders = orders.filter(
    (o) => o.status === "Novo" || o.status === "Confirmado" || o.status === "Em preparo"
  );

  return (
    <div className="kds-layout">
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--orange)" }}>
          Monitor de Cozinha (KDS)
        </h1>
        <button
          className="ghost-button"
          type="button"
          onClick={onExit}
          style={{ background: "var(--surface-hover)", border: 0, color: "var(--ink)", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}
        >
          ← Voltar ao Sistema
        </button>
      </header>

      <div className="kds-grid">
        {pendingOrders.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🍳</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Cozinha Livre</div>
            <p style={{ fontSize: 15, margin: 0 }}>Nenhum pedido aguardando preparo no momento.</p>
          </div>
        )}
        {pendingOrders.map((order) => (
          <div key={order.id} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, borderBottom: "1px solid var(--line)", paddingBottom: 16 }}>
              <div>
                <strong style={{ fontSize: 24, display: "block", color: "var(--ink)" }}>#{order.id}</strong>
                <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600 }}>{order.channel} • {order.customer}</span>
              </div>
              <span style={{ 
                fontSize: 13, 
                background: order.status === "Em preparo" ? "var(--green-soft)" : "var(--orange-soft)", 
                color: order.status === "Em preparo" ? "var(--green)" : "var(--orange)", 
                padding: "6px 12px", 
                borderRadius: 20,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}>
                {order.status}
              </span>
            </div>
            
            <div style={{ margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {order.detail.split(" • ").map((str, i) => {
                const match = str.match(/^(\d+x [^\(\[]+)(?:\s*\((.*?)\))?(?:\s*\[(.*?)\])?$/);
                if (match) {
                  const [_, name, options, obs] = match;
                  return (
                    <div key={i} style={{ background: "var(--surface)", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
                      <strong style={{ display: "block", fontSize: 16, color: "var(--ink)", marginBottom: options || obs ? 6 : 0 }}>{name}</strong>
                      {options && (
                        <div style={{ fontSize: 13, color: "var(--blue)", fontWeight: 600, display: "flex", gap: 6, alignItems: "center", marginBottom: obs ? 6 : 0 }}>
                          <span>✓</span> {options}
                        </div>
                      )}
                      {obs && (
                        <div style={{ fontSize: 14, background: "var(--red-soft)", color: "var(--red)", fontWeight: 700, padding: "8px 12px", borderRadius: 8, display: "inline-block", marginTop: 4 }}>
                          ⚠️ OBS: {obs}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div key={i} style={{ background: "var(--surface)", padding: 12, borderRadius: 12, border: "1px solid var(--line)", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>
                    {str}
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", borderTop: "1px solid var(--line)", paddingTop: 16 }}>
              <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <span>⏱️</span> Lançado às {order.time}
              </span>
              <button
                className="primary-button"
                style={{ 
                  padding: "12px 20px", 
                  background: order.status === "Em preparo" ? "var(--green)" : "var(--blue)", 
                  fontSize: 15, 
                  borderRadius: 12 
                }}
                onClick={() => onAdvance(order.id)}
              >
                {order.status === "Em preparo" ? "Pronto ✓" : "Preparar 🍳"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
