"use client";

import { Icon } from "../_components/AppIcon";

export function IntegrationsView() {
  return (
    <div className="page-content integrations-page">
      <div className="crm-header-section">
        <div className="crm-header-titles">
          <h1>Central de <span>Integrações</span></h1>
          <p>Conecte o 2Type Control às principais plataformas e automatize sua operação.</p>
        </div>
      </div>

      <div className="integrations-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "24px" }}>
        {/* iFood */}
        <div className="integration-card glass-card" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
              <img src="https://logospng.org/download/ifood/logo-ifood-256.png" alt="iFood" style={{ width: "100%", height: "auto" }} />
            </div>
            <span className="crm-badge new">Conectado</span>
          </div>
          <div>
            <h3 style={{ margin: "8px 0 4px", fontSize: "14px", color: "var(--ink)" }}>iFood</h3>
            <p style={{ margin: "0", fontSize: "11px", color: "var(--muted)", lineHeight: 1.4 }}>Receba pedidos, atualize status e gerencie o cardápio diretamente por aqui.</p>
          </div>
          <button className="ghost-button" style={{ marginTop: "auto", width: "100%" }}>Configurar Integração</button>
        </div>

        {/* WhatsApp */}
        <div className="integration-card glass-card" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
              <Icon name="whatsapp" />
            </div>
            <span className="crm-badge new">Ativo</span>
          </div>
          <div>
            <h3 style={{ margin: "8px 0 4px", fontSize: "14px", color: "var(--ink)" }}>WhatsApp Business API</h3>
            <p style={{ margin: "0", fontSize: "11px", color: "var(--muted)", lineHeight: 1.4 }}>Automação de chat, botões de ação e inteligência artificial para pedidos.</p>
          </div>
          <button className="ghost-button" style={{ marginTop: "auto", width: "100%" }}>Desconectar</button>
        </div>

        {/* Loggi */}
        <div className="integration-card glass-card" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", opacity: 0.7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
              <Icon name="entregas" />
            </div>
            <span className="crm-badge">Não conectado</span>
          </div>
          <div>
            <h3 style={{ margin: "8px 0 4px", fontSize: "14px", color: "var(--ink)" }}>Loggi / Bee Delivery</h3>
            <p style={{ margin: "0", fontSize: "11px", color: "var(--muted)", lineHeight: 1.4 }}>Encontre motoboys automaticamente e calcule a taxa de entrega.</p>
          </div>
          <button className="primary-button" style={{ marginTop: "auto", width: "100%" }}>Conectar</button>
        </div>
      </div>
    </div>
  );
}
