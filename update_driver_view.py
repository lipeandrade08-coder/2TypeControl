import re

with open('app/restaurant-dashboard.tsx', 'r') as f:
    content = f.read()

# 1. Update OrderStatus
content = content.replace(
    'type OrderStatus = "Novo" | "Confirmado" | "Em preparo" | "Pronto" | "Saiu";',
    'type OrderStatus = "Novo" | "Confirmado" | "Em preparo" | "Pronto" | "Saiu" | "Entregue";'
)

# 2. Update DriverView
old_driver_view_pattern = r"function DriverView\(.*?\}\);"
new_driver_view_code = """
function DriverView({
  orders,
  onAdvance,
  onComplete,
  onExit
}: {
  orders: Order[];
  onAdvance: (id: number) => void;
  onComplete: (id: number) => void;
  onExit: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"ativas" | "historico">("ativas");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const activeOrders = orders.filter(o => o.status === "Pronto" || o.status === "Saiu");
  const historyOrders = orders.filter(o => o.status === "Entregue");

  // Mocked Profile Data
  const profileName = "Carlos Motoboy";
  const weeklyEarnings = 420.50;
  const weeklyDeliveries = 32 + historyOrders.length;

  return (
    <div className="waiter-backdrop" style={{ background: "var(--canvas)" }}>
      <div className="waiter-frame" style={{ display: "flex", flexDirection: "column" }}>
        
        {/* Header & Profile */}
        <div style={{ padding: "20px 20px 0", background: "var(--panel)", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 16 }}>
                CM
              </div>
              <div>
                <div style={{ color: "var(--ink)", fontSize: 16, fontWeight: 700 }}>{profileName}</div>
                <div style={{ color: "var(--green)", fontSize: 13, fontWeight: 600 }}>Online</div>
              </div>
            </div>
            <button onClick={onExit} style={{ background: "transparent", border: 0, color: "var(--red)", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Sair</button>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1, background: "var(--surface)", borderRadius: 12, padding: 12, border: "1px solid var(--line)" }}>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>Ganhos na Semana</div>
              <div style={{ color: "var(--ink)", fontSize: 18, fontWeight: 800 }}>{formatMoney(weeklyEarnings)}</div>
            </div>
            <div style={{ flex: 1, background: "var(--surface)", borderRadius: 12, padding: 12, border: "1px solid var(--line)" }}>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>Entregas</div>
              <div style={{ color: "var(--ink)", fontSize: 18, fontWeight: 800 }}>{weeklyDeliveries}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 20 }}>
            <button 
              onClick={() => setActiveTab("ativas")}
              style={{ background: "transparent", border: 0, padding: "0 0 12px", color: activeTab === "ativas" ? "var(--ink)" : "var(--muted)", fontWeight: activeTab === "ativas" ? 700 : 500, fontSize: 15, borderBottom: activeTab === "ativas" ? "2px solid var(--blue)" : "2px solid transparent", cursor: "pointer" }}
            >
              Corridas Ativas ({activeOrders.length})
            </button>
            <button 
              onClick={() => setActiveTab("historico")}
              style={{ background: "transparent", border: 0, padding: "0 0 12px", color: activeTab === "historico" ? "var(--ink)" : "var(--muted)", fontWeight: activeTab === "historico" ? 700 : 500, fontSize: 15, borderBottom: activeTab === "historico" ? "2px solid var(--blue)" : "2px solid transparent", cursor: "pointer" }}
            >
              Histórico ({historyOrders.length})
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {activeTab === "ativas" ? (
            activeOrders.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 60 }}>
                <p style={{ fontSize: 40, margin: "0 0 16px" }}>🛵</p>
                <p>Nenhuma entrega na fila.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {activeOrders.map(order => (
                  <div key={order.id} style={{ background: "var(--panel)", borderRadius: 16, padding: 20, border: order.status === "Saiu" ? "2px solid var(--green)" : "1px solid var(--line)", position: "relative", overflow: "hidden" }}>
                    {order.status === "Saiu" && <div style={{ position: "absolute", top: 0, right: 0, background: "var(--green)", color: "#000", padding: "4px 12px", fontSize: 10, fontWeight: 800, borderBottomLeftRadius: 10 }}>EM ROTA</div>}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <strong style={{ fontSize: 18 }}>#{order.id}</strong>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ fontSize: 18, color: "var(--orange)", display: "block" }}>{formatMoney(order.total)}</strong>
                        <small style={{ color: "var(--green)", fontWeight: 600 }}>Taxa: R$ 8,00</small>
                      </div>
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>{order.customer}</p>
                    <p style={{ margin: "0 0 16px", color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
                      Rua Fictícia, 123 - Centro<br/>Guaratinguetá, SP
                    </p>
                    
                    {/* Action Buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: expandedOrder === order.id ? 16 : 0 }}>
                      <a href={`https://wa.me/5512999999999?text=Olá ${order.customer}, o seu pedido do 2Type já está a caminho!`} target="_blank" rel="noreferrer" className="ghost-button" style={{ textAlign: "center", textDecoration: "none", fontSize: 13, padding: "12px 0", height: "auto", color: "var(--green)", borderColor: "rgba(34, 197, 94, 0.2)" }}>💬 WhatsApp</a>
                      <a href={`https://www.google.com/maps/search/?api=1&query=Guaratinguetá+SP`} target="_blank" rel="noreferrer" className="ghost-button" style={{ textAlign: "center", textDecoration: "none", fontSize: 13, padding: "12px 0", height: "auto" }}>🗺️ Mapa</a>
                    </div>
                    
                    <button 
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      style={{ width: "100%", padding: "12px 0", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <span style={{ paddingLeft: 12 }}>Ver detalhes do pedido</span>
                      <span style={{ paddingRight: 12, opacity: 0.5 }}>{expandedOrder === order.id ? "▲" : "▼"}</span>
                    </button>

                    {expandedOrder === order.id && (
                      <div style={{ background: "var(--surface)", padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 13, color: "var(--muted)" }}>
                        <strong style={{ color: "var(--ink)", display: "block", marginBottom: 8 }}>Itens:</strong>
                        <p style={{ margin: "0 0 12px", lineHeight: 1.5 }}>{order.detail}</p>
                        <strong style={{ color: "var(--ink)", display: "block", marginBottom: 8 }}>Pagamento:</strong>
                        <p style={{ margin: 0 }}>Pagar na entrega (Dinheiro)<br/>Precisa de troco para R$ 100,00.</p>
                      </div>
                    )}

                    {order.status === "Pronto" ? (
                      <button className="primary-button" style={{ width: "100%", height: "auto", padding: "14px 0", fontSize: 15 }} onClick={() => onAdvance(order.id)}>Pegar Rota 📍</button>
                    ) : (
                      <button className="primary-button" style={{ width: "100%", background: "var(--green)", border: "none", height: "auto", padding: "14px 0", fontSize: 15 }} onClick={() => onComplete(order.id)}>Entregue ✅</button>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            // Historico Tab
            historyOrders.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 60 }}>
                <p style={{ fontSize: 40, margin: "0 0 16px" }}>📝</p>
                <p>Nenhuma entrega finalizada hoje.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {historyOrders.map(order => (
                  <div key={order.id} style={{ background: "var(--panel)", borderRadius: 12, padding: 16, border: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: 15, display: "block", marginBottom: 4 }}>#{order.id} - {order.customer}</strong>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>Finalizado hoje</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: 15, color: "var(--green)", display: "block" }}>+ R$ 8,00</strong>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
"""
import re
content = re.sub(r'function DriverView\(\{[\s\S]*?\}\s*\{[\s\S]*?\n\}\n', new_driver_view_code, content, flags=re.MULTILINE)

# 3. Update the conditional in Dashboard to set "Entregue" instead of filtering
content = content.replace(
    'onComplete={(id) => setOrders(curr => curr.filter(o => o.id !== id))}',
    'onComplete={(id) => setOrders(curr => curr.map(o => o.id === id ? { ...o, status: "Entregue" } : o))}'
)

with open('app/restaurant-dashboard.tsx', 'w') as f:
    f.write(content)

print("Updated DriverView")
