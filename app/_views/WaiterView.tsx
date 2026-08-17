"use client";

import { useState, useMemo } from "react";
import type { Table, MenuItem } from "../_types";
import { formatMoney } from "../_lib/utils";

export function WaiterView({
  tables,
  menuItems,
  onExit,
  onAddItems,
}: {
  tables: Table[];
  menuItems: MenuItem[];
  onExit: () => void;
  onAddItems: (tableNum: number, items: { name: string; price: number; quantity: number; options?: string[]; observations?: string }[]) => void;
}) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number; options?: string[]; observations?: string }[]>([]);

  // Mobile Tabs & Categories
  const [activeTab, setActiveTab] = useState<"cardapio" | "conta">("cardapio");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [showCart, setShowCart] = useState(false);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(menuItems.map(m => m.category)))], [menuItems]);
  const filteredMenu = activeCategory === "Todos" ? menuItems : menuItems.filter(m => m.category === activeCategory);

  const [configuringItem, setConfiguringItem] = useState<{ item: MenuItem; quantity: number; options: string[]; observations: string } | null>(null);

  const handleConfirmItem = () => {
    if (!configuringItem) return;
    setCart((current) => {
      const exists = current.find((i) => 
        i.name === configuringItem.item.name && 
        JSON.stringify(i.options) === JSON.stringify(configuringItem.options) && 
        i.observations === configuringItem.observations
      );
      if (exists) {
        return current.map((i) => i.id === exists.id ? { ...i, quantity: i.quantity + configuringItem.quantity } : i);
      }
      return [...current, { 
        id: Math.random().toString(),
        name: configuringItem.item.name, 
        price: configuringItem.item.price, 
        quantity: configuringItem.quantity,
        options: configuringItem.options.length > 0 ? configuringItem.options : undefined,
        observations: configuringItem.observations ? configuringItem.observations : undefined
      }];
    });
    setConfiguringItem(null);
  };

  const removeFromCart = (id: string) => {
    setCart((current) => {
      const next = current.filter((i) => i.id !== id);
      if (next.length === 0) setShowCart(false);
      return next;
    });
  };

  const toggleOption = (opt: string) => {
    if (!configuringItem) return;
    const newOpts = configuringItem.options.includes(opt) 
      ? configuringItem.options.filter(o => o !== opt)
      : [...configuringItem.options, opt];
    setConfiguringItem({ ...configuringItem, options: newOpts });
  };

  const tableObj = selectedTable ? tables.find((t) => t.number === selectedTable) : null;
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="waiter-backdrop" style={{ background: "var(--background)", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={{ padding: "20px 20px 16px", background: "var(--panel)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        {selectedTable ? (
          <button
            onClick={() => { setSelectedTable(null); setCart([]); setShowCart(false); setActiveTab("cardapio"); }}
            style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "8px 16px", color: "var(--ink)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            ← Voltar
          </button>
        ) : (
          <div style={{ color: "var(--ink)", fontSize: 22, fontWeight: 800 }}>Mesas</div>
        )}
        
        {selectedTable ? (
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--blue)" }}>
            Mesa {String(selectedTable).padStart(2, "0")}
          </div>
        ) : (
          <button onClick={onExit} style={{ background: "var(--red-soft)", color: "var(--red)", border: 0, padding: "8px 16px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Sair
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", paddingBottom: 120 }}>
        {!selectedTable ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {tables.map((t) => {
              const isOccupied = t.status === "Ocupada" || t.status === "Conta";
              return (
                <button
                  key={t.number}
                  onClick={() => setSelectedTable(t.number)}
                  style={{
                    background: isOccupied ? "var(--blue)" : "var(--panel)",
                    border: `1px solid ${isOccupied ? "var(--blue)" : "var(--line)"}`,
                    borderRadius: 16, padding: "24px 16px", textAlign: "center", cursor: "pointer", 
                    color: isOccupied ? "white" : "var(--ink)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    boxShadow: isOccupied ? "0 8px 24px rgba(59,130,246,0.3)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{String(t.number).padStart(2, "0")}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>{t.status}</div>
                  {isOccupied && <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>{formatMoney(t.total)}</div>}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            {/* TABS */}
            <div style={{ display: "flex", background: "var(--surface)", borderRadius: 12, padding: 4, marginBottom: 20 }}>
              <button 
                onClick={() => setActiveTab("cardapio")}
                style={{ flex: 1, padding: "12px", borderRadius: 8, border: 0, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", background: activeTab === "cardapio" ? "var(--panel)" : "transparent", color: activeTab === "cardapio" ? "var(--blue)" : "var(--muted)", boxShadow: activeTab === "cardapio" ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }}
              >
                Cardápio
              </button>
              <button 
                onClick={() => setActiveTab("conta")}
                style={{ flex: 1, padding: "12px", borderRadius: 8, border: 0, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", background: activeTab === "conta" ? "var(--panel)" : "transparent", color: activeTab === "conta" ? "var(--ink)" : "var(--muted)", boxShadow: activeTab === "conta" ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }}
              >
                Conta Parcial
              </button>
            </div>

            {activeTab === "cardapio" && (
              <>
                {/* CATEGORIES HORIZONTAL SCROLL */}
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, margin: "0 -20px 8px", paddingLeft: 20, paddingRight: 20, WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)}
                      style={{ whiteSpace: "nowrap", padding: "10px 18px", borderRadius: 20, background: activeCategory === cat ? "var(--blue)" : "var(--surface)", color: activeCategory === cat ? "white" : "var(--ink)", border: `1px solid ${activeCategory === cat ? "var(--blue)" : "var(--line)"}`, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* MENU LIST */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filteredMenu.map((item) => {
                    const inCart = cart.filter((c) => c.name === item.name).reduce((acc, c) => acc + c.quantity, 0);
                    return (
                      <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--panel)", padding: 16, borderRadius: 16, border: "1px solid var(--line)" }}>
                        <div style={{ flex: 1, paddingRight: 12 }}>
                          <div style={{ color: "var(--ink)", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                          <div style={{ color: "var(--green)", fontSize: 14, fontWeight: 600 }}>{formatMoney(item.price)}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {inCart > 0 && (
                            <span style={{ color: "var(--blue)", fontSize: 14, fontWeight: 800, background: "var(--blue-soft)", padding: "6px 12px", borderRadius: 12 }}>{inCart} no pedido</span>
                          )}
                          <button onClick={() => setConfiguringItem({ item, quantity: 1, options: [], observations: "" })} style={{ width: 48, height: 48, borderRadius: 24, background: "var(--blue)", color: "white", border: 0, fontSize: 24, cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === "conta" && (
              <div>
                {tableObj && tableObj.items && tableObj.items.length > 0 ? (
                  <div style={{ background: "var(--panel)", borderRadius: 16, padding: 20, border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Lançados na mesa</div>
                    {tableObj.items.map((it, idx) => (
                      <div key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink)", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                          <span>{it.quantity}x {it.name}</span>
                          <span>{formatMoney(it.price * it.quantity)}</span>
                        </div>
                        {it.options && it.options.length > 0 && <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>{it.options.join(", ")}</div>}
                        {it.observations && <div style={{ fontSize: 13, color: "var(--orange)" }}>Obs: {it.observations}</div>}
                      </div>
                    ))}
                    <div style={{ marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "space-between", color: "var(--ink)", fontWeight: 800, fontSize: 18 }}>
                      <span>Total da Mesa</span>
                      <span>{formatMoney(tableObj.total)}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Mesa Vazia</div>
                    <p style={{ fontSize: 14, margin: 0 }}>Nenhum item foi lançado nesta mesa ainda.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FLOATING CART SUMMARY */}
      {selectedTable && cart.length > 0 && !showCart && !configuringItem && (
        <div style={{ position: "fixed", bottom: 20, left: 20, right: 20, zIndex: 100 }}>
          <button 
            onClick={() => setShowCart(true)}
            style={{ width: "100%", background: "var(--blue)", color: "white", padding: 20, borderRadius: 16, border: 0, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", boxShadow: "0 10px 40px rgba(59,130,246,0.5)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.2)", width: 36, height: 36, borderRadius: 18, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 16 }}>{cart.reduce((a,c) => a + c.quantity, 0)}</div>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Ver Pedido</span>
            </div>
            <strong style={{ fontSize: 18 }}>{formatMoney(cartTotal)}</strong>
          </button>
        </div>
      )}

      {/* CART MODAL (BOTTOM SHEET) */}
      {showCart && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ background: "var(--panel)", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: "var(--ink)", fontSize: 20, fontWeight: 800 }}>Resumo do Pedido</h3>
              <button onClick={() => setShowCart(false)} style={{ background: "var(--surface)", border: 0, color: "var(--ink)", width: 32, height: 32, borderRadius: 16, fontSize: 16, cursor: "pointer", fontWeight: 700 }}>×</button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", margin: "0 -24px", padding: "0 24px" }}>
              {cart.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--ink)", fontSize: 16, fontWeight: 700 }}>{c.quantity}x {c.name}</div>
                    {c.options && c.options.length > 0 && <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{c.options.join(", ")}</div>}
                    {c.observations && <div style={{ fontSize: 13, color: "var(--orange)", marginTop: 4, fontWeight: 600 }}>Obs: {c.observations}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ color: "var(--ink)", fontWeight: 700 }}>{formatMoney(c.price * c.quantity)}</span>
                    <button onClick={() => removeFromCart(c.id)} style={{ background: "var(--red-soft)", color: "var(--red)", border: "none", width: 32, height: 32, borderRadius: 16, fontSize: 20, cursor: "pointer", display: "grid", placeItems: "center" }}>×</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: 20, marginTop: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink)", fontWeight: 800, fontSize: 20, marginBottom: 20 }}>
                <span>Total</span>
                <span>{formatMoney(cartTotal)}</span>
              </div>
              <button 
                onClick={() => { onAddItems(selectedTable!, cart); setSelectedTable(null); setCart([]); setShowCart(false); }}
                style={{ width: "100%", background: "var(--blue)", color: "white", border: 0, padding: 20, borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(59,130,246,0.3)" }}
              >
                Confirmar Lançamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURING ITEM MODAL (BOTTOM SHEET) */}
      {configuringItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ background: "var(--panel)", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "var(--ink)", fontSize: 22, fontWeight: 800 }}>{configuringItem.item.name}</h3>
              <button onClick={() => setConfiguringItem(null)} style={{ background: "var(--surface)", border: 0, color: "var(--ink)", width: 32, height: 32, borderRadius: 16, fontSize: 16, cursor: "pointer", fontWeight: 700 }}>×</button>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Personalizar (Opcional)</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {["Sem Gelo", "Com Limão", "Bem Passado", "Ao Ponto", "Mal Passado", "Sem Cebola", "Para Viagem"].map(opt => {
                  const isSelected = configuringItem.options.includes(opt);
                  return (
                    <button key={opt} onClick={() => toggleOption(opt)} style={{ padding: "10px 16px", borderRadius: 12, background: isSelected ? "var(--blue)" : "var(--surface)", color: isSelected ? "white" : "var(--ink)", border: `1px solid ${isSelected ? "var(--blue)" : "var(--line)"}`, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Observações</p>
              <textarea 
                value={configuringItem.observations}
                onChange={(e) => setConfiguringItem({...configuringItem, observations: e.target.value})}
                placeholder="Ex: Tirar picles, molho à parte..."
                style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: 16, color: "var(--ink)", fontSize: 15, resize: "none", height: 100, fontFamily: "inherit", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line)", overflow: "hidden", height: 56 }}>
                <button onClick={() => setConfiguringItem({...configuringItem, quantity: Math.max(1, configuringItem.quantity - 1)})} style={{ width: 56, height: "100%", border: 0, background: "transparent", color: "var(--ink)", fontSize: 24, cursor: "pointer" }}>−</button>
                <span style={{ width: 40, textAlign: "center", color: "var(--ink)", fontWeight: 800, fontSize: 18 }}>{configuringItem.quantity}</span>
                <button onClick={() => setConfiguringItem({...configuringItem, quantity: configuringItem.quantity + 1})} style={{ width: 56, height: "100%", border: 0, background: "transparent", color: "var(--ink)", fontSize: 24, cursor: "pointer" }}>+</button>
              </div>
              
              <button onClick={handleConfirmItem} style={{ flex: 1, background: "var(--blue)", color: "white", border: 0, height: 56, borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(59,130,246,0.3)" }}>
                Adicionar {formatMoney(configuringItem.item.price * configuringItem.quantity)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
