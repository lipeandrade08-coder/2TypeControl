import re

with open('app/restaurant-dashboard.tsx', 'r') as f:
    content = f.read()

# 1. Update AppRole
if 'export type AppRole = "admin" | "balcao" | "garcom" | "cozinha";' in content:
    content = content.replace(
        'export type AppRole = "admin" | "balcao" | "garcom" | "cozinha";',
        'export type AppRole = "admin" | "balcao" | "garcom" | "cozinha" | "entregador";'
    )

# 2. Add DriverView component if not exists
driver_view_code = """
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
  const driverOrders = orders.filter(o => o.status === "Pronto" || o.status === "Saiu");

  return (
    <div className="waiter-backdrop" style={{ background: "var(--canvas)" }}>
      <div className="waiter-frame">
        <div style={{ padding: "20px 20px 10px", background: "var(--panel)", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
          <div style={{ color: "var(--ink)", fontSize: 18, fontWeight: 600 }}>Minhas Entregas</div>
          <button onClick={onExit} style={{ background: "transparent", border: 0, color: "var(--red)", fontSize: 14, cursor: "pointer" }}>Sair</button>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {driverOrders.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 60 }}>
              <p style={{ fontSize: 40, margin: "0 0 16px" }}>🛵</p>
              <p>Nenhuma entrega na fila.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {driverOrders.map(order => (
                <div key={order.id} style={{ background: "var(--panel)", borderRadius: 16, padding: 20, border: order.status === "Saiu" ? "2px solid var(--green)" : "1px solid var(--line)", position: "relative", overflow: "hidden" }}>
                  {order.status === "Saiu" && <div style={{ position: "absolute", top: 0, right: 0, background: "var(--green)", color: "#000", padding: "4px 12px", fontSize: 10, fontWeight: 800, borderBottomLeftRadius: 10 }}>EM ROTA</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <strong style={{ fontSize: 18 }}>#{order.id}</strong>
                    <strong style={{ fontSize: 18, color: "var(--orange)" }}>{formatMoney(order.total)}</strong>
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>{order.customer}</p>
                  <p style={{ margin: "0 0 16px", color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
                    Rua Fictícia, 123 - Centro<br/>Guaratinguetá, SP
                  </p>
                  
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href={`https://www.google.com/maps/search/?api=1&query=Guaratinguetá+SP`} target="_blank" rel="noreferrer" className="ghost-button" style={{ flex: 1, textAlign: "center", textDecoration: "none", fontSize: 13, padding: "12px 0", height: "auto" }}>🗺️ Mapa</a>
                    
                    {order.status === "Pronto" ? (
                      <button className="primary-button" style={{ flex: 2, height: "auto", padding: "12px 0", fontSize: 14 }} onClick={() => onAdvance(order.id)}>Pegar Rota 📍</button>
                    ) : (
                      <button className="primary-button" style={{ flex: 2, background: "var(--green)", border: "none", height: "auto", padding: "12px 0", fontSize: 14 }} onClick={() => onComplete(order.id)}>Entregue ✅</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"""

if "function DriverView" not in content:
    content = content + "\n\n" + driver_view_code

# 3. Add DriverView conditionally in RestaurantDashboard
condition_code = """
  if (role === "entregador") {
    return (
      <DriverView 
        orders={orders} 
        onAdvance={advanceOrder}
        onComplete={(id) => setOrders(curr => curr.filter(o => o.id !== id))} 
        onExit={() => window.location.href="/"} 
      />
    );
  }
"""

if "if (role === \"entregador\") {" not in content:
    content = content.replace("  if (role === \"cozinha\" || kdsMode) {", condition_code + "\n  if (role === \"cozinha\" || kdsMode) {")

with open('app/restaurant-dashboard.tsx', 'w') as f:
    f.write(content)

print("Updated dashboard with DriverView")
