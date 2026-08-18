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
  const [newExpense, setNewExpense] = useState<Partial<Omit<Expense, "amount">> & { amount?: string | number }>({ category: "Ingredientes", status: "Pago" });

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
    
    let rawAmount = newExpense.amount;
    if (typeof rawAmount === "string") {
      rawAmount = rawAmount.replace(/\./g, "").replace(",", ".");
    }
    const numericAmount = Number(rawAmount);

    if (!newExpense.description || isNaN(numericAmount) || numericAmount <= 0 || !newExpense.date) {
      alert("Por favor, preencha todos os campos corretamente. Use formato de valor válido (ex: 150,50).");
      return;
    }
    
    let formattedDate = newExpense.date;
    if (formattedDate.includes("-")) {
      const [year, month, day] = formattedDate.split("-");
      formattedDate = `${day}/${month}/${year}`;
    }

    const exp: Expense = {
      id: Math.random().toString(),
      description: newExpense.description,
      category: newExpense.category as Expense["category"],
      date: formattedDate,
      amount: numericAmount,
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
        <section className="panel glass-card" style={{ padding: 24, gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 16 }}>
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
        <section className="panel glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <PanelHeader title="Detalhamento de Gastos" subtitle="Distribuição por categoria" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(expenseBreakdown).map(([category, amount]) => {
              const percentage = Math.round((amount / currentTotalExpenses) * 100) || 0;
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
        <section className="panel glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
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
              <strong style={{ color: "var(--ink)", fontSize: "11px" }}>{totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : "0.0"}%</strong>
            </div>
          </div>
        </section>
      </div>

      {/* Tabela de despesas */}
      <div className="spreadsheet-container" style={{ marginTop: 24 }}>
        <div className="spreadsheet-toolbar" style={{ borderBottom: "1px solid var(--glass-05)", paddingBottom: 16 }}>
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
          <style dangerouslySetInnerHTML={{ __html: `
            .pro-modal {
              background: linear-gradient(180deg, #13131a 0%, #0a0a0f 100%);
              border: 1px solid var(--glass-08);
              box-shadow: 0 40px 100px var(--black-50), inset 0 1px 0 var(--glass-10);
              border-radius: 20px;
              padding: 32px;
              width: 100%;
              max-width: 480px;
              position: relative;
              font-family: var(--font-outfit), sans-serif;
            }
            .pro-modal h2 {
              font-size: 24px;
              font-weight: 700;
              letter-spacing: -0.5px;
              margin: 0 0 24px 0;
              background: linear-gradient(90deg, #fff, #a1a1aa);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .pro-field-wrapper {
              position: relative;
              display: flex;
              align-items: center;
            }
            .pro-field-wrapper svg {
              position: absolute;
              left: 14px;
              color: var(--glass-40);
              width: 18px;
              height: 18px;
              pointer-events: none;
            }
            .pro-input {
              width: 100%;
              height: 48px;
              background: var(--glass-02);
              border: 1px solid var(--glass-06);
              border-radius: 12px;
              color: white;
              padding: 0 16px 0 42px;
              font-size: 14px;
              transition: all 0.2s;
              outline: none;
            }
            .pro-input:focus {
              background: var(--glass-04);
              border-color: var(--orange);
              box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
            }
            .pro-input::placeholder {
              color: var(--glass-30);
            }
            select.pro-input {
              appearance: none;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
              background-repeat: no-repeat;
              background-position: right 14px center;
              padding-right: 40px;
            }
            .pro-input option {
              background: var(--panel);
              color: var(--ink);
            }
            .pro-label {
              display: block;
              font-size: 11px;
              font-weight: 600;
              color: var(--muted);
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .pro-amount-input {
              height: 64px;
              font-size: 24px;
              font-weight: 700;
              color: var(--orange);
              padding-left: 48px;
              border-color: rgba(245, 158, 11, 0.2);
              background: rgba(245, 158, 11, 0.03);
            }
            .pro-amount-input:focus {
              border-color: var(--orange);
              box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
              background: rgba(245, 158, 11, 0.06);
            }
            .pro-amount-prefix {
              position: absolute;
              left: 16px;
              font-size: 18px;
              font-weight: 700;
              color: var(--orange);
              opacity: 0.7;
              pointer-events: none;
            }
            .pro-button {
              height: 52px;
              border-radius: 12px;
              background: linear-gradient(135deg, var(--orange) 0%, #d97706 100%);
              border: none;
              color: white;
              font-size: 14px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);
              margin-top: 12px;
              width: 100%;
            }
            .pro-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 32px rgba(245, 158, 11, 0.35);
            }
            .pro-close {
              position: absolute;
              top: 24px;
              right: 24px;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: var(--glass-05);
              border: 1px solid var(--glass-10);
              color: var(--muted);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
            }
            .pro-close:hover {
              background: var(--glass-10);
              color: white;
            }
          `}} />
          <button className="modal-scrim" type="button" aria-label="Fechar" onClick={() => setExpenseModal(false)} />
          <section className="pro-modal" role="dialog" aria-modal="true">
            <button className="pro-close" type="button" aria-label="Fechar" onClick={() => setExpenseModal(false)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width: 16, height: 16}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2>Lançar Despesa</h2>
            <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              <div>
                <span className="pro-label">Descrição</span>
                <div className="pro-field-wrapper">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  <input className="pro-input" required placeholder="Ex: Compra de Hortifruti" value={newExpense.description || ""} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <span className="pro-label">Categoria</span>
                  <div className="pro-field-wrapper">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    <select className="pro-input" value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as Expense["category"] })}>
                      <option value="Ingredientes">Ingredientes</option>
                      <option value="Funcionários">Funcionários</option>
                      <option value="Contas">Contas Fixas</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>
                <div>
                  <span className="pro-label">Data</span>
                  <div className="pro-field-wrapper">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <input className="pro-input" required type="date" value={newExpense.date || ""} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} style={{ colorScheme: "dark" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
                <div>
                  <span className="pro-label">Valor</span>
                  <div className="pro-field-wrapper">
                    <span className="pro-amount-prefix">R$</span>
                    <input className="pro-input pro-amount-input" required type="text" inputMode="decimal" placeholder="0,00" value={newExpense.amount ?? ""} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} />
                  </div>
                </div>
                <div>
                  <span className="pro-label">Status</span>
                  <div className="pro-field-wrapper" style={{ height: "100%" }}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    <select className="pro-input" value={newExpense.status} onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value as Expense["status"] })} style={{ height: "100%", fontSize: 16 }}>
                      <option value="Pago">Pago</option>
                      <option value="Pendente">Pendente</option>
                    </select>
                  </div>
                </div>
              </div>

              <button className="pro-button" type="submit">Registrar Despesa</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
