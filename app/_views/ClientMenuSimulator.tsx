"use client";

import { useState } from "react";
import type { MenuItem } from "../_types";
import { formatMoney } from "../_lib/utils";

export function ClientMenuSimulator({
  tableNum,
  onClose,
  menuItems,
  onPlaceOrder,
}: {
  tableNum: number;
  onClose: () => void;
  menuItems: MenuItem[];
  onPlaceOrder: (items: { name: string; quantity: number; price: number }[], total: number) => void;
}) {
  const [cart, setCart] = useState<{ name: string; quantity: number; price: number }[]>([]);

  const addToCart = (item: MenuItem) => {
    const ex = cart.find((c) => c.name === item.name);
    if (ex) setCart(cart.map((c) => c.name === item.name ? { ...c, quantity: c.quantity + 1 } : c));
    else setCart([...cart, { name: item.name, price: item.price, quantity: 1 }]);
  };

  const cartTotal = cart.reduce((a, b) => a + b.price * b.quantity, 0);

  return (
    <div className="waiter-backdrop">
      <div className="waiter-frame">
        <header style={{ background: "var(--orange)", padding: "16px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: 32 }} />
          <div>
            <h2 style={{ color: "var(--ink)", margin: 0, fontSize: 18 }}>Mesa {tableNum}</h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Autoatendimento</p>
          </div>
          <button
            style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface-hover)", border: 0, color: "var(--ink)", fontWeight: 700, fontSize: 18, cursor: "pointer", display: "grid", placeItems: "center" }}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {menuItems.map((item) => (
            <div key={item.name} style={{ background: "#222", padding: 16, borderRadius: 12, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ color: "var(--ink)", display: "block", fontSize: 14 }}>{item.name}</strong>
                <span style={{ color: "var(--orange)", fontSize: 14, fontWeight: 700 }}>{formatMoney(item.price)}</span>
              </div>
              <button
                style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--purple)", border: 0, color: "white", fontWeight: 700, cursor: "pointer", display: "grid", placeItems: "center" }}
                onClick={() => addToCart(item)}
              >
                +
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: 20, background: "#222", borderTop: "1px solid #333" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, color: "var(--ink)" }}>
              <span style={{ fontSize: 14 }}>Total do pedido:</span>
              <strong style={{ fontSize: 16 }}>{formatMoney(cartTotal)}</strong>
            </div>
            <button
              style={{ width: "100%", padding: 16, background: "var(--green)", border: 0, borderRadius: 12, color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
              onClick={() => onPlaceOrder(cart, cartTotal)}
            >
              Enviar Pedido para Cozinha
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
