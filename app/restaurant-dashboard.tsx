"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useRef } from "react";

type View =
  | "Visão geral"
  | "Pedidos"
  | "WhatsApp"
  | "Salão"
  | "Cardápio"
  | "Entregas"
  | "Relatórios"
  | "CRM";

type OrderStatus = "Novo" | "Confirmado" | "Em preparo" | "Pronto" | "Saiu";

type Order = {
  id: number;
  customer: string;
  channel: "WhatsApp" | "Site" | "Salão";
  detail: string;
  total: number;
  time: string;
  status: OrderStatus;
  feePending?: boolean;
};

type Table = {
  number: number;
  seats: number;
  status: "Livre" | "Ocupada" | "Conta" | "Reservada";
  guests: number;
  total: number;
  time?: string;
  items: { name: string; quantity: number; price: number }[];
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const navigation: { label: View; icon: string; badge?: string; group?: string }[] = [
  { label: "Visão geral", icon: "visao-geral", group: "OPERAÇÃO" },
  { label: "Pedidos", icon: "pedidos", badge: "12" },
  { label: "WhatsApp", icon: "whatsapp", badge: "5" },
  { label: "Salão", icon: "salao" },
  { label: "Cardápio", icon: "cardapio", group: "GESTÃO" },
  { label: "Entregas", icon: "entregas" },
  { label: "Relatórios", icon: "relatorios" },
  { label: "CRM", icon: "crm" },
];

const initialOrders: Order[] = [
  {
    id: 1052,
    customer: "Marina Alves",
    channel: "Site",
    detail: "2 pizzas • 1 refrigerante",
    total: 94.7,
    time: "há 3 min",
    status: "Novo",
    feePending: true,
  },
  {
    id: 1051,
    customer: "Lucas Mendes",
    channel: "WhatsApp",
    detail: "1 combo família • 2 sucos",
    total: 128.0,
    time: "há 7 min",
    status: "Confirmado",
  },
  {
    id: 1050,
    customer: "Mesa 08",
    channel: "Salão",
    detail: "4 itens • 3 pessoas",
    total: 156.5,
    time: "há 12 min",
    status: "Em preparo",
  },
  {
    id: 1049,
    customer: "Fernanda Costa",
    channel: "WhatsApp",
    detail: "2 massas • 1 sobremesa",
    total: 86.9,
    time: "há 18 min",
    status: "Em preparo",
  },
  {
    id: 1048,
    customer: "João Pedro",
    channel: "Site",
    detail: "1 pizza grande • borda",
    total: 72.0,
    time: "há 24 min",
    status: "Pronto",
  },
  {
    id: 1047,
    customer: "Ana Luiza",
    channel: "WhatsApp",
    detail: "1 lasanha • 1 água",
    total: 49.5,
    time: "há 31 min",
    status: "Saiu",
  },
];

const initialTables: Table[] = [
  { number: 1, seats: 4, status: "Livre", guests: 0, total: 0, items: [] },
  {
    number: 2,
    seats: 4,
    status: "Ocupada",
    guests: 3,
    total: 128.7,
    time: "48 min",
    items: [
      { name: "Pizza Margherita", quantity: 1, price: 58.9 },
      { name: "Coca-Cola lata", quantity: 3, price: 8.6 },
      { name: "Tiramisù", quantity: 1, price: 24 },
      { name: "Água com gás", quantity: 2, price: 10 },
    ],
  },
  { number: 3, seats: 2, status: "Reservada", guests: 2, total: 0, time: "20:30", items: [] },
  {
    number: 4,
    seats: 6,
    status: "Conta",
    guests: 5,
    total: 284.3,
    time: "1h 12min",
    items: [
      { name: "Entradas da casa", quantity: 2, price: 44 },
      { name: "Filé ao molho", quantity: 3, price: 174 },
      { name: "Sucos", quantity: 4, price: 42 },
      { name: "Pudim", quantity: 2, price: 24.3 },
    ],
  },
  { number: 5, seats: 4, status: "Livre", guests: 0, total: 0, items: [] },
  {
    number: 6,
    seats: 4,
    status: "Ocupada",
    guests: 2,
    total: 76.4,
    time: "31 min",
    items: [
      { name: "Massas", quantity: 2, price: 59.8 },
      { name: "Refrigerantes", quantity: 2, price: 16.6 },
    ],
  },
  { number: 7, seats: 2, status: "Livre", guests: 0, total: 0, items: [] },
  {
    number: 8,
    seats: 4,
    status: "Ocupada",
    guests: 3,
    total: 156.5,
    time: "26 min",
    items: [
      { name: "Pizza Calabresa", quantity: 1, price: 62 },
      { name: "Parmegiana", quantity: 2, price: 76.5 },
      { name: "Chopp", quantity: 2, price: 18 },
    ],
  },
  { number: 9, seats: 6, status: "Reservada", guests: 5, total: 0, time: "21:00", items: [] },
  {
    number: 10,
    seats: 4,
    status: "Ocupada",
    guests: 4,
    total: 198.8,
    time: "54 min",
    items: [{ name: "Jantar completo", quantity: 4, price: 198.8 }],
  },
  { number: 11, seats: 2, status: "Livre", guests: 0, total: 0, items: [] },
  { number: 12, seats: 8, status: "Livre", guests: 0, total: 0, items: [] },
];

const conversations = [
  { name: "Camila Rocha", initials: "CR", message: "Meu pedido já saiu?", time: "10:42", unread: 2, active: true },
  { name: "Lucas Mendes", initials: "LM", message: "Perfeito, obrigado!", time: "10:36", unread: 0 },
  { name: "Beatriz Lima", initials: "BL", message: "Vocês têm opção sem lactose?", time: "10:31", unread: 1 },
  { name: "Daniel Souza", initials: "DS", message: "Quero pedir o combo família", time: "10:22", unread: 1 },
  { name: "Marcos Silva", initials: "MS", message: "Qual o tempo de entrega?", time: "10:18", unread: 1 },
];

const menuItems = [
  { name: "Pizza Margherita", category: "Pizzas", price: 58.9, sold: 34, available: true },
  { name: "Pizza Calabresa", category: "Pizzas", price: 62, sold: 29, available: true },
  { name: "Parmegiana da casa", category: "Pratos", price: 48.5, sold: 24, available: true },
  { name: "Lasanha bolonhesa", category: "Massas", price: 42.9, sold: 19, available: true },
  { name: "Tiramisù", category: "Sobremesas", price: 24, sold: 16, available: true },
  { name: "Nhoque artesanal", category: "Massas", price: 44, sold: 8, available: false },
];

function AppIcon({ name }: { name: string }) {
  switch (name) {
    case 'visao-geral': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18V10M10 18V6M16 18v-4M22 18V3"/><path d="M3 21h20"/><path d="M4 10l6-4 6 8 6-11"/></svg>;
    case 'pedidos': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 3.5h6M8 9h8M8 13h5M8 17h7"/></svg>;
    case 'whatsapp': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4a8 8 0 0 0-7 11.8L4 20l4.4-1.1A8 8 0 1 0 12 4Z"/><path d="M9.1 8.6c.6 2.6 2.7 4.7 5.3 5.4l1.2-1.2M9.1 8.6 8 9.7"/></svg>;
    case 'salao': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="6" height="5" rx="1.5"/><rect x="14" y="5" width="6" height="5" rx="1.5"/><rect x="4" y="14" width="6" height="5" rx="1.5"/><rect x="14" y="14" width="6" height="5" rx="1.5"/></svg>;
    case 'cardapio': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>;
    case 'entregas': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>;
    case 'crm': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="7" r="2.5"/><path d="M3 20c.5-4 2.6-6 5-6s4.5 2 5 6"/><path d="M14 13c3.5 0 5.5 2 6 5"/></svg>;
    case 'relatorios': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V5M16 20v-8M22 20V3"/><path d="M3 20h20"/></svg>;
    default: return <span>{name}</span>;
  }
}

const Icon = ({ children }: { children: string }) => <span className="icon-box" aria-hidden="true"><AppIcon name={children} /></span>;

function isOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) return false;
  const order = value as Partial<Order>;
  return (
    typeof order.id === "number" &&
    typeof order.customer === "string" &&
    (order.channel === "WhatsApp" ||
      order.channel === "Site" ||
      order.channel === "Salão") &&
    typeof order.detail === "string" &&
    typeof order.total === "number" &&
    Number.isFinite(order.total) &&
    typeof order.time === "string" &&
    (order.status === "Novo" ||
      order.status === "Confirmado" ||
      order.status === "Em preparo" ||
      order.status === "Pronto" ||
      order.status === "Saiu") &&
    (order.feePending === undefined || typeof order.feePending === "boolean")
  );
}

export function RestaurantDashboard() {
  const [activeView, setActiveView] = useState<View>("Visão geral");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const feeInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    let controller: AbortController | undefined;

    const fetchOrders = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/orders", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data = (await response.json()) as { orders?: unknown };
        if (mounted && Array.isArray(data.orders)) {
          const persistedOrders = data.orders.filter(isOrder);
          const persistedIds = new Set(persistedOrders.map((order) => order.id));
          setOrders([
            ...persistedOrders,
            ...initialOrders.filter((order) => !persistedIds.has(order.id)),
          ]);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("Não foi possível sincronizar os pedidos.", error);
      }
    };

    void fetchOrders();
    const interval = window.setInterval(fetchOrders, 15_000);
    return () => {
      mounted = false;
      controller?.abort();
      window.clearInterval(interval);
    };
  }, []);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState(2);
  const [feeModal, setFeeModal] = useState(false);
  const [addItemModal, setAddItemModal] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [cart, setCart] = useState<{name: string, quantity: number, price: number}[]>([]);
  const [discount, setDiscount] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("8,90");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [orderFilter, setOrderFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const todayLabel = useMemo(() => {
    const formatted = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "America/Sao_Paulo",
    }).format(new Date());
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

  useEffect(
    () => () => {
      if (toastTimerRef.current !== undefined) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

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
    if (toastTimerRef.current !== undefined) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2800);
  };

  const applyFee = () => {
    const fee = Number(deliveryFee.replace(".", "").replace(",", "."));
    if (!pendingFee || Number.isNaN(fee)) return;
    setOrders((current) =>
      current.map((order) =>
        order.id === pendingFee.id
          ? { ...order, total: order.total + fee, feePending: false, status: "Confirmado" }
          : order,
      ),
    );
    setFeeModal(false);
    notify(`Taxa adicionada. Pedido #${pendingFee.id} confirmado.`);
  };

  const advanceOrder = (id: number) => {
    const flow: OrderStatus[] = ["Novo", "Confirmado", "Em preparo", "Pronto", "Saiu"];
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== id || order.feePending) return order;
        const next = flow[Math.min(flow.indexOf(order.status) + 1, flow.length - 1)];
        return { ...order, status: next };
      }),
    );
    notify("Etapa do pedido atualizada.");
  };

  const openAddItemModal = () => {
    setCart([]);
    setAddItemModal(true);
  };

  const confirmAddItems = () => {
    if (cart.length === 0) {
      setAddItemModal(false);
      return;
    }
    setTables((current) =>
      current.map((item) =>
        item.number === selectedTable
          ? {
              ...item,
              status: "Ocupada",
              guests: item.guests || 2,
              total: item.total + cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0),
              time: item.time || "agora",
              items: [...item.items, ...cart],
            }
          : item,
      ),
    );
    setAddItemModal(false);
    notify(`${cart.reduce((a, b) => a + b.quantity, 0)} itens lançados na mesa.`);
  };

  const openCheckoutModal = () => {
    setDiscount("");
    setAppliedDiscount(0);
    setPaymentMethod("");
    setCheckoutModal(true);
  };

  const applyDiscount = () => {
    const percent = parseFloat(discount.replace(',', '.'));
    if (!isNaN(percent) && percent > 0 && percent <= 100) {
      setAppliedDiscount(table.total * (percent / 100));
      notify(`Desconto de ${percent}% aplicado com sucesso!`);
    } else {
      setAppliedDiscount(0);
      if (discount.trim() !== "") notify("Porcentagem de desconto inválida.");
    }
  };

  const closeTable = () => {
    if (!paymentMethod && table.total > 0) {
      notify("Selecione um método de pagamento.");
      return;
    }
    setTables((current) =>
      current.map((item) =>
        item.number === selectedTable
          ? { ...item, status: "Livre", guests: 0, total: 0, time: undefined, items: [] }
          : item,
      ),
    );
    setCheckoutModal(false);
    notify(`Mesa ${String(selectedTable).padStart(2, "0")} paga via ${paymentMethod || "Dinheiro"} e liberada.`);
  };

  const chooseView = (view: View) => {
    setActiveView(view);
    setMobileMenu(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <button className="brand" type="button" onClick={() => chooseView("Visão geral")} style={{ padding: "8px 16px", background: "transparent", border: 0, cursor: "pointer", display: "flex", alignItems: "center" }}>
          <img src="/2type-control-assets/logos/svg/logo-horizontal-white.svg" alt="2Type Control" style={{ height: 26, width: "auto" }} />
        </button>

        <button className="restaurant-switch" type="button" onClick={() => notify("Seletor de unidade aberto.")}>
          <span className="restaurant-avatar">CF</span>
          <span><strong>Casa do Forno</strong><small>Unidade Centro</small></span>
          <span className="chevron">⌄</span>
        </button>

        <nav className="nav-list" aria-label="Navegação principal">
          {navigation.map((item) => (
            <div key={item.label}>
              {item.group && <div className="nav-group">{item.group}</div>}
              <button
                type="button"
                className={`nav-item ${activeView === item.label ? "active" : ""}`}
                onClick={() => chooseView(item.label)}
                aria-current={activeView === item.label ? "page" : undefined}
              >
                <Icon>{item.icon}</Icon>
                <span>{item.label}</span>
                {(item.label === "Pedidos" || item.badge) && (
                  <span className={`nav-badge ${item.label === "WhatsApp" ? "green" : ""}`}>
                    {item.label === "Pedidos"
                      ? orders.filter((order) => order.status !== "Saiu").length
                      : item.badge}
                  </span>
                )}
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="integration-card" type="button" onClick={() => notify("3 integrações ativas e sincronizadas.")}>
            <span className="integration-icon">⌁</span>
            <span><strong>Integrações</strong><small>3 de 4 conectadas</small></span>
            <span className="integration-progress"><i /></span>
          </button>
          <div className="user-card">
            <span className="user-avatar">RS</span>
            <span><strong>Rafael Santos</strong><small>Administrador</small></span>
            <span className="more">•••</span>
          </div>
        </div>
      </aside>
      {mobileMenu && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button" type="button" aria-label="Abrir menu" aria-expanded={mobileMenu} onClick={() => setMobileMenu(true)}>☰</button>
          <div>
            <h1>{activeView === "Visão geral" ? "Bom dia, Rafael! 👋" : activeView}</h1>
            {activeView === "Visão geral" && (
              <p className="topbar-subtitle">{todayLabel} <span>•</span> <b><i /> Restaurante aberto</b></p>
            )}
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <span>⌕</span>
              <input ref={searchInputRef} aria-label="Buscar pedido ou cliente" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar pedido ou cliente..." />
              <kbd>⌘ K</kbd>
            </label>
            <button className="round-button notification" type="button" aria-label="Notificações" onClick={() => notify("Você tem novas notificações.")}>🔔<i /></button>
            <button className="live-status" type="button"><i /> Ao vivo</button>
          </div>
        </header>

        {activeView === "Visão geral" && (
          <Overview
            orders={orders}
            tables={tables}
            pendingFee={pendingFee}
            aiEnabled={aiEnabled}
            onToggleAi={() => setAiEnabled((value) => !value)}
            onOpenFee={() => setFeeModal(true)}
            onView={chooseView}
            onSelectTable={(number) => { setSelectedTable(number); chooseView("Salão"); }}
            onAdvance={advanceOrder}
          />
        )}
        {activeView === "Pedidos" && (
          <OrdersView
            orders={filteredOrders}
            filter={orderFilter}
            onFilter={setOrderFilter}
            onAdvance={advanceOrder}
            onOpenFee={() => setFeeModal(true)}
            onNotify={notify}
          />
        )}
        {activeView === "WhatsApp" && (
          <WhatsAppView aiEnabled={aiEnabled} onToggleAi={() => setAiEnabled((value) => !value)} onNotify={notify} />
        )}
        {activeView === "Salão" && (
          <DiningView
            tables={tables}
            selected={table}
            onSelect={setSelectedTable}
            onAddItem={openAddItemModal}
            onClose={openCheckoutModal}
            onNotify={notify}
          />
        )}
        {activeView === "Cardápio" && <MenuView onNotify={notify} />}
        {activeView === "Entregas" && <DeliveryView pendingFee={pendingFee} onOpenFee={() => setFeeModal(true)} onNotify={notify} />}
        {activeView === "Relatórios" && <ReportsView />}
        {activeView === "CRM" && <CrmView />}
      </main>

      {feeModal && pendingFee && (
        <div className="modal-backdrop">
          <button className="modal-scrim" type="button" aria-label="Fechar taxa de entrega" onClick={() => setFeeModal(false)} />
          <section className="fee-modal" role="dialog" aria-modal="true" aria-labelledby="fee-title">
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setFeeModal(false)}>×</button>
            <span className="modal-icon">➜</span>
            <p className="eyebrow orange">PEDIDO DO SITE</p>
            <h2 id="fee-title">Adicionar taxa de entrega</h2>
            <p>O pedido <strong>#{pendingFee.id}</strong> de {pendingFee.customer} já está pronto. Informe a taxa para confirmar e enviar a comanda para a produção.</p>
            <div className="address-card">
              <span>⌖</span>
              <span><strong>Rua das Acácias, 148 — Centro</strong><small>3,2 km da Casa do Forno • aprox. 18 min</small></span>
            </div>
            <label className="fee-field">
              <span>Taxa de entrega</span>
              <span className="money-input"><b>R$</b><input ref={feeInputRef} aria-label="Taxa de entrega em reais" value={deliveryFee} onChange={(event) => setDeliveryFee(event.target.value)} inputMode="decimal" /></span>
            </label>
            <div className="fee-summary"><span>Subtotal do pedido</span><strong>{formatMoney(pendingFee.total)}</strong><span>Total com entrega</span><strong>{formatMoney(pendingFee.total + (Number(deliveryFee.replace(",", ".")) || 0))}</strong></div>
            <button className="primary-button wide" type="button" onClick={applyFee}>Confirmar pedido e enviar à cozinha</button>
          </section>
        </div>
      )}

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
                  const inCart = cart.find(c => c.name === item.name)?.quantity || 0;
                  return (
                    <button className="catalog-item" type="button" disabled={!item.available} key={item.name} onClick={() => setCart(c => {
                      const exists = c.find(i => i.name === item.name);
                      if (exists) return c.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
                      return [...c, { name: item.name, quantity: 1, price: item.price }];
                    })}>
                      <div className="thumb">{item.name.slice(0, 1)}</div>
                      <div className="info">
                        <div>
                          <h3>{item.name}</h3>
                          <p>{item.available ? item.category : "Indisponível"}</p>
                        </div>
                        <div className="price-row">
                          <strong>{formatMoney(item.price)}</strong>
                          <span className="add-btn" aria-hidden="true">{inCart > 0 ? inCart : "+"}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.7)", borderRadius: "0 0 16px 16px", backdropFilter: "blur(10px)" }}>
              <button className="primary-button wide" type="button" onClick={confirmAddItems}>Confirmar Lançamento</button>
            </div>
          </section>
        </div>
      )}

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
                        <span>{item.quantity}x {item.name}</span>
                        <strong>{formatMoney(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                    {table.items.length === 0 && <div style={{textAlign: "center", padding: 20, color: "#999", fontSize: 10}}>Nenhum item consumido.</div>}
                  </div>
                </div>

                <div className="discount-box">
                  <input aria-label="Desconto em porcentagem" type="number" placeholder="Desconto (%)" value={discount} onChange={e => setDiscount(e.target.value)} min="0" max="100" />
                  <button type="button" onClick={applyDiscount}>APLICAR</button>
                </div>
              </div>

              <div>
                <div className="checkout-summary">
                  <div className="checkout-summary-row"><span>Subtotal</span><strong>{formatMoney(table.total)}</strong></div>
                  <div className="checkout-summary-row"><span>Serviço (10%)</span><strong>{formatMoney(table.total * 0.1)}</strong></div>
                  {appliedDiscount > 0 && <div className="checkout-summary-row" style={{ color: "var(--orange)" }}><span>Desconto</span><strong>- {formatMoney(appliedDiscount)}</strong></div>}
                  <div className="checkout-summary-row total">
                    <span>Total a Pagar</span>
                    <strong>{formatMoney(table.total * 1.1 - appliedDiscount)}</strong>
                  </div>
                </div>

                <div className="payment-methods">
                  <button type="button" aria-pressed={paymentMethod === "Pix"} className={`payment-method ${paymentMethod === "Pix" ? "selected" : ""}`} onClick={() => setPaymentMethod("Pix")}>
                    <div className="icon">◈</div>
                    <div><strong>Pix</strong><small>Cobrado na maquininha</small></div>
                  </button>
                  <button type="button" aria-pressed={paymentMethod === "Crédito"} className={`payment-method ${paymentMethod === "Crédito" ? "selected" : ""}`} onClick={() => setPaymentMethod("Crédito")}>
                    <div className="icon">💳</div>
                    <div><strong>Cartão de Crédito</strong><small>Visa, Mastercard</small></div>
                  </button>
                  <button type="button" aria-pressed={paymentMethod === "Débito"} className={`payment-method ${paymentMethod === "Débito" ? "selected" : ""}`} onClick={() => setPaymentMethod("Débito")}>
                    <div className="icon">💳</div>
                    <div><strong>Cartão de Débito</strong><small>Visa, Elo, Mastercard</small></div>
                  </button>
                </div>

              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button className="primary-button wide" type="button" onClick={closeTable}>Confirmar Pagamento e Liberar Mesa</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status" aria-live="polite"><span>✓</span>{toast}</div>}
    </div>
  );
}

function Overview({
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
  tables: Table[];
  pendingFee?: Order;
  aiEnabled: boolean;
  onToggleAi: () => void;
  onOpenFee: () => void;
  onView: (view: View) => void;
  onSelectTable: (number: number) => void;
  onAdvance: (id: number) => void;
}) {
  const occupied = tables.filter((table) => table.status === "Ocupada" || table.status === "Conta").length;
  
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
          <div><strong>Pedido #{pendingFee.id} aguardando taxa de entrega</strong><p>{pendingFee.customer} • {pendingFee.detail} • feito pelo site há 3 min</p></div>
          <button type="button" onClick={onOpenFee}>Adicionar taxa <span>→</span></button>
        </section>
      )}

      <div className="overview-grid">
        <section className="panel orders-panel">
          <PanelHeader title="Pedidos agora" subtitle="8 pedidos em andamento" action="Ver todos" onAction={() => onView("Pedidos")} />
          <div className="order-list">
            {orders.slice(0, 5).map((order) => (
              <article className="order-row" key={order.id} onClick={() => order.feePending ? onOpenFee() : onAdvance(order.id)}>
                <span className={`channel-mark ${order.channel.toLowerCase()}`}>{order.channel === "WhatsApp" ? "💬" : order.channel === "Site" ? "⌘" : "🍽️"}</span>
                <div className="order-main"><div><strong>#{order.id}</strong><span className="dot-separator">•</span><b>{order.customer}</b></div><small>{order.detail}</small></div>
                <div className="order-time"><small>{order.time}</small><strong>{formatMoney(order.total)}</strong></div>
                <StatusBadge status={order.status} pending={order.feePending} />
                <button className="row-action" type="button" aria-label={`Avançar pedido ${order.id}`}>›</button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel ai-panel">
          <PanelHeader title="IA no WhatsApp" subtitle="Atendimento automático" extra={<Toggle enabled={aiEnabled} onToggle={onToggleAi} />} />
          <div className="ai-status-row"><span className="spark">✦</span><span><strong>{aiEnabled ? "IA atendendo agora" : "IA pausada"}</strong><small>{aiEnabled ? "6 conversas ativas" : "Atendimento manual ativo"}</small></span><i /></div>
          
          <div className="mini-chat">
            <div className="chat-meta"><span className="avatar coral">CR</span><div><strong>Camila Rocha</strong><small>há 1 min</small></div><span className="whatsapp-mini">💬</span></div>
            <div className="customer-message">Meu pedido já saiu para entrega?</div>
            <div className="ai-message"><span>✦</span><div><p>Oi, Camila! Seu pedido <b>#1048</b> saiu às 17:36 e chega em cerca de 18 min. 😊</p></div></div>
          </div>
          
          <div className="ai-footer">
            <a href="#" onClick={(e) => { e.preventDefault(); onView("WhatsApp"); }}>Ver todas as conversas <span>→</span></a>
          </div>
        </section>
      </div>

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

function OrdersView({ orders, filter, onFilter, onAdvance, onOpenFee, onNotify }: { orders: Order[]; filter: string; onFilter: (filter: string) => void; onAdvance: (id: number) => void; onOpenFee: () => void; onNotify: (message: string) => void }) {
  const columns: OrderStatus[] = ["Novo", "Confirmado", "Em preparo", "Pronto", "Saiu"];
  return (
    <div className="page-content">
      <div className="section-toolbar">
        <div className="filter-tabs">{["Todos", "WhatsApp", "Site", "Salão"].map((item) => <button type="button" className={filter === item ? "active" : ""} key={item} onClick={() => onFilter(item)}>{item}{item !== "Todos" && <small>{initialOrders.filter((order) => order.channel === item).length}</small>}</button>)}</div>
        <button className="primary-button" type="button" onClick={() => onNotify("O cadastro de pedidos será conectado na próxima etapa.")}>+ Novo pedido</button>
      </div>
      <section className="kanban-board">
        {columns.map((column) => {
          const items = orders.filter((order) => order.status === column);
          return (
            <div className="kanban-column" key={column}>
              <div className="kanban-heading"><span className={`status-dot ${column.toLowerCase().replace(" ", "-")}`} /> <strong>{column}</strong><small>{items.length}</small></div>
              {items.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-card-top"><span className={`channel-pill ${order.channel.toLowerCase()}`}>{order.channel === "WhatsApp" ? "◉" : order.channel === "Site" ? "⌘" : "▦"} {order.channel}</span><small>{order.time}</small></div>
                  <h3>#{order.id} <span>•</span> {order.customer}</h3>
                  <p>{order.detail}</p>
                  <div className="order-card-bottom"><strong>{formatMoney(order.total)}</strong><button type="button" onClick={() => order.feePending ? onOpenFee() : onAdvance(order.id)}>{order.feePending ? "Definir taxa" : column === "Saiu" ? "Concluído" : "Avançar →"}</button></div>
                </article>
              ))}
              {items.length === 0 && <div className="empty-column">Nenhum pedido</div>}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function WhatsAppView({ aiEnabled, onToggleAi, onNotify }: { aiEnabled: boolean; onToggleAi: () => void; onNotify: (message: string) => void }) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([
    { side: "customer", text: "Oi! Fiz o pedido #1046. Meu pedido já saiu para entrega?", time: "10:41" },
    { side: "ai", text: "Oi, Camila! Seu pedido #1046 saiu às 10:36 e chega em cerca de 18 min. 😊", time: "10:42" },
    { side: "customer", text: "Ótimo, muito obrigada!", time: "10:42" },
  ]);
  const send = () => {
    if (!message.trim()) return;
    setMessages((current) => [...current, { side: "operator", text: message.trim(), time: "agora" }]);
    setMessage("");
    onNotify("Mensagem enviada pelo WhatsApp.");
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  return (
    <div className="page-content whatsapp-workspace">
      <section className="conversation-list panel">
        <div className="conversation-heading"><div><h2>Conversas</h2><span>5 aguardando</span></div><button type="button">⌕</button></div>
        {conversations.map((conversation) => (
          <button className={`conversation-item ${conversation.active ? "active" : ""}`} key={conversation.name} type="button">
            <span className="avatar">{conversation.initials}</span>
            <span><strong>{conversation.name}</strong><small>{conversation.message}</small></span>
            <span><time>{conversation.time}</time>{conversation.unread > 0 && <b>{conversation.unread}</b>}</span>
          </button>
        ))}
      </section>
      <section className="chat-panel panel">
        <header className="chat-header"><span className="avatar coral">CR</span><span><strong>Camila Rocha</strong><small><i /> WhatsApp • cliente desde 2024</small></span><button type="button">•••</button></header>
        <div className="chat-body">
          <div className="date-divider"><span>Hoje</span></div>
          {messages.map((item, index) => <div key={index} className={`bubble ${item.side}`}><span>{item.side === "ai" && "✦ "}{item.text}</span><small>{item.time}{item.side !== "customer" && "  ✓✓"}</small></div>)}
          {aiEnabled && <div className="ai-thinking"><span>✦</span> A IA está acompanhando esta conversa</div>}
          <div ref={scrollRef} />
        </div>
        <div className="composer"><button type="button" aria-label="Adicionar anexo" onClick={() => onNotify("Menu de anexos aberto")}>＋</button><input aria-label="Mensagem para Camila Rocha" value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Digite uma mensagem..." /><button className="send-button" type="button" aria-label="Enviar mensagem" onClick={send}>➜</button></div>
      </section>
      <aside className="chat-insights panel">
        <div className="insights-header"><span className="spark">✦</span><span><strong>Copiloto IA</strong><small>Contexto da conversa</small></span><Toggle enabled={aiEnabled} onToggle={onToggleAi} /></div>
        <div className="customer-summary"><span className="avatar coral large">CR</span><h3>Camila Rocha</h3><p>7 pedidos • ticket médio R$ 73,40</p></div>
        <div className="insight-block"><small>PEDIDO ATUAL</small><div className="linked-order"><span><strong>#1046</strong><small>Saiu para entrega às 10:36</small></span><StatusBadge status="Saiu" /></div></div>
        <div className="insight-block"><small>RESUMO DA IA</small><p>Cliente pediu atualização da entrega. O pedido já está com o entregador e dentro do prazo.</p></div>
        <div className="insight-block"><small>PRÓXIMA AÇÃO</small><button className="suggestion" type="button" onClick={() => onNotify("Resposta sugerida copiada.")}><span>✦</span><p>Agradecer e avisar que o entregador está a caminho.</p><b>Usar resposta →</b></button></div>
        <button className="ghost-button wide" type="button" onClick={() => onNotify("Atendimento assumido pelo operador.")}>Assumir atendimento</button>
      </aside>
    </div>
  );
}

function DiningView({ tables, selected, onSelect, onAddItem, onClose, onNotify }: { tables: Table[]; selected: Table; onSelect: (number: number) => void; onAddItem: () => void; onClose: () => void; onNotify: (message: string) => void }) {
  const [activeArea, setActiveArea] = useState("Salão principal");
  return (
    <div className="page-content dining-layout">
      <section className="floor-panel panel">
        <div className="section-toolbar compact">
          <div className="filter-tabs">
            <button className={activeArea === "Salão principal" ? "active" : ""} onClick={() => setActiveArea("Salão principal")} type="button">Salão principal</button>
            <button className={activeArea === "Varanda" ? "active" : ""} onClick={() => { setActiveArea("Varanda"); onNotify("Mapa da Varanda carregado."); }} type="button">Varanda</button>
          </div>
          <button className="ghost-button" type="button" onClick={() => onNotify("Editor de mapa ativado.")}>Editar mapa</button>
        </div>
        <div className="floor-info"><span><strong>{tables.filter((table) => table.status === "Livre").length}</strong> livres</span><span><strong>{tables.filter((table) => table.status === "Ocupada").length}</strong> ocupadas</span><span><strong>{tables.filter((table) => table.status === "Conta").length}</strong> pediu conta</span><span><strong>{tables.filter((table) => table.status === "Reservada").length}</strong> reservadas</span></div>
        <div className="floor-map">
          <div className="bar-counter">BAR / BALCÃO</div>
          {tables.map((table) => (
            <button className={`floor-table table-${table.number} ${table.status.toLowerCase()} ${selected.number === table.number ? "selected" : ""}`} type="button" key={table.number} onClick={() => onSelect(table.number)}>
              <span>M{String(table.number).padStart(2, "0")}</span>
              <small>{table.status === "Livre" ? `${table.seats} lugares` : table.status === "Reservada" ? table.time : formatMoney(table.total)}</small>
              {table.guests > 0 && <b>{table.guests} pessoas</b>}
            </button>
          ))}
          <div className="kitchen-marker">COZINHA</div>
        </div>
      </section>
      <aside className="table-check panel">
        <header><div><p className="eyebrow">COMANDA ABERTA</p><h2>Mesa {String(selected.number).padStart(2, "0")}</h2><span>{selected.guests || selected.seats} pessoas • {selected.time || "mesa livre"}</span></div><button type="button">•••</button></header>
        <div className="waiter-row"><span className="avatar">RS</span><span><small>Garçom responsável</small><strong>Rafael Santos</strong></span><button type="button">Trocar</button></div>
        <div className="check-items">
          {selected.items.length > 0 ? selected.items.map((item, index) => (
            <div className="check-item" key={`${item.name}-${index}`}><b>{item.quantity}×</b><span><strong>{item.name}</strong><small>Observação padrão</small></span><strong>{formatMoney(item.price * item.quantity)}</strong></div>
          )) : <div className="empty-check"><span>◇</span><strong>Nenhum item lançado</strong><small>Adicione o primeiro item desta mesa.</small></div>}
        </div>
        <button className="add-item-button" type="button" onClick={onAddItem}>＋ Adicionar item</button>
        <div className="check-total"><span><small>Subtotal</small><strong>{formatMoney(selected.total)}</strong></span><span><small>Serviço (10%)</small><strong>{formatMoney(selected.total * 0.1)}</strong></span><div><span>Total da mesa</span><strong>{formatMoney(selected.total * 1.1)}</strong></div></div>
        <div className="check-actions"><button className="ghost-button" type="button" onClick={() => onNotify("Pré-conta enviada para impressão.")}>Imprimir pré-conta</button><button className="primary-button" type="button" disabled={selected.total === 0} onClick={onClose}>Fechar conta</button></div>
      </aside>
    </div>
  );
}

function MenuView({ onNotify }: { onNotify: (message: string) => void }) {
  const [availability, setAvailability] = useState<Record<string, boolean>>(Object.fromEntries(menuItems.map((item) => [item.name, item.available])));
  const [activeCategory, setActiveCategory] = useState("Todos");
  const filteredItems = activeCategory === "Todos" ? menuItems : menuItems.filter(i => i.category === activeCategory);
  const categories = ["Todos", "Pizzas", "Pratos", "Massas", "Sobremesas", "Bebidas"];

  return (
    <div className="page-content">
      <div className="section-toolbar">
        <div className="filter-tabs">
          {categories.map(c => (
            <button key={c} className={activeCategory === c ? "active" : ""} type="button" onClick={() => setActiveCategory(c)}>{c}</button>
          ))}
        </div>
        <button className="primary-button" type="button" onClick={() => onNotify("Editor de novo item aberto.")}>+ Novo item</button>
      </div>
      <section className="panel menu-table-panel">
        <div className="menu-table-heading"><span>ITEM</span><span>CATEGORIA</span><span>PREÇO</span><span>VENDAS HOJE</span><span>DISPONÍVEL</span><span /></div>
        {filteredItems.map((item, index) => <div className="menu-table-row" key={item.name}><span className={`food-thumb food-${index + 1}`}>{item.name.slice(0, 1)}</span><span><strong>{item.name}</strong><small>Sincronizado no site e WhatsApp</small></span><span>{item.category}</span><strong>{formatMoney(item.price)}</strong><span>{item.sold} unidades</span><Toggle enabled={availability[item.name]} onToggle={() => setAvailability((current) => ({ ...current, [item.name]: !current[item.name] }))} /><button type="button" onClick={() => onNotify(`Opções de: ${item.name}`)}>•••</button></div>)}
      </section>
    </div>
  );
}

function DeliveryView({ pendingFee, onOpenFee, onNotify }: { pendingFee?: Order; onOpenFee: () => void; onNotify: (message: string) => void }) {
  const [routesConnected, setRoutesConnected] = useState(false);
  return (
    <div className="page-content">
      {pendingFee && <section className="attention-banner"><span className="attention-icon">!</span><div><strong>1 pedido precisa da taxa de entrega</strong><p>Revise a distância e confirme o valor antes de enviar para a cozinha.</p></div><button type="button" onClick={onOpenFee}>Resolver agora <span>→</span></button></section>}
      <div className="delivery-grid">
        <section className="panel live-deliveries"><PanelHeader title="Entregas em andamento" subtitle="3 entregadores em rota" action="Ver mapa" onAction={() => onNotify("Carregando mapa em tempo real...")} />
          {[{id:1047,name:"Ana Luiza",driver:"Carlos M.",eta:"8 min",progress:78},{id:1046,name:"Camila Rocha",driver:"Diego R.",eta:"18 min",progress:54},{id:1043,name:"Paulo Nunes",driver:"André L.",eta:"24 min",progress:31}].map((delivery) => <article className="delivery-row" key={delivery.id}><span className="driver-avatar">➜</span><span><strong>#{delivery.id} • {delivery.name}</strong><small>{delivery.driver} • a caminho</small><i><b style={{width:`${delivery.progress}%`}} /></i></span><span><small>Previsão</small><strong>{delivery.eta}</strong></span></article>)}
        </section>
        <section className="panel delivery-rules"><PanelHeader title="Regras de entrega" subtitle="Valores usados pela IA e pelo site" action="Editar" onAction={() => onNotify("Configurações de entrega abertas.")} />
          {[{range:"Até 2 km",fee:6.9,time:"20–30 min"},{range:"2 a 5 km",fee:9.9,time:"30–40 min"},{range:"5 a 8 km",fee:14.9,time:"40–55 min"}].map((rule) => <div className="rule-row" key={rule.range}><span className="rule-pin">⌖</span><span><strong>{rule.range}</strong><small>{rule.time}</small></span><strong>{formatMoney(rule.fee)}</strong></div>)}
          <div className="auto-rate"><span>✦</span><div><strong>{routesConnected ? "Rotas Conectadas" : "Cálculo automático disponível"}</strong><p>{routesConnected ? "As taxas estão sendo calculadas automaticamente via integração." : "Conecte a geolocalização do site para sugerir a taxa pela distância."}</p></div><button type="button" onClick={() => { setRoutesConnected(true); onNotify(routesConnected ? "Rotas sincronizadas com sucesso." : "Integração de rotas ativada!"); }}>{routesConnected ? "Sincronizar" : "Conectar"}</button></div>
        </section>
      </div>
    </div>
  );
}

function ReportsView() {
  const bars = [38, 44, 52, 46, 68, 74, 82, 58, 63, 71, 88, 76];
  return (
    <div className="page-content reports-page">
      <section className="metric-grid">
        <Metric title="Faturamento no mês" value="R$ 86.420" note="18,4% acima de julho" color="purple" icon="🛍️" path="M0,25 Q10,15 20,22 T40,20 T60,28 T80,24 T100,10" />
        <Metric title="Ticket médio" value="R$ 78,40" note="R$ 6,20 acima da meta" color="green" icon="↗" path="M0,28 Q15,28 30,20 T60,25 T90,20 T100,22" />
        <Metric title="Pedidos no mês" value="1.102" note="67% via WhatsApp" color="blue" icon="💬" path="M0,20 Q20,30 40,15 T80,25 T100,20" />
        <Metric title="Tempo médio" value="28 min" note="4 min mais rápido" color="orange" icon="◷" path="M0,20 Q20,10 40,25 T70,15 T100,20" />
      </section>
      <div className="reports-grid"><section className="panel revenue-chart"><PanelHeader title="Faturamento" subtitle="Últimos 30 dias" action="Este mês ⌄" /><div className="chart-value"><strong>R$ 86.420,00</strong><span>↗ 18,4%</span></div><div className="large-chart">{bars.map((height,index)=><div key={index}><i style={{height:`${height}%`}} className={index === 10 ? "peak" : ""}/><small>{index % 2 === 0 ? `${index + 1}/08` : ""}</small></div>)}</div></section><section className="panel channel-report"><PanelHeader title="Canais de venda" subtitle="Participação no faturamento" /><div className="donut"><div><strong>R$ 86k</strong><small>total</small></div></div><div className="channel-legend"><span><i className="wa"/><b>WhatsApp</b><strong>52%</strong></span><span><i className="site"/><b>Site</b><strong>28%</strong></span><span><i className="room"/><b>Salão</b><strong>20%</strong></span></div></section></div>
    </div>
  );
}

function Metric({ title, value, note, color, trend, icon, path, onAction }: { title: string; value: string; note: string; color?: string; trend?: string; icon: string; path?: string; onAction?: () => void }) {
  const c = color || (trend === "whatsapp" ? "blue" : trend === "up" ? "green" : "purple");
  const p = path || "M0,25 Q10,15 20,22 T40,20 T60,28 T80,24 T100,10";
  return (
    <article className="metric-card">
      <div className="metric-card-header">
        <div className={`metric-icon ${c}`}>{icon}</div>
        <div className="metric-info">
          <span>{title}</span>
          <strong>{value}</strong>
          <small className={c === "purple" || c === "green" ? "up" : ""}>{note}</small>
        </div>
      </div>
      <button type="button" aria-label={`Detalhes de ${title}`} onClick={onAction} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: 0, color: "var(--muted)", cursor: "pointer" }}>•••</button>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${c}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`var(--${c})`} stopOpacity="0.4" />
            <stop offset="100%" stopColor={`var(--${c})`} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${p} L100,35 L0,35 Z`} fill={`url(#grad-${c})`} />
        <path d={p} fill="none" stroke={`var(--${c})`} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </article>
  );
}

function PanelHeader({ title, subtitle, action, onAction, extra }: { title: string; subtitle?: string; action?: string; onAction?: () => void; extra?: React.ReactNode }) {
  return <header className="panel-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{extra ?? (action && <button type="button" onClick={onAction}>{action} <span>→</span></button>)}</header>;
}

function StatusBadge({ status, pending }: { status: OrderStatus; pending?: boolean }) {
  return <span className={`status-badge ${pending ? "pending" : status.toLowerCase().replace(" ", "-")}`}><i />{pending ? "Falta taxa" : status}</span>;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return <button type="button" aria-label={enabled ? "Desativar" : "Ativar"} aria-pressed={enabled} className={`toggle ${enabled ? "enabled" : ""}`} onClick={onToggle}><i /></button>;
}

function CrmView() {
  const crmData = [
    { id: "1052", date: "08/08", time: "12:45", channel: "Salão", customer: "Mesa 02", total: 114.50 },
    { id: "1051", date: "08/08", time: "12:30", channel: "WhatsApp", customer: "Camila Rocha", total: 84.90 },
    { id: "1050", date: "08/08", time: "12:15", channel: "Site", customer: "João Silva", total: 156.00 },
    { id: "1049", date: "08/08", time: "11:50", channel: "Salão", customer: "Mesa 05", total: 45.00 },
    { id: "1048", date: "07/08", time: "22:15", channel: "WhatsApp", customer: "Pedro Nogueira", total: 210.30 },
    { id: "1047", date: "07/08", time: "21:40", channel: "Site", customer: "Mariana Costa", total: 78.50 },
    { id: "1046", date: "07/08", time: "21:10", channel: "Salão", customer: "Mesa 01", total: 320.00 },
    { id: "1045", date: "07/08", time: "20:30", channel: "WhatsApp", customer: "Lucas Mendes", total: 65.00 },
  ];

  return (
    <div className="page-content crm-page">
      <div className="crm-header">
        <div>
          <h1>CRM (Histórico de Consumo)</h1>
          <p>Consumo diário detalhado de todas as origens.</p>
        </div>
      </div>
      
      <div style={{ overflowX: "auto" }}>
        <table className="crm-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Origem</th>
              <th>Pedido / Cliente</th>
              <th>Consumo</th>
            </tr>
          </thead>
          <tbody>
            {crmData.map(item => (
              <tr key={item.id} className="crm-row">
                <td>{item.date}</td>
                <td className="time-col">{item.time}</td>
                <td className="channel-col">
                  <span className={item.channel.toLowerCase()}>{item.channel === "WhatsApp" ? "◉" : item.channel === "Site" ? "⌘" : "▦"} {item.channel}</span>
                </td>
                <td><strong>#{item.id}</strong> • {item.customer}</td>
                <td>{formatMoney(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
