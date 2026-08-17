"use client";

import { useState } from "react";
import type { Order, View } from "../_types";
import { formatMoney } from "../_lib/utils";
import { Metric } from "../_components/Metric";
import { PanelHeader } from "../_components/PanelHeader";
import { StatusBadge } from "../_components/StatusBadge";
import { Toggle } from "../_components/Toggle";

export function OverviewView({
  orders,
  tables,
  pendingFee,
  aiEnabled,
  onToggleAi,
  onOpenFee,
  onView,
  onSelectTable,
  onAdvance,
}: {
  orders: Order[];
  tables: { number: number; status: string }[];
  pendingFee?: Order;
  aiEnabled: boolean;
  onToggleAi: () => void;
  onOpenFee: () => void;
  onView: (view: View) => void;
  onSelectTable: (number: number) => void;
  onAdvance: (id: number) => void;
}) {
  const occupied = tables.filter((t) => t.status === "Ocupada" || t.status === "Conta").length;

  return (
    <div className="page-content overview-page">
      <section className="metric-grid">
        <Metric title="Vendas hoje" value="R$ 3.842,50" note="12,8% vs. sábado passado" color="purple" icon="🛍️" path="M0,25 Q10,15 20,22 T40,20 T60,28 T80,24 T100,10" />
        <Metric title="Pedidos" value="47" note="9 em andamento" color="green" icon="📋" path="M0,28 Q15,28 30,20 T60,25 T90,20 T100,22" />
        <Metric title="Via WhatsApp" value="31" note="66% dos pedidos" color="blue" icon="💬" path="M0,20 Q20,30 40,15 T80,25 T100,20" />
        <Metric title="Mesas ocupadas" value={`${occupied} / ${tables.length}`} note="21 clientes no salão" color="orange" icon="👥" path="M0,20 Q20,10 40,25 T70,15 T100,20" />
      </section>

      {pendingFee && (
        <section className="attention-banner">
          <span className="attention-icon">⋮</span>
          <div>
            <strong>Pedido #{pendingFee.id} aguardando taxa de entrega</strong>
            <p>{pendingFee.customer} • {pendingFee.detail} • feito pelo site há 3 min</p>
          </div>
          <button type="button" onClick={onOpenFee}>Adicionar taxa <span>→</span></button>
        </section>
      )}

      <div className="overview-grid">
        {/* Pedidos ao vivo */}
        <section className="panel orders-panel">
          <PanelHeader title="Pedidos agora" subtitle="8 pedidos em andamento" action="Ver todos" onAction={() => onView("Pedidos")} />
          <div className="order-list">
            {orders.slice(0, 5).map((order) => (
              <article className="order-row" key={order.id} onClick={() => order.feePending ? onOpenFee() : onAdvance(order.id)}>
                <span className={`channel-mark ${order.channel.toLowerCase()}`}>
                  {order.channel === "WhatsApp" ? "💬" : order.channel === "Site" ? "⌘" : "🍽️"}
                </span>
                <div className="order-main">
                  <div><strong>#{order.id}</strong><span className="dot-separator">•</span><b>{order.customer}</b></div>
                  <small>{order.detail}</small>
                </div>
                <div className="order-time">
                  <small>{order.time}</small>
                  <strong>{formatMoney(order.total)}</strong>
                </div>
                <StatusBadge status={order.status} pending={order.feePending} />
                <button className="row-action" type="button" aria-label={`Avançar pedido ${order.id}`}>›</button>
              </article>
            ))}
          </div>
        </section>

        {/* Insights IA */}
        <section className="panel insights-panel" style={{ background: "var(--purple-soft)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <PanelHeader title="Insights da IA" subtitle="Análise em tempo real" action="Ver relatório" onAction={() => onView("Relatórios")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            <div style={{ padding: 12, background: "var(--surface-hover)", borderRadius: 8, borderLeft: "3px solid var(--orange)", fontSize: 13, lineHeight: 1.4 }}>
              🤖 <strong>Oportunidade:</strong> Vendas de massas estão 30% abaixo da média nesta quinta-feira. Recomendamos ativar uma promoção relâmpago.
            </div>
            <div style={{ padding: 12, background: "var(--surface-hover)", borderRadius: 8, borderLeft: "3px solid var(--green)", fontSize: 13, lineHeight: 1.4 }}>
              🤖 <strong>Atenção ao Salão:</strong> A Mesa 04 está há 1h40 sem pedir sobremesa. Boa hora para o garçom oferecer!
            </div>
            <div style={{ padding: 12, background: "var(--surface-hover)", borderRadius: 8, borderLeft: "3px solid var(--blue)", fontSize: 13, lineHeight: 1.4 }}>
              🤖 <strong>CRM:</strong> Camila Rocha pediu 14x, mas não pede há 2 semanas. Enviar cupom automático de saudade?
            </div>
          </div>
        </section>

        {/* IA WhatsApp */}
        <section className="panel ai-panel">
          <PanelHeader title="IA no WhatsApp" subtitle="Atendimento automático" extra={<Toggle enabled={aiEnabled} onToggle={onToggleAi} />} />
          <div className="ai-status-row">
            <span className="spark">✦</span>
            <span>
              <strong>{aiEnabled ? "IA atendendo agora" : "IA pausada"}</strong>
              <small>{aiEnabled ? "6 conversas ativas" : "Atendimento manual ativo"}</small>
            </span>
            <i />
          </div>
          <div className="mini-chat">
            <div className="chat-meta">
              <span className="avatar coral">CR</span>
              <div><strong>Camila Rocha</strong><small>há 1 min</small></div>
              <span className="whatsapp-mini">💬</span>
            </div>
            <div className="customer-message">Meu pedido já saiu para entrega?</div>
            <div className="ai-message">
              <span>✦</span>
              <div><p>Oi, Camila! Seu pedido <b>#1048</b> saiu às 17:36 e chega em cerca de 18 min. 😊</p></div>
            </div>
          </div>
          <div className="ai-footer">
            <a href="#" onClick={(e) => { e.preventDefault(); onView("WhatsApp"); }}>Ver todas as conversas <span>→</span></a>
          </div>
        </section>
      </div>

      {/* Resumo de vendas */}
      <div className="bottom-panel">
        <h2>Resumo de vendas</h2>
        <select><option>Últimos 7 dias ⌄</option></select>
        <div className="bottom-metrics">
          <div className="bottom-metric"><small>Total</small><strong>R$ 24.850,00</strong></div>
          <div className="bottom-metric"><small>Média diária</small><strong>R$ 3.550,00</strong></div>
          <div className="bottom-metric"><small>Ticket médio</small><strong>R$ 78,40</strong></div>
        </div>
        <svg className="bottom-chart-mock" viewBox="0 0 1000 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad-purple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--purple)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--purple)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,100 L100,90 L200,60 L300,110 L400,20 L500,40 L600,80 L700,50 L800,70 L900,30 L1000,10" fill="none" stroke="var(--purple)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d="M0,100 L100,90 L200,60 L300,110 L400,20 L500,40 L600,80 L700,50 L800,70 L900,30 L1000,10 L1000,120 L0,120 Z" fill="url(#grad-purple)" />
        </svg>
      </div>
    </div>
  );
}
