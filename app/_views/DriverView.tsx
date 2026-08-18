"use client";

import { useState } from "react";
import type { Order } from "../_types";
import { formatMoney } from "../_lib/utils";

export function DriverView({
  orders,
  onAdvance,
  onComplete,
  onExit,
}: {
  orders: Order[];
  onAdvance: (id: number) => void;
  onComplete: (id: number) => void;
  onExit: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"painel" | "entregas" | "perfil">("painel");
  const [subTab, setSubTab] = useState<"ativas" | "historico">("ativas");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [profileName, setProfileName] = useState("Carlos Motoboy");
  const [profileAvatar, setProfileAvatar] = useState("👨‍🚀");
  const [isOnline, setIsOnline] = useState(true);
  const [goal, setGoal] = useState(150);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [vehicle, setVehicle] = useState<"moto" | "bike">("moto");
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const AVATARES = ["👨‍🚀", "🏎️", "😎", "🦊", "⚡"];
  const activeOrders = orders.filter((o) => o.status === "Despachado" || o.status === "Saiu");
  const historyOrders = orders.filter((o) => o.status === "Entregue");
  
  // Dashboard dynamic data based on deliveries
  const deliveriesToday = historyOrders.length + 8; // base mock + actual completed
  const historyEarnings = historyOrders.reduce((acc, o) => acc + (o.driverFee || 8.5), 0);
  const baseMockEarnings = 8 * 8.5;
  const earningsFromDeliveries = historyEarnings + baseMockEarnings;
  const tipsToday = 25; // fixed mock tips
  const earningsToday = earningsFromDeliveries + tipsToday;
  const distanceToday = deliveriesToday * 4.2; // 4.2km per run
  const progress = Math.min((earningsToday / goal) * 100, 100);

  const tabStyle = (tab: string) => ({
    flex: 1,
    background: "transparent", border: 0, padding: "8px 0",
    color: activeTab === tab ? "var(--ink)" : "var(--muted)",
    fontWeight: activeTab === tab ? 700 : 500, fontSize: 13,
    cursor: "pointer", whiteSpace: "nowrap" as const,
    display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4
  });

  return (
    <div className="waiter-backdrop" style={{ background: "var(--canvas)" }}>
      <div className="waiter-frame" style={{ display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
        
        {/* Header - Always visible */}
        <div style={{ padding: "20px", background: "var(--panel)", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--blue-soft)", color: "var(--blue)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, overflow: "hidden" }}>
              {customPhoto ? <img src={customPhoto} alt="Avatar" style={{width: "100%", height: "100%", objectFit: "cover"}}/> : profileAvatar}
            </div>
            <div>
              <div style={{ color: "var(--ink)", fontSize: 16, fontWeight: 700 }}>{profileName}</div>
              <button 
                onClick={() => setIsOnline(!isOnline)} 
                style={{ background: isOnline ? "var(--green-soft)" : "var(--surface)", color: isOnline ? "var(--green)" : "var(--muted)", border: isOnline ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--line)", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4 }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? "var(--green)" : "var(--muted)" }} />
                {isOnline ? "Online para entregas" : "Offline"}
              </button>
            </div>
          </div>
          <button onClick={onExit} style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", padding: "8px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Sair</button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          
          {/* PAINEL (DASHBOARD) */}
          {activeTab === "painel" && (
            <div style={{ padding: 20 }}>
              <h2 style={{ fontSize: 20, margin: "0 0 20px", fontWeight: 700 }}>Resumo de Hoje</h2>
              
              {/* Earnings Card */}
              <div style={{ background: "linear-gradient(135deg, var(--blue-soft), var(--purple-soft))", padding: 24, borderRadius: 20, border: "1px solid rgba(59,130,246,0.2)", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "relative", zIndex: 2 }}>
                  <div style={{ fontSize: 13, color: "var(--ink)", opacity: 0.8, marginBottom: 4, fontWeight: 600 }}>Ganhos do Dia</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)", letterSpacing: "-1px", marginBottom: 8 }}>{formatMoney(earningsToday)}</div>
                  <div style={{ fontSize: 12, color: "var(--blue)", fontWeight: 700, marginBottom: 16, background: "var(--glass-15)", padding: "4px 8px", borderRadius: 8, display: "inline-block" }}>
                    {deliveriesToday} corridas concluídas + gorjetas
                  </div>
                  
                  {/* Progress to goal */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, color: "var(--ink)", opacity: 0.8, fontWeight: 600, alignItems: "center" }}>
                      <span>
                        Meta diária: 
                        {isEditingGoal ? (
                          <input 
                            type="number" 
                            autoFocus 
                            onBlur={() => setIsEditingGoal(false)} 
                            value={goal} 
                            onChange={e => setGoal(Number(e.target.value))} 
                            style={{ width: 60, marginLeft: 8, background: "var(--glass-20)", color: "white", border: "1px solid white", borderRadius: 4, padding: "2px 6px", fontSize: 12, outline: "none" }} 
                          />
                        ) : (
                          <span onClick={() => setIsEditingGoal(true)} style={{ cursor: "pointer", borderBottom: "1px dashed var(--glass-50)", marginLeft: 4 }}>
                            {formatMoney(goal)} ✏️
                          </span>
                        )}
                      </span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: 6, background: "var(--black-10)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${progress}%`, background: "var(--blue)", borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
                {/* Decorative element */}
                <div style={{ position: "absolute", right: -20, top: -20, fontSize: 100, opacity: 0.05 }}>💰</div>
              </div>

              {/* Grid Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                <div style={{ background: "var(--panel)", padding: 16, borderRadius: 16, border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>📦</span>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{deliveriesToday}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Entregas</div>
                  </div>
                </div>
                <div style={{ background: "var(--glass-03)", backdropFilter: "blur(12px)", padding: 16, borderRadius: 16, border: "1px solid var(--glass-08)", display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🛣️</span>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{distanceToday.toFixed(1)} <span style={{fontSize: 14}}>km</span></div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{deliveriesToday} viagens (4.2km/cada)</div>
                  </div>
                </div>
                <div style={{ background: "var(--panel)", padding: 16, borderRadius: 16, border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🪙</span>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{formatMoney(tipsToday)}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Gorjetas</div>
                  </div>
                </div>
                <div style={{ background: "var(--panel)", padding: 16, borderRadius: 16, border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>⭐</span>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>4.9</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Avaliação</div>
                  </div>
                </div>
              </div>
              
              {activeOrders.length > 0 && (
                <button 
                  onClick={() => setActiveTab("entregas")}
                  style={{ width: "100%", padding: 16, background: "var(--blue)", color: "white", borderRadius: 12, border: 0, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span>Você tem {activeOrders.length} entrega{activeOrders.length > 1 ? 's' : ''} na fila</span>
                  <span>Ver fila →</span>
                </button>
              )}
            </div>
          )}

          {/* ENTREGAS */}
          {activeTab === "entregas" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ padding: "20px 20px 10px", display: "flex", gap: 8, background: "var(--panel)", borderBottom: "1px solid var(--line)", position: "sticky", top: 0, zIndex: 10 }}>
                <button onClick={() => setSubTab("ativas")} style={{ flex: 1, padding: "10px 0", background: subTab === "ativas" ? "var(--blue)" : "var(--surface)", color: subTab === "ativas" ? "white" : "var(--muted)", border: subTab === "ativas" ? "1px solid var(--blue)" : "1px solid var(--line)", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Fila ({activeOrders.length})</button>
                <button onClick={() => setSubTab("historico")} style={{ flex: 1, padding: "10px 0", background: subTab === "historico" ? "var(--blue)" : "var(--surface)", color: subTab === "historico" ? "white" : "var(--muted)", border: subTab === "historico" ? "1px solid var(--blue)" : "1px solid var(--line)", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Concluídas ({historyOrders.length})</button>
              </div>

              <div style={{ padding: 20, flex: 1 }}>
                {subTab === "ativas" && (
                  activeOrders.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 60 }}>
                      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>🛵</div>
                      <p style={{ fontWeight: 600, color: "var(--ink)", margin: "0 0 4px", fontSize: 16 }}>Nenhuma entrega no momento.</p>
                      <p style={{ margin: 0, fontSize: 14 }}>Aguarde novos pedidos.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {activeOrders.map((order) => {
                        const isExpanded = expandedOrder === order.id;
                        const isEnRoute = order.status === "Saiu";
                        const taxa = order.driverFee || 8.50;
                        const trocoPara = 100.00;
                        const valorTroco = trocoPara > order.total ? trocoPara - order.total : 0;
                        const enderecoCompleto = "Av. Min. Salgado Filho, 100, Centro - 12522-530";
                        const distanciaKm = ((order.id % 5) + 1.8).toFixed(1);

                        return (
                          <div key={order.id} style={{ background: "var(--panel)", borderRadius: 16, border: isEnRoute ? "2px solid var(--green)" : "1px solid var(--line)", overflow: "hidden", position: "relative", boxShadow: "0 4px 12px var(--black-05)" }}>
                            
                            {/* Card Header */}
                            <div style={{ background: isEnRoute ? "var(--green-soft)" : "var(--surface)", padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ background: isEnRoute ? "var(--green)" : "var(--blue)", color: "white", fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 6 }}>
                                  #{order.id}
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: isEnRoute ? "var(--green)" : "var(--ink)" }}>
                                  {isEnRoute ? "EM ROTA" : "AGUARDANDO COLETA"}
                                </span>
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>+{formatMoney(taxa)}</span>
                            </div>

                            {/* Card Body */}
                            <div style={{ padding: 16 }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
                                
                                {/* Timeline steps */}
                                <div style={{ display: "flex", gap: 12, position: "relative" }}>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 20 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: isEnRoute ? "var(--line)" : "var(--orange)", border: "2px solid var(--panel)", zIndex: 2 }} />
                                    <div style={{ flex: 1, width: 2, background: "var(--line)" }} />
                                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: isEnRoute ? "var(--green)" : "var(--line)", border: "2px solid var(--panel)", zIndex: 2 }} />
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
                                    <div>
                                      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>COLETA</div>
                                      <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600 }}>Casa do Forno</div>
                                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Restaurante</div>
                                    </div>
                                    <div>
                                      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                                        ENTREGA
                                        <span style={{ color: "var(--blue)" }}>{distanciaKm} km</span>
                                      </div>
                                      <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600 }}>{order.customer}</div>
                                      <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.4 }}>{enderecoCompleto}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Troco */}
                              {valorTroco > 0 && (
                                <div style={{ background: "var(--orange-soft)", border: "1px dashed var(--orange)", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, borderBottom: "1px solid rgba(249, 115, 22, 0.2)", paddingBottom: 12 }}>
                                    <span style={{ fontSize: 18 }}>💵</span>
                                    <div>
                                      <div style={{ fontSize: 11, color: "var(--orange)", fontWeight: 800 }}>PAGAMENTO EM DINHEIRO</div>
                                      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>O cliente vai pagar na entrega</div>
                                    </div>
                                  </div>
                                  
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                                    <span style={{ color: "var(--muted)" }}>Valor da Nota</span>
                                    <span style={{ color: "var(--ink)", fontWeight: 600 }}>{formatMoney(order.total)}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 13 }}>
                                    <span style={{ color: "var(--muted)" }}>Cliente vai dar</span>
                                    <span style={{ color: "var(--ink)", fontWeight: 600 }}>{formatMoney(trocoPara)}</span>
                                  </div>
                                  
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(249, 115, 22, 0.15)", padding: "12px", borderRadius: 8 }}>
                                    <span style={{ fontSize: 13, color: "var(--orange)", fontWeight: 800 }}>VOCÊ DEVOLVE (TROCO)</span>
                                    <strong style={{ fontSize: 18, color: "var(--orange)" }}>{formatMoney(valorTroco)}</strong>
                                  </div>
                                </div>
                              )}

                              {/* Details Toggle */}
                              <button
                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                style={{ width: "100%", background: "var(--surface)", border: 0, color: "var(--ink)", padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", justifyContent: "center", gap: 8 }}
                              >
                                {isExpanded ? "▲ Ocultar Itens" : "▼ Ver Itens do Pedido (Conferência)"}
                              </button>

                              {/* Itens */}
                              {isExpanded && (
                                <div style={{ background: "var(--surface-hover)", padding: 12, borderRadius: 8, marginTop: 8 }}>
                                  {order.detail.split(" • ").map((item, i) => (
                                    <div key={i} style={{ fontSize: 13, color: "var(--ink)", padding: "6px 0", borderBottom: i === order.detail.split(" • ").length - 1 ? "none" : "1px solid var(--line)", display: "flex", gap: 8 }}>
                                      <span style={{ color: "var(--muted)" }}>•</span> {item}
                                    </div>
                                  ))}
                                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--line)", display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>Total do Pedido</span>
                                    <span style={{ fontSize: 14, fontWeight: 700 }}>{formatMoney(order.total)}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div style={{ padding: "0 16px 16px" }}>
                              {isEnRoute ? (
                                <button
                                  onClick={() => onComplete(order.id)}
                                  style={{ width: "100%", background: "var(--green)", color: "white", padding: 16, borderRadius: 12, border: 0, fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }}
                                >
                                  <span>✓</span> Confirmar Entrega
                                </button>
                              ) : (
                                <button
                                  onClick={() => onAdvance(order.id)}
                                  style={{ width: "100%", background: "var(--blue)", color: "white", padding: 16, borderRadius: 12, border: 0, fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}
                                >
                                  <span>🛵</span> Iniciar Rota
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {subTab === "historico" && (
                  historyOrders.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 60 }}>
                      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>📦</div>
                      <p style={{ fontWeight: 600, color: "var(--ink)", margin: "0 0 4px", fontSize: 16 }}>Nenhuma entrega concluída hoje.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {historyOrders.map((order) => (
                        <div key={order.id} style={{ background: "var(--panel)", borderRadius: 12, padding: 16, border: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--surface)", display: "grid", placeItems: "center", fontSize: 16 }}>✅</div>
                            <div>
                              <strong style={{ display: "block", fontSize: 14, color: "var(--ink)", marginBottom: 2 }}>{order.customer}</strong>
                              <span style={{ fontSize: 12, color: "var(--muted)" }}>Pedido #{order.id}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ color: "var(--green)", fontWeight: 800, fontSize: 15, marginBottom: 2 }}>+{formatMoney(order.driverFee || 8.50)}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{order.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* PERFIL */}
          {activeTab === "perfil" && (
            <div style={{ padding: 20 }}>
              <div style={{ background: "var(--panel)", padding: 24, borderRadius: 16, border: "1px solid var(--line)", textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--blue-soft)", color: "var(--blue)", border: "2px solid rgba(59,130,246,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 16px", overflow: "hidden" }}>
                  {customPhoto ? <img src={customPhoto} alt="Avatar" style={{width: "100%", height: "100%", objectFit: "cover"}}/> : profileAvatar}
                </div>
                <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>{profileName}</h2>
                <p style={{ margin: 0, color: "var(--green)", fontSize: 13, fontWeight: 700 }}>Membro desde Mar/2025</p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, fontWeight: 700 }}>ESCOLHER AVATAR</p>
                  <label style={{ fontSize: 12, color: "var(--blue)", fontWeight: 700, cursor: "pointer", background: "var(--blue-soft)", padding: "4px 8px", borderRadius: 8 }}>
                    + Enviar Foto
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
                  </label>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                  {customPhoto && (
                    <button 
                      style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--blue)", border: "2px solid var(--blue)", fontSize: 28, cursor: "pointer", display: "grid", placeItems: "center", overflow: "hidden", padding: 0 }}
                    >
                      <img src={customPhoto} alt="Custom" style={{width: "100%", height: "100%", objectFit: "cover"}}/>
                    </button>
                  )}
                  {AVATARES.map((av) => (
                    <button 
                      key={av} 
                      onClick={() => { setProfileAvatar(av); setCustomPhoto(null); }} 
                      style={{ width: 56, height: 56, borderRadius: "50%", background: profileAvatar === av && !customPhoto ? "var(--blue)" : "var(--surface)", border: profileAvatar === av && !customPhoto ? "2px solid var(--blue)" : "1px solid var(--line)", fontSize: 28, cursor: "pointer", display: "grid", placeItems: "center", transition: "all 0.2s" }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, fontWeight: 700 }}>NOME DO PERFIL</p>
                <input 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", fontSize: 15, outline: "none", fontWeight: 600 }} 
                />
              </div>

              <div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, fontWeight: 700 }}>VEÍCULO</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setVehicle("moto")} style={{ flex: 1, padding: "12px", background: vehicle === "moto" ? "var(--blue-soft)" : "var(--surface)", border: vehicle === "moto" ? "1px solid var(--blue)" : "1px solid var(--line)", color: vehicle === "moto" ? "var(--blue)" : "var(--muted)", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>🛵 Moto</button>
                  <button onClick={() => setVehicle("bike")} style={{ flex: 1, padding: "12px", background: vehicle === "bike" ? "var(--blue-soft)" : "var(--surface)", border: vehicle === "bike" ? "1px solid var(--blue)" : "1px solid var(--line)", color: vehicle === "bike" ? "var(--blue)" : "var(--muted)", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>🚲 Bike</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div style={{ background: "var(--panel)", borderTop: "1px solid var(--line)", padding: "12px 20px 24px", display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setActiveTab("painel")} style={tabStyle("painel")}>
            <div style={{ background: activeTab === "painel" ? "var(--blue-soft)" : "transparent", color: activeTab === "painel" ? "var(--blue)" : "inherit", padding: "4px 16px", borderRadius: 16, marginBottom: 4, transition: "background 0.2s" }}>
              <span style={{ fontSize: 20 }}>📊</span>
            </div>
            Painel
          </button>
          <button onClick={() => setActiveTab("entregas")} style={tabStyle("entregas")}>
            <div style={{ position: "relative", background: activeTab === "entregas" ? "var(--blue-soft)" : "transparent", color: activeTab === "entregas" ? "var(--blue)" : "inherit", padding: "4px 16px", borderRadius: 16, marginBottom: 4, transition: "background 0.2s" }}>
              <span style={{ fontSize: 20 }}>🛵</span>
              {activeOrders.length > 0 && (
                <span style={{ position: "absolute", top: 0, right: 0, background: "var(--blue)", color: "white", fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 10, border: "2px solid var(--panel)" }}>{activeOrders.length}</span>
              )}
            </div>
            Entregas
          </button>
          <button onClick={() => setActiveTab("perfil")} style={tabStyle("perfil")}>
            <div style={{ background: activeTab === "perfil" ? "var(--blue-soft)" : "transparent", color: activeTab === "perfil" ? "var(--blue)" : "inherit", padding: "4px 16px", borderRadius: 16, marginBottom: 4, transition: "background 0.2s" }}>
              <span style={{ fontSize: 20 }}>👤</span>
            </div>
            Perfil
          </button>
        </div>
      </div>
    </div>
  );
}
