"use client";

import { useState } from "react";
import type { Order } from "../_types";
import { formatMoney } from "../_lib/utils";
import { StatusBadge } from "../_components/StatusBadge";

export function OrdersView({
  orders,
  filter,
  onFilter,
  onAdvance,
  onOpenFee,
  onNotify,
  onAddOrder,
}: {
  orders: Order[];
  filter: string;
  onFilter: (filter: string) => void;
  onAdvance: (id: number) => void;
  onOpenFee: () => void;
  onNotify: (message: string) => void;
  onAddOrder?: (order: Order) => void;
}) {
  const columns = ["Novo", "Confirmado", "Em preparo", "Pronto", "Saiu"] as const;
  const [localNewOrderModal, setLocalNewOrderModal] = useState(false);
  const [localNewOrder, setLocalNewOrder] = useState<{
    customer: string;
    channel: "WhatsApp" | "Site" | "Salão";
    detail: string;
    total: string;
  }>({ customer: "", channel: "WhatsApp", detail: "", total: "" });

  const handleCreateOrder = () => {
    if (!localNewOrder.customer.trim() || !localNewOrder.detail.trim()) {
      onNotify("Preencha o nome e os itens do pedido.");
      return;
    }
    onAddOrder?.({
      id: Date.now(),
      customer: localNewOrder.customer,
      channel: localNewOrder.channel,
      detail: localNewOrder.detail,
      total: parseFloat(localNewOrder.total.replace(",", ".")) || 0,
      time: "agora",
      status: "Novo",
    });
    setLocalNewOrderModal(false);
    setLocalNewOrder({ customer: "", channel: "WhatsApp", detail: "", total: "" });
  };

  return (
    <div className="page-content">
      <div className="section-toolbar">
        <div className="filter-tabs">
          {["Todos", "WhatsApp", "Site", "Salão"].map((item) => (
            <button type="button" className={filter === item ? "active" : ""} key={item} onClick={() => onFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <button className="primary-button" type="button" onClick={() => setLocalNewOrderModal(true)}>
          + Novo pedido
        </button>
      </div>

      <section className="kanban-board">
        {columns.map((column) => {
          const items = orders.filter((order) => order.status === column);
          return (
            <div className="kanban-column" key={column}>
              <div className="kanban-heading">
                <span className={`status-dot ${column.toLowerCase().replace(" ", "-")}`} />
                <strong>{column}</strong>
                <small>{items.length}</small>
              </div>
              {items.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-card-top">
                    <span className={`channel-pill ${order.channel.toLowerCase()}`}>
                      {order.channel === "WhatsApp" ? "◉" : order.channel === "Site" ? "⌘" : "▦"} {order.channel}
                    </span>
                    <small>{order.time}</small>
                  </div>
                  <h3>#{order.id} <span>•</span> {order.customer}</h3>
                  <p>{order.detail}</p>
                  <div className="order-card-bottom">
                    <strong>{formatMoney(order.total)}</strong>
                    <button type="button" onClick={() => order.feePending ? onOpenFee() : onAdvance(order.id)}>
                      {order.feePending ? "Definir taxa" : column === "Saiu" ? "Concluído" : "Avançar →"}
                    </button>
                  </div>
                </article>
              ))}
              {items.length === 0 && <div className="empty-column">Nenhum pedido</div>}
            </div>
          );
        })}
      </section>

      {localNewOrderModal && (
        <div className="modal-backdrop">
          <button className="modal-scrim" type="button" aria-label="Fechar" onClick={() => setLocalNewOrderModal(false)} />
          <section className="fee-modal" role="dialog" aria-modal="true" aria-labelledby="new-order-title">
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setLocalNewOrderModal(false)}>×</button>
            <span className="modal-icon">📋</span>
            <p className="eyebrow orange">PEDIDOS</p>
            <h2 id="new-order-title">Novo Pedido</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Nome do cliente</span>
                <input required placeholder="Ex: João Silva" value={localNewOrder.customer} onChange={(e) => setLocalNewOrder({ ...localNewOrder, customer: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
              </label>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Canal</span>
                <select value={localNewOrder.channel} onChange={(e) => setLocalNewOrder({ ...localNewOrder, channel: e.target.value as "WhatsApp" | "Site" | "Salão" })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }}>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Site">Site</option>
                  <option value="Salão">Salão</option>
                </select>
              </label>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Itens do pedido</span>
                <input required placeholder="Ex: 2 pizzas • 1 refrigerante" value={localNewOrder.detail} onChange={(e) => setLocalNewOrder({ ...localNewOrder, detail: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
              </label>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Total estimado (R$)</span>
                <input type="number" step="0.01" min="0" placeholder="0,00" value={localNewOrder.total} onChange={(e) => setLocalNewOrder({ ...localNewOrder, total: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
              </label>
              <button className="primary-button wide" type="button" onClick={handleCreateOrder}>Criar Pedido</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
