"use client";

import { useState } from "react";
import { Icon } from "../_components/AppIcon";
import { formatMoney } from "../_lib/utils";

type CrmClient = {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  avgTicket: number;
  orders: number;
  lastVisit: string;
  favDish: string;
  segment: string;
};

const crmData: CrmClient[] = [
  { id: "C01", name: "Camila Rocha", phone: "(11) 98765-4321", totalSpent: 1254.90, avgTicket: 89.60, orders: 14, lastVisit: "08/08", favDish: "Burger Artesanal", segment: "VIP" },
  { id: "C02", name: "João Silva", phone: "(11) 91234-5678", totalSpent: 356.00, avgTicket: 71.20, orders: 5, lastVisit: "08/08", favDish: "Pizza Margherita", segment: "Recorrente" },
  { id: "C03", name: "Mariana Costa", phone: "(11) 99876-5432", totalSpent: 178.50, avgTicket: 89.25, orders: 2, lastVisit: "07/08", favDish: "Porção de Fritas", segment: "Novo" },
  { id: "C04", name: "Pedro Nogueira", phone: "(11) 94567-8901", totalSpent: 2110.30, avgTicket: 105.50, orders: 20, lastVisit: "07/08", favDish: "Combo Casal", segment: "VIP" },
  { id: "C05", name: "Lucas Mendes", phone: "(11) 97654-3210", totalSpent: 65.00, avgTicket: 65.00, orders: 1, lastVisit: "07/08", favDish: "X-Bacon", segment: "Em Risco" },
  { id: "C06", name: "Ana Beatriz", phone: "(11) 98888-7777", totalSpent: 489.00, avgTicket: 61.12, orders: 8, lastVisit: "02/08", favDish: "Refrigerante 2L", segment: "Recorrente" },
  { id: "C07", name: "Felipe Almeida", phone: "(11) 93333-2222", totalSpent: 112.00, avgTicket: 112.00, orders: 1, lastVisit: "01/08", favDish: "Pizza Calabresa", segment: "Novo" },
  { id: "C08", name: "Juliana Santos", phone: "(11) 95555-4444", totalSpent: 870.20, avgTicket: 79.10, orders: 11, lastVisit: "25/07", favDish: "Burger Duplo", segment: "Recorrente" },
];

function SegmentBadge({ segment }: { segment: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    "VIP": { cls: "vip", label: "🌟 VIP" },
    "Recorrente": { cls: "recurrent", label: "🔄 Recorrente" },
    "Novo": { cls: "new", label: "🟢 Novo" },
    "Em Risco": { cls: "risk", label: "🔴 Em Risco" },
  };
  const entry = map[segment] ?? { cls: "", label: segment };
  return <span className={`crm-badge ${entry.cls}`}>{entry.label}</span>;
}

export function CrmView() {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [searchCrm, setSearchCrm] = useState("");
  const [filterSegment, setFilterSegment] = useState("Todos os Segmentos");

  const filteredCrm = crmData.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchCrm.toLowerCase()) || client.phone.includes(searchCrm);
    const matchesSegment = filterSegment === "Todos os Segmentos" || client.segment === filterSegment;
    return matchesSearch && matchesSegment;
  });

  const toggleClient = (id: string) => {
    setSelectedClients((prev) => prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectedClients(selectedClients.length === filteredCrm.length ? [] : filteredCrm.map((c) => c.id));
  };

  return (
    <div className="page-content crm-page">
      <div className="crm-header-section">
        <div className="crm-header-titles">
          <h1>Clientes <span>(CRM)</span></h1>
          <p>Gestão completa de base, inteligência de consumo e retenção.</p>
        </div>
        <div className="crm-header-actions">
          <button className="ghost-button"><Icon name="relatorios" /> Exportar Base</button>
          <button className="primary-button"><Icon name="entregas" /> Novo Cliente</button>
        </div>
      </div>

      <div className="spreadsheet-container">
        <div className="spreadsheet-toolbar">
          <div className="search-box spreadsheet-search">
            <Icon name="visao-geral" />
            <input type="text" placeholder="Buscar cliente por nome ou telefone..." value={searchCrm} onChange={(e) => setSearchCrm(e.target.value)} />
            <kbd>⌘K</kbd>
          </div>
          <div className="spreadsheet-filters">
            <select value={filterSegment} onChange={(e) => setFilterSegment(e.target.value)}>
              <option value="Todos os Segmentos">Todos os Segmentos</option>
              <option value="VIP">VIP</option>
              <option value="Recorrente">Recorrente</option>
              <option value="Novo">Novo</option>
              <option value="Em Risco">Em Risco</option>
            </select>
            <select>
              <option>Mais recentes</option>
              <option>Maior LTV</option>
              <option>Maior Ticket</option>
            </select>
          </div>
        </div>

        <div className="spreadsheet-table-wrapper">
          <table className="spreadsheet-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" checked={selectedClients.length === filteredCrm.length && filteredCrm.length > 0} onChange={toggleAll} />
                </th>
                <th>Cliente</th><th>Contato</th><th>LTV (Total)</th><th>Tkt. Médio</th>
                <th>Pedidos</th><th>Última Visita</th><th>Prato Favorito</th><th>Status</th>
                <th className="action-cell" />
              </tr>
            </thead>
            <tbody>
              {filteredCrm.length > 0 ? filteredCrm.map((client) => (
                <tr key={client.id} className={`spreadsheet-row ${selectedClients.includes(client.id) ? "selected" : ""}`}>
                  <td className="checkbox-cell">
                    <input type="checkbox" checked={selectedClients.includes(client.id)} onChange={() => toggleClient(client.id)} />
                  </td>
                  <td>
                    <div className="client-name">
                      <div className="client-avatar">{client.name.charAt(0)}</div>
                      <strong>{client.name}</strong>
                    </div>
                  </td>
                  <td className="client-phone">{client.phone}</td>
                  <td className="client-money">{formatMoney(client.totalSpent)}</td>
                  <td className="client-money">{formatMoney(client.avgTicket)}</td>
                  <td className="client-orders">{client.orders}</td>
                  <td className="client-date">{client.lastVisit}</td>
                  <td><span className="fav-dish">{client.favDish}</span></td>
                  <td><SegmentBadge segment={client.segment} /></td>
                  <td className="action-cell">
                    <div className="row-actions">
                      <button title="Enviar WhatsApp" className="action-btn wa-btn"><Icon name="whatsapp" /> Zap</button>
                      <button title="Ver Perfil" className="action-btn view-btn">Ver</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>Nenhum cliente encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedClients.length > 0 && (
          <div className="bulk-actions-bar">
            <span>{selectedClients.length} cliente(s) selecionado(s)</span>
            <div className="bulk-buttons">
              <button className="primary-button">Disparar Campanha (WhatsApp)</button>
              <button className="ghost-button">Exportar Seleção</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
