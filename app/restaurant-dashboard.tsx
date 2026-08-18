"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { ThemeToggle } from "../components/theme-toggle";
import type { AppRole, View, Order, OrderStatus } from "./_types";
import {
  navigation,
  initialOrders,
  initialTables,
  initialVarandaTables,
  initialWaiters,
  initialMenuItems,
  initialJardinsOrders,
  initialJardinsTables,
  initialJardinsWaiters,
} from "./_data/mock-data";
import { formatMoney, isOrder, playSound, toggleMute, getMuted } from "./_lib/utils";
import { AppIcon } from "./_components/AppIcon";
import { OverviewView } from "./_views/OverviewView";
import { OrdersView } from "./_views/OrdersView";
import { WhatsAppView } from "./_views/WhatsAppView";
import { DiningView } from "./_views/DiningView";
import { MenuView } from "./_views/MenuView";
import { DeliveryView } from "./_views/DeliveryView";
import { ReportsView } from "./_views/ReportsView";
import { CrmView } from "./_views/CrmView";
import { IntegrationsView } from "./_views/IntegrationsView";
import { SettingsView } from "./_views/SettingsView";
import { KdsView } from "./_views/KdsView";
import { WaiterView } from "./_views/WaiterView";
import { DriverView } from "./_views/DriverView";
import { ClientMenuSimulator } from "./_views/ClientMenuSimulator";

export type { AppRole };

export function RestaurantDashboard({ role = "admin" }: { role?: AppRole }) {
  // Navigation filtered by role
  const filteredNavigation = useMemo(() => {
    if (role === "admin") return navigation;
    if (role === "balcao") return navigation.filter((n) => ["Visão geral", "Pedidos", "WhatsApp", "Salão"].includes(n.label));
    if (role === "garcom") return navigation.filter((n) => ["Salão", "Cardápio"].includes(n.label));
    if (role === "cozinha") return navigation.filter((n) => ["Pedidos", "Cardápio"].includes(n.label));
    if (role === "entregador") return navigation.filter((n) => ["Entregas"].includes(n.label));
    return navigation.filter((n) => ["Visão geral"].includes(n.label)); // fallback seguro
  }, [role]);

  // Default view based on role
  const defaultView = useMemo<View>(() => {
    if (role === "garcom") return "Salão";
    if (role === "cozinha") return "Pedidos";
    if (role === "entregador") return "Entregas";
    return "Visão geral";
  }, [role]);

  const [activeView, setActiveView] = useState<View>(defaultView);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const feeInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<number | undefined>(undefined);
  const activeUnitRef = useRef<"Matriz" | "Jardins">("Matriz");

  // Sync orders from API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch("/api/menu-items");
        if (response.ok) {
          const data = (await response.json()) as any;
          if (data.items) setMenuItems(data.items);
        }
      } catch (err) {
        console.error("Failed to fetch menu items", err);
      }
    };
    fetchMenu();
  }, []);

  // Sync orders from API
  useEffect(() => {
    let mounted = true;
    let controller: AbortController | undefined;
    const fetchOrders = async () => {
      if (activeUnitRef.current !== "Matriz") return;
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/orders", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const data = (await response.json()) as { orders?: unknown };
        if (mounted && Array.isArray(data.orders)) {
          const persisted = data.orders.filter(isOrder);
          const ids = new Set(persisted.map((o) => o.id));
          setOrders([...persisted, ...initialOrders.filter((o) => !ids.has(o.id))]);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("Não foi possível sincronizar os pedidos.", error);
      }
    };
    void fetchOrders();
    const interval = window.setInterval(fetchOrders, 15_000);
    return () => { mounted = false; controller?.abort(); window.clearInterval(interval); };
  }, []);

  // Carrega configurações da loja (taxa de serviço, etc.)
  const [serviceFeeActive, setServiceFeeActive] = useState(true); // padrão: ativo
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("2type-token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch("/api/settings", { headers })
      .then((r) => r.ok ? (r.json() as Promise<Record<string, string>>) : Promise.resolve(null))
      .then((data) => {
        if (!data) return;
        if ("service_fee_active" in data) {
          setServiceFeeActive(data.service_fee_active === "true");
        }
        if ("num_tables" in data) {
          const limit = parseInt(data.num_tables, 10);
          if (!isNaN(limit)) {
            setTables(prev => {
              // Mantém apenas as mesas cujo número é <= limit, ou expande se limit for maior
              let next = prev.filter(t => t.number <= limit);
              const currentMax = prev.length > 0 ? Math.max(...prev.map(t => t.number)) : 0;
              if (limit > currentMax) {
                for (let i = currentMax + 1; i <= limit; i++) {
                  next.push({
                    number: i, seats: 4, status: "Livre", guests: 0, total: 0, items: [],
                    x: 10 + ((i * 12) % 70), y: 10 + ((i * 8) % 70), width: 96, height: 72, area: "salao"
                  });
                }
              }
              return next;
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  const [tables, setTables] = useState([...initialTables, ...initialVarandaTables]);
  const [waiters, setWaiters] = useState(initialWaiters);
  const [selectedTable, setSelectedTable] = useState(2);
  const [feeModal, setFeeModal] = useState(false);
  const [addItemModal, setAddItemModal] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [cart, setCart] = useState<{ name: string; quantity: number; price: number }[]>([]);
  const [discount, setDiscount] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("8,90");
  const [driverFeeInput, setDriverFeeInput] = useState("8,50");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [muted, setMuted] = useState(getMuted());
  const [orderFilter, setOrderFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [splitCount, setSplitCount] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Pedido #1052 aguardando taxa de entrega", time: "há 3 min", read: false },
    { id: 2, text: "Mesa 04 pediu a conta — pronto para cobrar", time: "há 8 min", read: false },
    { id: 3, text: "Beatriz Lima perguntou sobre opção sem lactose", time: "há 12 min", read: true },
    { id: 4, text: "Entregador Diego saiu com o pedido #1046", time: "há 25 min", read: true },
  ]);
  const [reserveModal, setReserveModal] = useState(false);
  const [reserveTableNum, setReserveTableNum] = useState<number | null>(null);
  const [reserveData, setReserveData] = useState({ name: "", time: "", guests: 2 });
  const [activeUnit, setActiveUnit] = useState<"Matriz" | "Jardins">("Matriz");
  const [showUnitSwitcher, setShowUnitSwitcher] = useState(false);
  const [kdsMode, setKdsMode] = useState(false);
  const [waiterMode, setWaiterMode] = useState(false);
  const [clientSimulatorTable, setClientSimulatorTable] = useState<number | null>(null);

  // Logged user — read from localStorage (written at login)
  const [loggedUser] = useState(() => {
    if (typeof window === "undefined") return { name: "", role };
    return {
      name: localStorage.getItem("userName") ?? "",
      role: (localStorage.getItem("userRole") as typeof role) ?? role,
    };
  });

  const displayName = loggedUser.name || (role === "admin" ? "Barbosa" : role === "balcao" ? "Caixa Central" : role === "garcom" ? "Garçom" : role === "cozinha" ? "Cozinha" : "Entregador");
  const displayRole = role === "admin" ? "Administrador" : role === "balcao" ? "Balconista" : role === "garcom" ? "Atendimento" : role === "cozinha" ? "Produção" : "Entregador";
  const displayInitials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || role.slice(0, 2).toUpperCase();

  useEffect(() => { activeUnitRef.current = activeUnit; }, [activeUnit]);

  // AI tips interval
  useEffect(() => {
    if (!aiEnabled) return;
    const tips = [
      "🤖 IA: Vendas de pizza estão 30% abaixo da média nesta quinta — quer ativar promoção?",
      "🤖 IA: Mesa 4 está há 1h40 sem pedir sobremesa — boa hora para oferecer!",
      "🤖 IA: Camila Rocha pediu 14x. Ela não pede há 2 semanas — enviar cupom?",
      "🤖 IA: A taxa de ocupação da Varanda caiu 15% nos últimos 3 dias.",
    ];
    const interval = window.setInterval(() => {
      const tip = tips[Math.floor(Math.random() * tips.length)];
      setNotifications((n) => [{ id: Math.random(), text: tip, time: "agora", read: false }, ...n]);
      setToast(tip.replace("🤖 IA: ", ""));
      playSound("ding");
    }, 45000);
    return () => window.clearInterval(interval);
  }, [aiEnabled]);

  const todayLabel = useMemo(() => {
    const formatted = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" }).format(new Date());
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!feeModal) return;
    const frame = window.requestAnimationFrame(() => feeInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [feeModal]);

  useEffect(() => {
    if (!feeModal && !addItemModal && !checkoutModal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setFeeModal(false);
      setAddItemModal(false);
      setCheckoutModal(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [feeModal, addItemModal, checkoutModal]);

  useEffect(() => () => { if (toastTimerRef.current !== undefined) window.clearTimeout(toastTimerRef.current); }, []);

  const pendingFee = orders.find((order) => order.feePending);
  const table = tables.find((item) => item.number === selectedTable) ?? tables[0];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesChannel = orderFilter === "Todos" || order.channel === orderFilter;
      const term = search.toLocaleLowerCase("pt-BR");
      const matchesSearch = !term || `${order.id} ${order.customer} ${order.detail}`.toLocaleLowerCase("pt-BR").includes(term);
      return matchesChannel && matchesSearch;
    });
  }, [orders, orderFilter, search]);

  const notify = (message: string) => {
    if (toastTimerRef.current !== undefined) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    playSound("ding");
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2800);
  };

  const applyFee = () => {
    const fee = Number(deliveryFee.replace(".", "").replace(",", "."));
    const dFee = Number(driverFeeInput.replace(".", "").replace(",", "."));
    if (!pendingFee || Number.isNaN(fee) || Number.isNaN(dFee)) return;
    setOrders((current) => current.map((order) =>
      order.id === pendingFee.id ? { ...order, total: order.total + fee, driverFee: dFee, feePending: false, status: "Confirmado" } : order
    ));
    setFeeModal(false);
    notify(`Taxa adicionada. Pedido #${pendingFee.id} confirmado.`);

    fetch(`/api/orders/${pendingFee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total: Math.round((pendingFee.total + fee) * 100), driverFee: Math.round(dFee * 100), feePending: false, status: "Confirmado" })
    }).catch(console.error);
  };

  const advanceOrder = (id: number) => {
    const flow: OrderStatus[] = ["Novo", "Confirmado", "Em preparo", "Pronto", "Despachado", "Saiu", "Entregue"];
    let justFinished = false;
    let nextStatus: OrderStatus | undefined;
    setOrders((current) => current.map((order) => {
      if (order.id !== id || order.feePending) return order;
      const currentIdx = flow.indexOf(order.status);
      const nextIdx = Math.min(currentIdx + 1, flow.length - 1);
      if (nextIdx === flow.length - 1 && currentIdx !== flow.length - 1) justFinished = true;
      nextStatus = flow[nextIdx];
      return { ...order, status: nextStatus };
    }));
    if (justFinished) playSound("success");
    else playSound("pop");
    notify("Etapa do pedido atualizada.");

    if (nextStatus) {
      fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      }).catch(console.error);
    }
  };

  const openAddItemModal = () => { setCart([]); setAddItemModal(true); };

  const confirmAddItems = () => {
    if (cart.length === 0) { setAddItemModal(false); return; }
    const totalToAdd = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    setTables((current) => current.map((item) =>
      item.number === selectedTable
        ? { ...item, status: "Ocupada", guests: item.guests || 2, total: item.total + totalToAdd, time: item.time || "agora", items: [...item.items, ...cart] }
        : item
    ));
    addOrder({
      id: 3000 + Math.floor(Math.random() * 1000),
      customer: `Mesa ${String(selectedTable).padStart(2, "0")}`,
      channel: "Salão",
      detail: cart.map((i) => `${i.quantity}x ${i.name}`).join(" • "),
      total: totalToAdd,
      time: "agora",
      status: "Novo",
    });
    setAddItemModal(false);
    notify(`${cart.reduce((a, b) => a + b.quantity, 0)} itens lançados na mesa.`);
  };

  const openCheckoutModal = () => { setDiscount(""); setAppliedDiscount(0); setPaymentMethod(""); setCheckoutModal(true); };

  const applyDiscount = () => {
    const percent = parseFloat(discount.replace(",", "."));
    if (!isNaN(percent) && percent > 0 && percent <= 100) {
      setAppliedDiscount(table.total * (percent / 100));
      notify(`Desconto de ${percent}% aplicado com sucesso!`);
    } else {
      setAppliedDiscount(0);
      if (discount.trim() !== "") notify("Porcentagem de desconto inválida.");
    }
  };

  const closeTable = () => {
    if (!paymentMethod && table.total > 0) { notify("Selecione um método de pagamento."); return; }
    const fee = serviceFeeActive ? table.total * 0.1 : 0;
    setTables((current) => current.map((item) =>
      item.number === selectedTable ? { ...item, status: "Livre", guests: 0, total: 0, time: undefined, items: [] } : item
    ));
    setCheckoutModal(false);
    playSound("success");
    const totalPaid = table.total + fee - appliedDiscount;
    notify(`Mesa ${String(selectedTable).padStart(2, "00")} paga via ${paymentMethod || "Dinheiro"} — ${formatMoney(totalPaid)} — e liberada.`);
  };

  const chooseView = (view: View) => { setActiveView(view); setMobileMenu(false); setShowNotifications(false); };

  const addOrder = (order: Order) => {
    setOrders((current) => [order, ...current]); 
    notify(`Pedido #${order.id} criado com sucesso!`); 
    playSound("ding"); 

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: order.customer,
        channel: order.channel,
        detail: order.detail,
        total: Math.round(order.total * 100),
        time: order.time,
        status: order.status
      })
    }).catch(console.error);
  };

  const openReserveModal = (tableNum: number) => { setReserveTableNum(tableNum); setReserveData({ name: "", time: "", guests: 2 }); setReserveModal(true); };

  const confirmReservation = () => {
    if (!reserveTableNum || !reserveData.name || !reserveData.time) { notify("Preencha o nome e o horário da reserva."); return; }
    setTables((current) => current.map((t) =>
      t.number === reserveTableNum ? { ...t, status: "Reservada", time: reserveData.time, guests: reserveData.guests, reservedFor: reserveData.name } : t
    ));
    setReserveModal(false);
    notify(`Mesa ${String(reserveTableNum).padStart(2, "0")} reservada para ${reserveData.name} às ${reserveData.time}.`);
    playSound("success");
  };

  // ─── Role-specific views ────────────────────────────────────────────────────
  if (role === "entregador") {
    return (
      <DriverView
        orders={orders}
        onAdvance={advanceOrder}
        onComplete={(id) => setOrders((curr) => curr.map((o) => o.id === id ? { ...o, status: "Entregue" } : o))}
        onExit={() => { window.location.href = "/"; }}
      />
    );
  }

  if (role === "cozinha" || kdsMode) {
    return <KdsView orders={orders} onAdvance={advanceOrder} onExit={() => role === "cozinha" ? (window.location.href = "/") : setKdsMode(false)} />;
  }

  if (role === "garcom" || waiterMode) {
    return (
      <WaiterView
        tables={tables}
        menuItems={menuItems}
        onExit={() => role === "garcom" ? (window.location.href = "/") : setWaiterMode(false)}
        onAddItems={(tableNum, items) => {
          const totalToAdd = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
          setTables((current) => current.map((t) => {
            if (t.number !== tableNum) return t;
            const newItems = [...(t.items || [])];
            items.forEach((ni) => {
              const existing = newItems.find((i) => 
                i.name === ni.name && 
                JSON.stringify(i.options) === JSON.stringify(ni.options) && 
                i.observations === ni.observations
              );
              if (existing) existing.quantity += ni.quantity;
              else newItems.push({ ...ni });
            });
            return { ...t, status: "Ocupada", total: t.total + totalToAdd, items: newItems };
          }));
          addOrder({
            id: 3000 + Math.floor(Math.random() * 1000),
            customer: `Mesa ${String(tableNum).padStart(2, "0")}`,
            channel: "Salão",
            detail: items.map((i) => {
               const ops = i.options?.length ? ` (${i.options.join(", ")})` : "";
               const obs = i.observations ? ` [${i.observations}]` : "";
               return `${i.quantity}x ${i.name}${ops}${obs}`;
            }).join(" • "),
            total: totalToAdd,
            time: "agora",
            status: "Novo",
          });
        }}
      />
    );
  }

  // ─── Main admin/balcao layout ──────────────────────────────────────────────
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <button
          className="brand"
          type="button"
          onClick={() => chooseView("Visão geral")}
          style={{ padding: "8px 16px", background: "transparent", border: 0, cursor: "pointer" }}
        >
          <img src="/logopng.png" alt="2Type Control" className="main-logo" style={{ width: "100%", maxHeight: 110, objectFit: "contain" }} />
        </button>

        <div style={{ position: "relative" }}>
          <button className="restaurant-switch" type="button" onClick={() => setShowUnitSwitcher(!showUnitSwitcher)}>
            <span className="restaurant-avatar">{activeUnit === "Matriz" ? "CF" : "CJ"}</span>
            <span><strong>Casa do Forno</strong><small>Unidade {activeUnit}</small></span>
            <span className="chevron">⌄</span>
          </button>
          {showUnitSwitcher && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={() => setShowUnitSwitcher(false)} />
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 16, right: 16, background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, padding: 8, zIndex: 110, display: "flex", flexDirection: "column", gap: 4 }}>
                {(["Matriz", "Jardins"] as const).map((unit) => (
                  <button key={unit} type="button"
                    style={{ padding: "8px 12px", background: activeUnit === unit ? "var(--purple-soft)" : "transparent", border: 0, color: "var(--ink)", borderRadius: 6, textAlign: "left", cursor: "pointer" }}
                    onClick={() => {
                      setActiveUnit(unit);
                      if (unit === "Matriz") { setOrders(initialOrders); setTables([...initialTables, ...initialVarandaTables]); setWaiters(initialWaiters); }
                      else { setOrders(initialJardinsOrders); setTables(initialJardinsTables); setWaiters(initialJardinsWaiters); }
                      setShowUnitSwitcher(false);
                      notify(`Unidade ${unit} carregada.`);
                    }}>
                    Unidade {unit}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <nav className="nav-list" aria-label="Navegação principal">
          {filteredNavigation.map((item) => (
            <div key={item.label}>
              {item.group && <div className="nav-group">{item.group}</div>}
              <button
                type="button"
                className={`nav-item ${activeView === item.label ? "active" : ""}`}
                onClick={() => chooseView(item.label)}
                aria-current={activeView === item.label ? "page" : undefined}
              >
                <span className="icon-box"><AppIcon name={item.icon} /></span>
                <span>{item.label}</span>
                {(item.label === "Pedidos" || item.badge) && (
                  <span className={`nav-badge ${item.label === "WhatsApp" ? "green" : ""}`}>
                    {item.label === "Pedidos" ? orders.filter((o) => o.status !== "Saiu").length : item.badge}
                  </span>
                )}
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="nav-item"
            style={{ marginBottom: "14px", minHeight: "36px", padding: "6px 10px" }}
            onClick={() => { const newState = toggleMute(); setMuted(newState); if (!newState) playSound("pop"); }}
            title={muted ? "Ligar sons" : "Desligar sons"}
          >
            <span style={{ fontSize: "14px" }}>{muted ? "🔇" : "🔊"}</span>
            <span style={{ flex: 1, color: "var(--muted)", textAlign: "left" }}>{muted ? "Sons mutados" : "Sons ativados"}</span>
          </button>
          <button className="integration-card" type="button" onClick={() => chooseView("Integrações")}>
            <span className="integration-icon">⌁</span>
            <span><strong>Integrações</strong><small>3 de 4 conectadas</small></span>
            <span className="integration-progress"><i /></span>
          </button>
          <div className="user-card" role="button" tabIndex={0} onClick={() => { localStorage.removeItem("userRole"); localStorage.removeItem("userName"); localStorage.removeItem("2type-token"); window.location.href = "/"; }} onKeyDown={(e) => e.key === "Enter" && (window.location.href = "/")} title="Sair do Sistema" style={{ cursor: "pointer" }}>
            <span className="user-avatar">{displayInitials}</span>
            <span>
              <strong>{displayName}</strong>
              <small>{displayRole}</small>
            </span>
            <span className="more" style={{ color: "var(--red)", fontSize: 18 }}>⍈</span>
          </div>
        </div>
      </aside>
      {mobileMenu && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button" type="button" aria-label="Abrir menu" aria-expanded={mobileMenu} onClick={() => setMobileMenu(true)}>☰</button>
          <div>
            <h1>{activeView === "Visão geral" ? `${new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite"}${role === "balcao" ? "" : `, ${displayName.split(" ")[0]}`}! 👋` : activeView}</h1>
            {activeView === "Visão geral" && (
              <p className="topbar-subtitle">{todayLabel} <span>•</span> <b><i /> Restaurante aberto</b></p>
            )}
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <label className="search-box">
              <span>⌕</span>
              <input ref={searchInputRef} aria-label="Buscar pedido ou cliente" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar pedido ou cliente..." />
              <kbd>⌘ K</kbd>
            </label>
            <div style={{ position: "relative" }}>
              <button className="round-button notification" type="button" aria-label="Notificações" onClick={() => setShowNotifications((v) => !v)}>
                🔔{notifications.some((n) => !n.read) && <i />}
              </button>
              {showNotifications && (
                <>
                  <button type="button" aria-label="Fechar notificações" style={{ position: "fixed", inset: 0, background: "transparent", border: 0, zIndex: 190, cursor: "default" }} onClick={() => setShowNotifications(false)} />
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, width: 340, zIndex: 200, boxShadow: "0 20px 60px var(--black-50)" }}>
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: 14 }}>Notificações</strong>
                      <button type="button" onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))} style={{ background: "transparent", border: 0, color: "var(--orange)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Marcar todas como lidas</button>
                    </div>
                    {notifications.map((n) => (
                      <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--glass-04)", background: n.read ? "transparent" : "var(--purple-soft)", display: "flex", gap: 10, cursor: "pointer" }}
                        onClick={() => setNotifications((ns) => ns.map((x) => x.id === n.id ? { ...x, read: true } : x))}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "transparent" : "var(--purple)", marginTop: 5, flexShrink: 0, border: n.read ? "1px solid var(--line)" : "none" }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 12, color: n.read ? "var(--muted)" : "var(--ink)", lineHeight: 1.5 }}>{n.text}</p>
                          <small style={{ color: "var(--muted)", fontSize: 10 }}>{n.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className="live-status" type="button"><i /> Ao vivo</button>
            {role === "admin" && (
              <>
                <button className="primary-button" type="button" onClick={() => setWaiterMode(true)} style={{ marginLeft: 16, padding: "8px 12px", background: "var(--blue)" }}>📱 Modo Garçom</button>
                <button className="primary-button" type="button" onClick={() => setKdsMode(true)} style={{ marginLeft: 8, padding: "8px 12px", background: "var(--orange)" }}>Modo Cozinha (KDS)</button>
              </>
            )}
          </div>
        </header>

        {activeView === "Visão geral" && (
          <OverviewView orders={orders} tables={tables} pendingFee={pendingFee} aiEnabled={aiEnabled}
            onToggleAi={() => setAiEnabled((v) => !v)} onOpenFee={() => setFeeModal(true)}
            onView={chooseView} onSelectTable={(number) => { setSelectedTable(number); chooseView("Salão"); }} onAdvance={advanceOrder} />
        )}
        {activeView === "Pedidos" && (
          <OrdersView orders={filteredOrders} filter={orderFilter} onFilter={setOrderFilter}
            onAdvance={advanceOrder} onOpenFee={() => setFeeModal(true)} onNotify={notify} onAddOrder={addOrder} />
        )}
        {activeView === "WhatsApp" && (
          <WhatsAppView aiEnabled={aiEnabled} onToggleAi={() => setAiEnabled((v) => !v)} onNotify={notify} />
        )}
        {activeView === "Salão" && (
          <DiningView
            tables={tables} waiters={waiters} selected={table}
            onSelect={setSelectedTable} onAddItem={openAddItemModal} onClose={openCheckoutModal}
            onNotify={notify}
            onUpdateTable={(t) => setTables((current) => current.map((c) => c.number === t.number ? t : c))}
            onAddTable={(area) => setTables((current) => [...current, { number: current.length > 0 ? Math.max(...current.map((c) => c.number)) + 1 : 1, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 50, y: 50, width: 104, height: 76, area }])}
            onRemoveTable={(num) => { setTables((current) => current.filter((c) => c.number !== num)); if (selectedTable === num) setSelectedTable(tables.find((t) => t.number !== num)?.number ?? 1); }}
            onWaitersUpdate={setWaiters} onOpenReserve={openReserveModal} onOpenQr={(num) => setClientSimulatorTable(num)} />
        )}
        {activeView === "Cardápio" && <MenuView menuItems={menuItems} setMenuItems={setMenuItems} onNotify={notify} />}
        {activeView === "Entregas" && <DeliveryView orders={orders} pendingFee={pendingFee} onOpenFee={() => setFeeModal(true)} onNotify={notify} onAdvance={advanceOrder} />}
        {activeView === "Relatórios" && <ReportsView />}
        {activeView === "CRM" && <CrmView />}
        {activeView === "Integrações" && <IntegrationsView />}
        {activeView === "Configurações" && <SettingsView />}
      </main>

      {/* ─── Modal: Taxa de entrega ─────────────────────── */}
      {feeModal && pendingFee && (
        <div className="modal-backdrop">
          <style dangerouslySetInnerHTML={{ __html: `
            .pro-fee-modal {
              background: linear-gradient(180deg, var(--panel) 0%, var(--surface) 100%);
              border: 1px solid var(--line);
              box-shadow: 0 40px 100px var(--black-30), inset 0 1px 0 var(--glass-05);
              border-radius: 24px;
              padding: 32px;
              width: 100%;
              max-width: 480px;
              position: relative;
            }
            .pro-fee-modal h2 {
              font-size: 22px;
              font-weight: 700;
              margin: 0 0 12px 0;
              color: var(--ink);
            }
            .pro-fee-modal p.desc {
              color: var(--muted);
              font-size: 13px;
              line-height: 1.5;
              margin: 0 0 24px 0;
            }
            .pro-fee-wrapper {
              position: relative;
              display: flex;
              align-items: center;
            }
            .pro-fee-input {
              width: 100%;
              height: 56px;
              background: var(--panel);
              border: 1px solid var(--line);
              border-radius: 12px;
              color: var(--ink);
              padding: 0 16px 0 46px;
              font-size: 18px;
              font-weight: 700;
              transition: all 0.2s;
              outline: none;
            }
            .pro-fee-input:focus {
              border-color: var(--orange);
              box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
            }
            .pro-fee-prefix {
              position: absolute;
              left: 16px;
              font-size: 16px;
              font-weight: 700;
              color: var(--orange);
              pointer-events: none;
            }
            .pro-fee-button {
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
              margin-top: 24px;
              width: 100%;
            }
            .pro-fee-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 32px rgba(245, 158, 11, 0.35);
            }
            .pro-address-card {
              background: var(--panel);
              border: 1px dashed var(--line);
              border-radius: 12px;
              padding: 16px;
              display: flex;
              gap: 12px;
              align-items: center;
              margin-bottom: 24px;
            }
            .pro-address-icon {
              width: 36px;
              height: 36px;
              border-radius: 10px;
              background: var(--orange-soft);
              color: var(--orange);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .pro-address-info strong {
              display: block;
              font-size: 13px;
              color: var(--ink);
            }
            .pro-address-info small {
              display: block;
              font-size: 11px;
              color: var(--muted);
              margin-top: 4px;
            }
            .pro-fee-summary {
              background: var(--panel);
              border: 1px solid var(--line);
              border-radius: 12px;
              padding: 16px;
              margin-top: 16px;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .pro-fee-summary-row {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              color: var(--muted);
            }
            .pro-fee-summary-row.total {
              padding-top: 12px;
              border-top: 1px dashed var(--line);
              font-size: 15px;
              color: var(--ink);
              font-weight: 700;
            }
          `}} />
          <button className="modal-scrim" type="button" aria-label="Fechar taxa de entrega" onClick={() => setFeeModal(false)} />
          <section className="pro-fee-modal" role="dialog" aria-modal="true" aria-labelledby="fee-title">
            <button className="pro-close" type="button" aria-label="Fechar" onClick={() => setFeeModal(false)} style={{
              position: "absolute", top: 24, right: 24, width: 32, height: 32, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--line)", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s"
            }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width: 16, height: 16}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <p className="eyebrow orange" style={{ marginBottom: 12 }}>PEDIDO DO SITE</p>
            <h2 id="fee-title">Confirmar Taxa de Entrega</h2>
            <p className="desc">O pedido <strong>#{pendingFee.id}</strong> de {pendingFee.customer} já está pronto. Informe a taxa para confirmar e enviar a comanda para a produção.</p>
            
            <div className="pro-address-card">
              <div className="pro-address-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{width: 20, height: 20}}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <div className="pro-address-info">
                <strong>Rua das Acácias, 148 — Centro</strong>
                <small>3,2 km da Casa do Forno • aprox. 18 min</small>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Taxa ao Cliente</span>
                <div className="pro-fee-wrapper">
                  <span className="pro-fee-prefix">R$</span>
                  <input className="pro-fee-input" ref={feeInputRef} aria-label="Taxa de entrega em reais" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} inputMode="decimal" />
                </div>
              </div>
              <div>
                <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Repasse ao Entregador</span>
                <div className="pro-fee-wrapper">
                  <span className="pro-fee-prefix">R$</span>
                  <input className="pro-fee-input" aria-label="Repasse entregador" value={driverFeeInput} onChange={(e) => setDriverFeeInput(e.target.value)} inputMode="decimal" />
                </div>
              </div>
            </div>

            <div className="pro-fee-summary">
              <div className="pro-fee-summary-row">
                <span>Subtotal do pedido</span>
                <strong>{formatMoney(pendingFee.total)}</strong>
              </div>
              <div className="pro-fee-summary-row total">
                <span>Total com entrega</span>
                <strong style={{ color: "var(--orange)" }}>{formatMoney(pendingFee.total + (Number(deliveryFee.replace(",", ".")) || 0))}</strong>
              </div>
            </div>

            <button className="pro-fee-button" type="button" onClick={applyFee}>
              Confirmar pedido e enviar à cozinha
            </button>
          </section>
        </div>
      )}

      {/* ─── Modal: Adicionar item à mesa ────────────────── */}
      {addItemModal && (
        <div className="modal-backdrop">
          <button className="modal-scrim" type="button" aria-label="Fechar catálogo" onClick={() => setAddItemModal(false)} />
          <section className="fee-modal pdv-modal" role="dialog" aria-modal="true" aria-labelledby="catalog-title">
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setAddItemModal(false)}>×</button>
            <p className="eyebrow orange">CATÁLOGO</p>
            <h2 id="catalog-title">Adicionar à Mesa {String(selectedTable).padStart(2, "0")}</h2>
            <div className="modal-content">
              <div className="catalog-grid">
                {menuItems.map((item) => {
                  const inCart = cart.find((c) => c.name === item.name)?.quantity || 0;
                  return (
                    <button className="catalog-item" type="button" disabled={!item.available} key={item.name}
                      onClick={() => setCart((c) => {
                        const exists = c.find((i) => i.name === item.name);
                        if (exists) return c.map((i) => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
                        return [...c, { name: item.name, quantity: 1, price: item.price }];
                      })}>
                      <div className="thumb">{item.name.slice(0, 1)}</div>
                      <div className="info">
                        <div><h3>{item.name}</h3><p>{item.available ? item.category : "Indisponível"}</p></div>
                        <div className="price-row"><strong>{formatMoney(item.price)}</strong><span className="add-btn" aria-hidden="true">{inCart > 0 ? inCart : "+"}</span></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)" }}>
              <button className="primary-button wide" type="button" onClick={confirmAddItems}>Confirmar Lançamento</button>
            </div>
          </section>
        </div>
      )}

      {/* ─── Modal: Fechar conta ─────────────────────────── */}
      {checkoutModal && (
        <div className="modal-backdrop">
          <button className="modal-scrim" type="button" aria-label="Fechar pagamento" onClick={() => setCheckoutModal(false)} />
          <section className="fee-modal pdv-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setCheckoutModal(false)}>×</button>
            <p className="eyebrow orange">FECHAR CONTA</p>
            <h2 id="checkout-title">Mesa {String(selectedTable).padStart(2, "0")}</h2>
            <div className="checkout-grid">
              <div>
                <div className="checkout-list">
                  <div className="checkout-list-header">RESUMO DOS ITENS</div>
                  <div className="checkout-list-body">
                    {table.items.map((item, idx) => (
                      <div className="checkout-list-item" key={idx}>
                        <span>{item.quantity}x {item.name}</span><strong>{formatMoney(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                    {table.items.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "#999", fontSize: 10 }}>Nenhum item consumido.</div>}
                  </div>
                </div>
                <div className="discount-box">
                  <input aria-label="Desconto em porcentagem" type="number" placeholder="Desconto (%)" value={discount} onChange={(e) => setDiscount(e.target.value)} min="0" max="100" />
                  <button type="button" onClick={applyDiscount}>APLICAR</button>
                </div>
              </div>
              <div>
                <div className="checkout-summary">
                  <div className="checkout-summary-row"><span>Subtotal</span><strong>{formatMoney(table.total)}</strong></div>
                  {serviceFeeActive && (
                    <div className="checkout-summary-row"><span>Serviço (10%)</span><strong>{formatMoney(table.total * 0.1)}</strong></div>
                  )}
                  {!serviceFeeActive && (
                    <div className="checkout-summary-row" style={{ color: "var(--green)", fontSize: 12 }}><span>Taxa de serviço</span><strong>Não cobrada</strong></div>
                  )}
                  {appliedDiscount > 0 && <div className="checkout-summary-row" style={{ color: "var(--orange)" }}><span>Desconto</span><strong>- {formatMoney(appliedDiscount)}</strong></div>}
                  <div className="checkout-summary-row total"><span>Total a Pagar</span><strong>{formatMoney(table.total * (serviceFeeActive ? 1.1 : 1) - appliedDiscount)}</strong></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--purple-soft)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "10px 14px", marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Dividir conta</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" onClick={() => setSplitCount(Math.max(1, splitCount - 1))} style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--surface-hover)", border: 0, color: "var(--ink)", cursor: "pointer", display: "grid", placeItems: "center" }}>−</button>
                    <span style={{ fontWeight: 700, fontSize: 14, minWidth: 24, textAlign: "center" }}>{splitCount}x</span>
                    <button type="button" onClick={() => setSplitCount(splitCount + 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--surface-hover)", border: 0, color: "var(--ink)", cursor: "pointer", display: "grid", placeItems: "center" }}>+</button>
                  </div>
                  {splitCount > 1 && <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>{formatMoney((table.total * (serviceFeeActive ? 1.1 : 1) - appliedDiscount) / splitCount)}/pessoa</span>}
                </div>
                <div className="payment-methods">
                  {(["Pix", "Crédito", "Débito"] as const).map((method) => (
                    <button key={method} type="button" aria-pressed={paymentMethod === method} className={`payment-method ${paymentMethod === method ? "selected" : ""}`} onClick={() => setPaymentMethod(method)}>
                      <div className="icon">{method === "Pix" ? "◈" : "💳"}</div>
                      <div><strong>{method === "Pix" ? "Pix" : method === "Crédito" ? "Cartão de Crédito" : "Cartão de Débito"}</strong><small>{method === "Pix" ? "Cobrado na maquininha" : method === "Crédito" ? "Visa, Mastercard" : "Visa, Elo, Mastercard"}</small></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <button className="primary-button wide" type="button" onClick={closeTable}>Confirmar Pagamento e Liberar Mesa</button>
            </div>
          </section>
        </div>
      )}

      {/* ─── Modal: Reserva ──────────────────────────────── */}
      {reserveModal && reserveTableNum !== null && (
        <div className="modal-backdrop">
          <button className="modal-scrim" type="button" aria-label="Fechar reserva" onClick={() => setReserveModal(false)} />
          <section className="fee-modal" role="dialog" aria-modal="true" aria-labelledby="reserve-title">
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setReserveModal(false)}>×</button>
            <span className="modal-icon">📅</span>
            <p className="eyebrow orange">SALÃO</p>
            <h2 id="reserve-title">Reservar Mesa {String(reserveTableNum).padStart(2, "0")}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Nome do cliente</span>
                <input required placeholder="Ex: Família Silva" value={reserveData.name} onChange={(e) => setReserveData({ ...reserveData, name: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Horário</span>
                  <input required type="time" value={reserveData.time} onChange={(e) => setReserveData({ ...reserveData, time: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none", colorScheme: "dark" }} />
                </label>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Pessoas</span>
                  <input required type="number" min="1" max="20" value={reserveData.guests} onChange={(e) => setReserveData({ ...reserveData, guests: parseInt(e.target.value) || 1 })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
                </label>
              </div>
              <button className="primary-button wide" type="button" onClick={confirmReservation}>Confirmar Reserva</button>
            </div>
          </section>
        </div>
      )}

      {/* ─── Simulador de cardápio (QR) ─────────────────── */}
      {clientSimulatorTable !== null && (
        <ClientMenuSimulator
          tableNum={clientSimulatorTable}
          onClose={() => setClientSimulatorTable(null)}
          menuItems={menuItems}
          onPlaceOrder={(items, total) => {
            const detail = items.map((i) => `${i.quantity}x ${i.name}`).join(" • ");
            addOrder({ id: Math.floor(Math.random() * 9000) + 1000, customer: `Mesa ${String(clientSimulatorTable).padStart(2, "0")}`, channel: "Salão", detail, total, time: "agora", status: "Novo" });
            setClientSimulatorTable(null);
          }}
        />
      )}

      {toast && <div className="toast" role="status" aria-live="polite"><span>✓</span>{toast}</div>}
    </div>
  );
}
