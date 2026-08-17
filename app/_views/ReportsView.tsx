"use client";

import { useState } from "react";
import type { Expense } from "../_types";
import { formatMoney } from "../_lib/utils";
import { Metric } from "../_components/Metric";
import { PanelHeader } from "../_components/PanelHeader";
import { Icon } from "../_components/AppIcon";
import { initialExpenses } from "../_data/mock-data";

export function ReportsView() {
  const bars = [38, 44, 52, 46, 68, 74, 82, 58, 63, 71, 88, 76];
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [expenseModal, setExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ category: "Ingredientes", status: "Pago" });

  const totalRevenue = 86420;
  const baseExpenses = 32540;
  const currentTotalExpenses = baseExpenses + expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netIncome = totalRevenue - currentTotalExpenses;

  const expenseBreakdown: Record<string, number> = {
    "Ingredientes": 12540 + expenses.filter((e) => e.category === "Ingredientes").reduce((acc, e) => acc + e.amount, 0),
    "Funcionários": 15000 + expenses.filter((e) => e.category === "Funcionários").reduce((acc, e) => acc + e.amount, 0),
    "Contas Fixas": 3500 + expenses.filter((e) => e.category === "Contas").reduce((acc, e) => acc + e.amount, 0),
    "Manutenção": 500 + expenses.filter((e) => e.category === "Manutenção").reduce((acc, e) => acc + e.amount, 0),
    "Outros": 1000 + expenses.filter((e) => e.category === "Outros").reduce((acc, e) => acc + e.amount, 0),
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.date) return;
    const exp: Expense = {
      id: Math.random().toString(),
      description: newExpense.description,
      category: newExpense.category as Expense["category"],
      date: newExpense.date,
      amount: Number(newExpense.amount),
      status: newExpense.status as Expense["status"],
    };
    setExpenses([exp, ...expenses]);
    setExpenseModal(false);
    setNewExpense({ category: "Ingredientes", status: "Pago" });
  };

  const fieldStyle = { width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" };

  return (
    <div className="page-content reports-page">
      <div className="crm-header-section" style={{ padding: "0 0 24px" }}>
        <div className="crm-header-titles">
          <h1>Relatórios &amp; <span>Financeiro</span></h1>
          <p>Visão geral de faturamento, canais de venda e controle de fluxo de caixa.</p>
        </div>
        <div className="crm-header-actions">
          <button className="ghost-button"><Icon name="relatorios" /> Exportar Relatório</button>
          <button className="primary-button" onClick={() => setExpenseModal(true)}><Icon name="pedidos" /> Lançar Despesa</button>
        </div>
      </div>

      <section className="metric-grid">
        <Metric title="Faturamento no mês" value={formatMoney(totalRevenue)} note="18,4% acima de julho" color="purple" icon="🛍️" path="M0,25 Q10,15 20,22 T40,20 T60,28 T80,24 T100,10" />
        <Metric title="Despesas (Saídas)" value={formatMoney(currentTotalExpenses)} note="4,2% abaixo de julho" color="orange" icon="📉" path="M0,28 Q15,28 30,20 T60,25 T90,20 T100,22" />
        <Metric title="Saldo Líquido" value={formatMoney(netIncome)} note="Margem de 60,3%" color="green" icon="💰" path="M0,20 Q20,30 40,15 T80,25 T100,20" />
        <Metric title="Ticket médio" value="R$ 78,40" note="R$ 6,20 acima da meta" color="blue" icon="↗" path="M0,20 Q20,10 40,25 T70,15 T100,20" />
      </section>

      <div className="reports-grid">
        {/* Gráfico mensal */}
        <section className="panel" style={{ padding: 24, gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 16 }}>
          <PanelHeader title="Faturamento Mensal" subtitle="Histórico de vendas dos últimos 12 meses" />
          <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 8, marginTop: 16, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
            {bars.map((bar, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", background: "var(--purple)", borderRadius: "4px 4px 0 0", height: `${bar}%`, minHeight: 4, transition: "height 0.3s ease", opacity: i === 11 ? 1 : 0.6 }} />
                <span style={{ fontSize: 10, color: "var(--muted)" }}>{months[i]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Detalhamento de gastos */}
        <section className="panel" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <PanelHeader title="Detalhamento de Gastos" subtitle="Distribuição por categoria" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(expenseBreakdown).map(([category, amount]) => {
              const percentage = Math.round((amount / currentTotalExpenses) * 100);
              return (
                <div key={category} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--ink)" }}>
                    <span>{category}</span>
                    <strong style={{ color: "var(--orange)" }}>{formatMoney(amount)} ({percentage}%)</strong>
                  </div>
                  <div style={{ height: 6, background: "var(--surface)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percentage}%`, background: "var(--orange)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Demonstrativo */}
        <section className="panel" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <PanelHeader title="Demonstrativo de Lucro" subtitle="Resultado Líquido do Período" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
              <span style={{ color: "var(--muted)" }}>Faturamento Bruto</span>
              <strong style={{ color: "var(--green)" }}>{formatMoney(totalRevenue)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
              <span style={{ color: "var(--muted)" }}>Custos e Despesas</span>
              <strong style={{ color: "var(--orange)" }}>- {formatMoney(currentTotalExpenses)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>Lucro Líquido Real</span>
              <strong style={{ color: netIncome > 0 ? "var(--green)" : "var(--orange)", fontSize: "18px" }}>{formatMoney(netIncome)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
              <span style={{ color: "var(--muted)", fontSize: "11px" }}>Margem de Lucro</span>
              <strong style={{ color: "var(--ink)", fontSize: "11px" }}>{((netIncome / totalRevenue) * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </section>
      </div>

      {/* Tabela de despesas */}
      <div className="spreadsheet-container" style={{ marginTop: 24 }}>
        <div className="spreadsheet-toolbar" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 16 }}>
          <PanelHeader title="Controle de Despesas" subtitle="Últimos lançamentos de fluxo de caixa" />
        </div>
        <div className="spreadsheet-table-wrapper">
          <table className="spreadsheet-table">
            <thead>
              <tr>
                <th>Descrição</th><th>Categoria</th><th>Data</th><th>Valor</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="spreadsheet-row">
                  <td><strong>{exp.description}</strong></td>
                  <td>
                    <span className={`crm-badge ${exp.category === "Ingredientes" ? "recurrent" : exp.category === "Funcionários" ? "vip" : exp.category === "Contas" ? "risk" : "new"}`}>{exp.category}</span>
                  </td>
                  <td className="client-date">{exp.date}</td>
                  <td className="client-money" style={{ color: "var(--orange)" }}>- {formatMoney(exp.amount)}</td>
                  <td>
                    <span className={`crm-badge ${exp.status === "Pago" ? "new" : "risk"}`}>{exp.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de despesa */}
      {expenseModal && (
        <div className="modal-backdrop">
          <button className="modal-scrim" type="button" aria-label="Fechar" onClick={() => setExpenseModal(false)} />
          <section className="fee-modal" role="dialog" aria-modal="true" style={{ width: "100%", maxWidth: 480 }}>
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setExpenseModal(false)}>×</button>
            <p className="eyebrow orange">FLUXO DE CAIXA</p>
            <h2>Lançar Nova Despesa</h2>
            <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24, textAlign: "left" }}>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Descrição da Despesa</span>
                <input required placeholder="Ex: Compra de Hortifruti" value={newExpense.description || ""} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} style={fieldStyle} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Categoria</span>
                  <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as Expense["category"] })} style={fieldStyle}>
                    <option value="Ingredientes">Ingredientes</option>
                    <option value="Funcionários">Funcionários</option>
                    <option value="Contas">Contas Fixas</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Outros">Outros</option>
                  </select>
                </label>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Data</span>
                  <input required type="date" value={newExpense.date || ""} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} style={{ ...fieldStyle, colorScheme: "dark" }} />
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Valor (R$)</span>
                  <input required type="number" step="0.01" min="0" placeholder="0.00" value={newExpense.amount || ""} onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })} style={fieldStyle} />
                </label>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Status</span>
                  <select value={newExpense.status} onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value as Expense["status"] })} style={fieldStyle}>
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </label>
              </div>
              <button className="primary-button wide" type="submit" style={{ marginTop: 8 }}>Registrar Despesa</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
