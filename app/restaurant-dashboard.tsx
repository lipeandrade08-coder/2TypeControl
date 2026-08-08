"use client";

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
  { label: "Visão geral", icon: "⌂", group: "OPERAÇÃO" },
  { label: "Pedidos", icon: "▤", badge: "12" },
  { label: "WhatsApp", icon: "◉", badge: "5" },
  { label: "Salão", icon: "▦" },
  { label: "Cardápio", icon: "◇", group: "GESTÃO" },
  { label: "Entregas", icon: "➜" },
  { label: "Relatórios", icon: "↗" },
  { label: "CRM", icon: "☷" },
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

const Icon = ({ children }: { children: string }) => <span className="icon-box" aria-hidden="true">{children}</span>;

export function RestaurantDashboard() {
  const [activeView, setActiveView] = useState<View>("Visão geral");
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.orders) {
          // Prepend new real orders from the database to the mock ones
          setOrders([...data.orders, ...initialOrders]);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };
    
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
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
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
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
        <div className="brand" onClick={() => chooseView("Visão geral")} role="button" tabIndex={0}>
          <span className="brand-logo"><img src="/2type-logo.png" alt="" /></span>
          <span className="brand-copy"><strong>2Type</strong><small>CONTROL</small></span>
        </div>

        <button className="restaurant-switch" type="button">
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
              >
                <Icon>{item.icon}</Icon>
                <span>{item.label}</span>
                {item.badge && <span className={`nav-badge ${item.label === "WhatsApp" ? "green" : ""}`}>{item.badge}</span>}
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
          <button className="mobile-menu-button" type="button" aria-label="Abrir menu" onClick={() => setMobileMenu(true)}>☰</button>
          <div>
            <p className="eyebrow">2TYPE CONTROL · CENTRAL DE OPERAÇÃO</p>
            <h1>{activeView === "Visão geral" ? "Bom dia, Rafael!" : activeView}</h1>
            <p className="topbar-subtitle">Sábado, 8 de agosto <span>•</span> <b>Restaurante aberto</b></p>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <span>⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar pedido ou cliente" />
              <kbd>⌘ K</kbd>
            </label>
            <button className="round-button notification" type="button" aria-label="Notificações" onClick={() => notify("Você tem 3 novas notificações.")}>♢<i /></button>
            <div className="live-status"><i /> Ao vivo</div>
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
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setFeeModal(false)}>
          <section className="fee-modal" role="dialog" aria-modal="true" aria-labelledby="fee-title" onMouseDown={(event) => event.stopPropagation()}>
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
              <span className="money-input"><b>R$</b><input autoFocus value={deliveryFee} onChange={(event) => setDeliveryFee(event.target.value)} inputMode="decimal" /></span>
            </label>
            <div className="fee-summary"><span>Subtotal do pedido</span><strong>{formatMoney(pendingFee.total)}</strong><span>Total com entrega</span><strong>{formatMoney(pendingFee.total + (Number(deliveryFee.replace(",", ".")) || 0))}</strong></div>
            <button className="primary-button wide" type="button" onClick={applyFee}>Confirmar pedido e enviar à cozinha</button>
          </section>
        </div>
      )}

      {addItemModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setAddItemModal(false)}>
          <section className="fee-modal pdv-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setAddItemModal(false)}>×</button>
            <p className="eyebrow orange">CATÁLOGO</p>
            <h2>Adicionar à Mesa {String(selectedTable).padStart(2, "0")}</h2>
            <div className="modal-content">
              <div className="catalog-grid">
                {menuItems.map((item) => {
                  const inCart = cart.find(c => c.name === item.name)?.quantity || 0;
                  return (
                    <article className="catalog-item" key={item.name} onClick={() => setCart(c => {
                      const exists = c.find(i => i.name === item.name);
                      if (exists) return c.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
                      return [...c, { name: item.name, quantity: 1, price: item.price }];
                    })}>
                      <div className="thumb">{item.name.slice(0, 1)}</div>
                      <div className="info">
                        <div>
                          <h3>{item.name}</h3>
                          <p>{item.category}</p>
                        </div>
                        <div className="price-row">
                          <strong>{formatMoney(item.price)}</strong>
                          <button className="add-btn" type="button">{inCart > 0 ? inCart : "+"}</button>
                        </div>
                      </div>
                    </article>
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
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setCheckoutModal(false)}>
          <section className="fee-modal pdv-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setCheckoutModal(false)}>×</button>
            <p className="eyebrow orange">FECHAR CONTA</p>
            <h2>Mesa {String(selectedTable).padStart(2, "0")}</h2>
            
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
                  <input type="number" placeholder="Desconto (%)" value={discount} onChange={e => setDiscount(e.target.value)} min="0" max="100" />
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
                  <div className={`payment-method ${paymentMethod === "Pix" ? "selected" : ""}`} onClick={() => setPaymentMethod("Pix")}>
                    <div className="icon">◈</div>
                    <div><strong>Pix</strong><small>Cobrado na maquininha</small></div>
                  </div>
                  <div className={`payment-method ${paymentMethod === "Crédito" ? "selected" : ""}`} onClick={() => setPaymentMethod("Crédito")}>
                    <div className="icon">💳</div>
                    <div><strong>Cartão de Crédito</strong><small>Visa, Mastercard</small></div>
                  </div>
                  <div className={`payment-method ${paymentMethod === "Débito" ? "selected" : ""}`} onClick={() => setPaymentMethod("Débito")}>
                    <div className="icon">💳</div>
                    <div><strong>Cartão de Débito</strong><small>Visa, Elo, Mastercard</small></div>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button className="primary-button wide" type="button" onClick={closeTable}>Confirmar Pagamento e Liberar Mesa</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast"><span>✓</span>{toast}</div>}
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
        <Metric title="Vendas hoje" value="R$ 3.842,50" note="12,8% vs. sábado passado" trend="up" icon="R$" />
        <Metric title="Pedidos" value="47" note="9 em andamento" trend="neutral" icon="▤" />
        <Metric title="Via WhatsApp" value="31" note="66% dos pedidos" trend="whatsapp" icon="◉" />
        <Metric title="Mesas ocupadas" value={`${occupied} / ${tables.length}`} note="21 clientes no salão" trend="neutral" icon="▦" />
      </section>

      {pendingFee && (
        <section className="attention-banner">
          <span className="attention-icon">!</span>
          <div><strong>Pedido #{pendingFee.id} aguardando taxa de entrega</strong><p>{pendingFee.customer} • {pendingFee.detail} • feito pelo site há 3 min</p></div>
          <button type="button" onClick={onOpenFee}>Adicionar taxa <span>→</span></button>
        </section>
      )}

      <div className="overview-grid">
        <section className="panel orders-panel">
          <PanelHeader title="Pedidos agora" subtitle="9 pedidos em andamento" action="Ver todos" onAction={() => onView("Pedidos")} />
          <div className="order-list">
            {orders.slice(0, 5).map((order) => (
              <article className="order-row" key={order.id}>
                <span className={`channel-mark ${order.channel.toLowerCase()}`}>{order.channel === "WhatsApp" ? "◉" : order.channel === "Site" ? "⌘" : "▦"}</span>
                <div className="order-main"><div><strong>#{order.id}</strong><span className="dot-separator">•</span><b>{order.customer}</b></div><small>{order.detail}</small></div>
                <div className="order-time"><small>{order.time}</small><strong>{formatMoney(order.total)}</strong></div>
                <StatusBadge status={order.status} pending={order.feePending} />
                <button className="row-action" type="button" aria-label={`Avançar pedido ${order.id}`} onClick={() => order.feePending ? onOpenFee() : onAdvance(order.id)}>›</button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel ai-panel">
          <PanelHeader title="IA no WhatsApp" subtitle="Atendimento automático" extra={<Toggle enabled={aiEnabled} onToggle={onToggleAi} />} />
          <div className="ai-status-row"><span className="spark">✦</span><span><strong>{aiEnabled ? "IA atendendo agora" : "IA pausada"}</strong><small>{aiEnabled ? "5 conversas ativas" : "Atendimento manual ativo"}</small></span><i /></div>
          <div className="mini-chat">
            <div className="chat-meta"><span className="avatar coral">CR</span><span><strong>Camila Rocha</strong><small>há 1 min</small></span><span className="whatsapp-mini">◉</span></div>
            <div className="customer-message">Meu pedido já saiu para entrega?</div>
            <div className="ai-message"><span>✦</span><p>Oi, Camila! Seu pedido <strong>#1046</strong> saiu às 10:36 e chega em cerca de 18 min. 😊</p></div>
          </div>
          <button className="ghost-button wide" type="button" onClick={() => onView("WhatsApp")}>Abrir central do WhatsApp <span>→</span></button>
          <div className="ai-footer"><span><b>94%</b> resolvidos pela IA hoje</span><span><b>1m 12s</b> tempo médio</span></div>
        </section>

        <section className="panel tables-panel">
          <PanelHeader title="Salão" subtitle={`${occupied} mesas ocupadas • 2 reservadas`} action="Ver mapa" onAction={() => onView("Salão")} />
          <div className="table-preview-grid">
            {tables.map((table) => (
              <button key={table.number} type="button" className={`mini-table ${table.status.toLowerCase()}`} onClick={() => onSelectTable(table.number)}>
                <span>M{String(table.number).padStart(2, "0")}</span>
                <small>{table.status === "Livre" ? "Livre" : table.status === "Reservada" ? table.time : formatMoney(table.total)}</small>
                {table.guests > 0 && <i>{table.guests}</i>}
              </button>
            ))}
          </div>
          <div className="legend"><span><i className="free" />Livre</span><span><i className="busy" />Ocupada</span><span><i className="bill" />Pediu conta</span><span><i className="reserved" />Reservada</span></div>
        </section>

        <section className="panel performance-panel">
          <PanelHeader title="Ritmo de hoje" subtitle="Pedidos por hora" action="Relatório" onAction={() => onView("Relatórios")} />
          <div className="small-chart">
            {[18, 28, 38, 55, 72, 84, 65, 92, 75, 58].map((height, index) => <i key={index} style={{ height: `${height}%` }} className={index === 7 ? "peak" : ""} />)}
          </div>
          <div className="chart-labels"><span>11h</span><span>13h</span><span>15h</span><span>17h</span><span>19h</span><span>21h</span></div>
          <div className="performance-summary"><span><small>Pico de pedidos</small><strong>18h–20h</strong></span><span><small>Ticket médio</small><strong>R$ 81,76</strong></span></div>
        </section>
      </div>
    </div>
  );
}

function OrdersView({ orders, filter, onFilter, onAdvance, onOpenFee }: { orders: Order[]; filter: string; onFilter: (filter: string) => void; onAdvance: (id: number) => void; onOpenFee: () => void }) {
  const columns: OrderStatus[] = ["Novo", "Confirmado", "Em preparo", "Pronto", "Saiu"];
  return (
    <div className="page-content">
      <div className="section-toolbar">
        <div className="filter-tabs">{["Todos", "WhatsApp", "Site", "Salão"].map((item) => <button type="button" className={filter === item ? "active" : ""} key={item} onClick={() => onFilter(item)}>{item}{item !== "Todos" && <small>{initialOrders.filter((order) => order.channel === item).length}</small>}</button>)}</div>
        <button className="primary-button" type="button">+ Novo pedido</button>
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
        <div className="composer"><button type="button" onClick={() => onNotify("Menu de anexos aberto")}>＋</button><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Digite uma mensagem..." /><button className="send-button" type="button" onClick={send}>➜</button></div>
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
            <div className="check-item" key={`${item.name}-${index}`}><b>{item.quantity}×</b><span><strong>{item.name}</strong><small>Observação padrão</small></span><strong>{formatMoney(item.price)}</strong></div>
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
      <section className="metric-grid"><Metric title="Faturamento no mês" value="R$ 86.420" note="18,4% acima de julho" trend="up" icon="R$" /><Metric title="Ticket médio" value="R$ 78,40" note="R$ 6,20 acima da meta" trend="up" icon="↗" /><Metric title="Pedidos no mês" value="1.102" note="67% via WhatsApp" trend="whatsapp" icon="▤" /><Metric title="Tempo médio" value="28 min" note="4 min mais rápido" trend="up" icon="◷" /></section>
      <div className="reports-grid"><section className="panel revenue-chart"><PanelHeader title="Faturamento" subtitle="Últimos 30 dias" action="Este mês ⌄" /><div className="chart-value"><strong>R$ 86.420,00</strong><span>↗ 18,4%</span></div><div className="large-chart">{bars.map((height,index)=><div key={index}><i style={{height:`${height}%`}} className={index === 10 ? "peak" : ""}/><small>{index % 2 === 0 ? `${index + 1}/08` : ""}</small></div>)}</div></section><section className="panel channel-report"><PanelHeader title="Canais de venda" subtitle="Participação no faturamento" /><div className="donut"><div><strong>R$ 86k</strong><small>total</small></div></div><div className="channel-legend"><span><i className="wa"/><b>WhatsApp</b><strong>52%</strong></span><span><i className="site"/><b>Site</b><strong>28%</strong></span><span><i className="room"/><b>Salão</b><strong>20%</strong></span></div></section></div>
    </div>
  );
}

function Metric({ title, value, note, trend, icon, onAction }: { title: string; value: string; note: string; trend: string; icon: string; onAction?: () => void }) {
  return <article className="metric-card"><div className={`metric-icon ${trend}`}>{icon}</div><div className="metric-copy"><span>{title}</span><strong>{value}</strong><small className={trend === "up" ? "positive" : ""}>{trend === "up" && "↗ "}{note}</small></div><button type="button" aria-label={`Detalhes de ${title}`} onClick={onAction}>•••</button></article>;
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
