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
  | "CRM"
  | "Integrações";

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

type Waiter = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

type Table = {
  number: number;
  seats: number;
  status: "Livre" | "Ocupada" | "Conta" | "Reservada";
  guests: number;
  total: number;
  time?: string;
  items: { name: string; quantity: number; price: number }[];
  waiterId?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
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
  { label: "Integrações", icon: "integracoes", group: "CONFIGURAÇÕES" },
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

const initialWaiters: Waiter[] = [
  { id: "w1", name: "Carlos Silva", initials: "CS", color: "var(--orange, #FF5733)" },
  { id: "w2", name: "Ana Paula", initials: "AP", color: "#33FF57" },
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

type ChatMessage = { side: "customer" | "ai" | "operator"; text: string; time: string };
type Conversation = { id: string; name: string; initials: string; message: string; time: string; unread: number; isVip?: boolean; history: ChatMessage[]; suggestion?: string };

const initialConversations: Conversation[] = [
  { 
    id: "c1", name: "Camila Rocha", initials: "CR", message: "Ótimo, muito obrigada!", time: "10:42", unread: 2, isVip: true,
    history: [
      { side: "customer", text: "Oi! Fiz o pedido #1046. Meu pedido já saiu para entrega?", time: "10:41" },
      { side: "ai", text: "Oi, Camila! Seu pedido #1046 saiu às 10:36 e chega em cerca de 18 min. 😊", time: "10:42" },
      { side: "customer", text: "Ótimo, muito obrigada!", time: "10:42" }
    ],
    suggestion: "Imagina, Camila! Qualquer dúvida estamos à disposição. Bom apetite! 🍕"
  },
  { 
    id: "c2", name: "Lucas Mendes", initials: "LM", message: "Perfeito, obrigado!", time: "10:36", unread: 0,
    history: [
      { side: "customer", text: "Boa noite, vocês entregam no bairro Jardins?", time: "10:30" },
      { side: "ai", text: "Boa noite, Lucas! Sim, entregamos no Jardins. A taxa fica em R$ 7,90 e o tempo médio é 40 min.", time: "10:31" },
      { side: "customer", text: "Vou pedir pelo iFood então, valeu.", time: "10:35" },
      { side: "ai", text: "Combinado! Aguardamos seu pedido.", time: "10:35" },
      { side: "customer", text: "Perfeito, obrigado!", time: "10:36" }
    ],
  },
  { 
    id: "c3", name: "Beatriz Lima", initials: "BL", message: "Vocês têm opção sem lactose?", time: "10:31", unread: 1,
    history: [
      { side: "customer", text: "Boa noite! Vocês têm opção sem lactose nas pizzas?", time: "10:31" },
    ],
    suggestion: "Oi Beatriz! Temos sim. Nossas pizzas podem ser feitas com queijo muçarela zero lactose. Qual sabor você prefere?"
  }
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
    case 'integracoes': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="14" width="8" height="8" rx="2" ry="2"/><rect x="14" y="2" width="8" height="8" rx="2" ry="2"/><path d="M6 14V6h8"/></svg>;
    default: return <span>{name}</span>;
  }
}

const Icon = ({ children, name }: { children?: string, name?: string }) => <span className="icon-box" aria-hidden="true"><AppIcon name={children || name || ""} /></span>;

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

let isMuted = false;
export function toggleMute() { isMuted = !isMuted; return isMuted; }
const audioContextRef: { current: AudioContext | null } = { current: null };

export function playSound(type: 'pop' | 'ding' | 'success') {
  if (isMuted || typeof window === 'undefined') return;
  if (!audioContextRef.current) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
       audioContextRef.current = new AudioContextClass();
    }
  }
  const ctx = audioContextRef.current;
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  if (type === 'pop') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } else if (type === 'ding') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } else if (type === 'success') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }
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
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [waiters, setWaiters] = useState<Waiter[]>(initialWaiters);
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
  const [muted, setMuted] = useState(isMuted);
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
    playSound('ding');
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
    let justFinished = false;
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== id || order.feePending) return order;
        const currentIdx = flow.indexOf(order.status);
        const nextIdx = Math.min(currentIdx + 1, flow.length - 1);
        if (nextIdx === flow.length - 1 && currentIdx !== flow.length - 1) justFinished = true;
        return { ...order, status: flow[nextIdx] };
      }),
    );
    if (justFinished) playSound('success');
    else playSound('pop');
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
    playSound('success');
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
          <button
            type="button"
            className="nav-item"
            style={{ marginBottom: "14px", minHeight: "36px", padding: "6px 10px" }}
            onClick={() => {
              const newState = toggleMute();
              setMuted(newState);
              if (!newState) playSound('pop');
            }}
            title={muted ? "Ligar sons" : "Desligar sons"}
          >
            <span style={{ fontSize: "14px" }}>{muted ? "🔇" : "🔊"}</span>
            <span style={{ flex: 1, color: "var(--muted)", textAlign: "left" }}>{muted ? "Sons mutados" : "Sons ativados"}</span>
          </button>
          
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
            waiters={waiters}
            selected={table}
            onSelect={setSelectedTable}
            onAddItem={openAddItemModal}
            onClose={openCheckoutModal}
            onNotify={notify}
            onUpdateTable={(t) => setTables(current => current.map(c => c.number === t.number ? t : c))}
            onAddTable={() => setTables(current => [...current, { number: current.length > 0 ? Math.max(...current.map(c => c.number)) + 1 : 1, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 10, y: 10, width: 104, height: 76 }])}
            onRemoveTable={(num) => {
              setTables(current => current.filter(c => c.number !== num));
              if (selectedTable === num) setSelectedTable(1);
            }}
            onWaitersUpdate={setWaiters}
          />
        )}
        {activeView === "Cardápio" && <MenuView onNotify={notify} />}
        {activeView === "Entregas" && <DeliveryView pendingFee={pendingFee} onOpenFee={() => setFeeModal(true)} onNotify={notify} />}
        {activeView === "Relatórios" && <ReportsView />}
        {activeView === "CRM" && <CrmView />}
        {activeView === "Integrações" && <IntegrationsView />}
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
  const [conversations, setConversations] = useState(initialConversations);
  const [activeChatId, setActiveChatId] = useState("c1");
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find(c => c.id === activeChatId) || conversations[0];

  const selectChat = (id: string) => {
    setActiveChatId(id);
    setConversations(current => current.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setMessage("");
    playSound('pop');
  };

  const send = () => {
    if (!message.trim()) return;
    setConversations(current => current.map(c => {
      if (c.id === activeChatId) {
        return { ...c, history: [...c.history, { side: "operator", text: message.trim(), time: "agora" }] };
      }
      return c;
    }));
    setMessage("");
    playSound('pop');
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const useSuggestion = () => {
    if (activeChat.suggestion) {
      setMessage(activeChat.suggestion);
      playSound('pop');
      onNotify("Sugestão da IA carregada. Pode editar e enviar.");
    }
  };

  return (
    <div className="page-content whatsapp-workspace">
      <section className="conversation-list panel">
        <div className="conversation-heading"><div><h2>Conversas</h2><span>{conversations.reduce((acc, c) => acc + c.unread, 0)} aguardando</span></div><button type="button">⌕</button></div>
        {conversations.map((conversation) => (
          <button className={`conversation-item ${activeChatId === conversation.id ? "active" : ""}`} key={conversation.id} type="button" onClick={() => selectChat(conversation.id)}>
            <span className={`avatar ${conversation.isVip ? "coral" : ""}`}>{conversation.initials}</span>
            <span><strong>{conversation.name}</strong><small>{conversation.history[conversation.history.length - 1]?.text}</small></span>
            <span><time>{conversation.time}</time>{conversation.unread > 0 && <b>{conversation.unread}</b>}</span>
          </button>
        ))}
      </section>
      <section className="chat-panel panel">
        <header className="chat-header"><span className={`avatar ${activeChat.isVip ? "coral" : ""}`}>{activeChat.initials}</span><span><strong>{activeChat.name}</strong><small><i /> WhatsApp • cliente ativo</small></span><button type="button">•••</button></header>
        <div className="chat-body">
          <div className="date-divider"><span>Hoje</span></div>
          {activeChat.history.map((item, index) => <div key={index} className={`bubble ${item.side}`}><span>{item.side === "ai" && "✦ "}{item.text}</span><small>{item.time}{item.side !== "customer" && <span className="check-read">✓✓</span>}</small></div>)}
          {aiEnabled && activeChat.unread > 0 && <div className="ai-thinking"><span>✦</span> A IA está acompanhando esta conversa</div>}
          <div ref={scrollRef} />
        </div>
        <div className="composer">
          <button type="button" aria-label="Adicionar anexo" onClick={() => onNotify("Menu de anexos aberto")}>＋</button>
          <input aria-label={`Mensagem para ${activeChat.name}`} value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Digite uma mensagem..." />
          <button className="send-button" type="button" aria-label="Enviar mensagem" onClick={send}>➜</button>
        </div>
      </section>
      <aside className="chat-insights panel">
        <div className="insights-header"><span className="spark">✦</span><span><strong>Copiloto IA</strong><small>Contexto da conversa</small></span><Toggle enabled={aiEnabled} onToggle={onToggleAi} /></div>
        <div className="customer-summary"><span className={`avatar large ${activeChat.isVip ? "coral" : ""}`}>{activeChat.initials}</span><h3>{activeChat.name}</h3><p>{activeChat.isVip ? "7 pedidos • ticket médio R$ 73,40" : "1 pedido • cliente novo"}</p></div>
        
        {activeChatId === "c1" && (
          <div className="insight-block"><small>PEDIDO ATUAL</small><div className="linked-order"><span><strong>#1046</strong><small>Saiu para entrega às 10:36</small></span><StatusBadge status="Saiu" /></div></div>
        )}
        
        <div className="insight-block"><small>RESUMO DA IA</small><p>{activeChat.suggestion ? "O cliente fez uma pergunta. Sugiro uma resposta educada e rápida." : "Conversa resolvida ou aguardando cliente."}</p></div>
        
        {activeChat.suggestion && (
          <div className="insight-block"><small>PRÓXIMA AÇÃO</small><button className="suggestion" type="button" onClick={useSuggestion}><span>✦</span><p>{activeChat.suggestion}</p><b>Usar resposta →</b></button></div>
        )}
        
        <button className="ghost-button wide" type="button" onClick={() => onNotify("Atendimento assumido pelo operador.")}>Assumir atendimento</button>
      </aside>
    </div>
  );
}

function DiningView({ tables, waiters, selected, onSelect, onAddItem, onClose, onNotify, onUpdateTable, onAddTable, onRemoveTable, onWaitersUpdate }: { tables: Table[]; waiters: Waiter[]; selected: Table; onSelect: (number: number) => void; onAddItem: () => void; onClose: () => void; onNotify: (message: string) => void; onUpdateTable: (t: Table) => void; onAddTable: () => void; onRemoveTable: (num: number) => void; onWaitersUpdate: (w: Waiter[]) => void }) {
  const [activeArea, setActiveArea] = useState("Salão principal");
  const [isEditingMap, setIsEditingMap] = useState(false);
  const [draggingTable, setDraggingTable] = useState<number | null>(null);
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [editingTableNumber, setEditingTableNumber] = useState<number | null>(null);
  
  // Waiter assignment modal
  const [assignWaiterTable, setAssignWaiterTable] = useState<number | null>(null);

  // New waiter form
  const [newWaiterName, setNewWaiterName] = useState("");
  const [newWaiterColor, setNewWaiterColor] = useState("purple");

  const getOccupancyText = (status: string) => {
    if (status === "Livre") return "Livre";
    if (status === "Reservada") return "Reservada";
    if (status === "Conta") return "Fechando conta";
    return "Há 45 min";
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEditingMap || draggingTable === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const table = tables.find(t => t.number === draggingTable);
    if (table) {
      onUpdateTable({ ...table, x, y });
    }
  };

  const handlePointerUp = () => {
    if (draggingTable !== null) {
      setDraggingTable(null);
      onNotify("Posição salva.");
    }
  };

  const handleAddWaiter = () => {
    if (!newWaiterName.trim()) return;
    const initials = newWaiterName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    const newWaiter = { id: `w${Date.now()}`, name: newWaiterName, initials, color: newWaiterColor };
    onWaitersUpdate([...waiters, newWaiter]);
    setNewWaiterName("");
    onNotify("Garçom adicionado.");
  };

  const selectedWaiter = waiters.find(w => w.id === selected.waiterId);

  return (
    <div className="page-content dining-layout">
      {/* MAPA */}
      <section className="floor-panel panel">
        <div className="section-toolbar compact">
          <div className="filter-tabs">
            <button className={activeArea === "Salão principal" ? "active" : ""} onClick={() => { setActiveArea("Salão principal"); playSound('pop'); }} type="button">Salão principal</button>
            <button className={activeArea === "Varanda" ? "active" : ""} onClick={() => { setActiveArea("Varanda"); playSound('pop'); onNotify("Mapa da Varanda carregado."); }} type="button">Varanda</button>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {isEditingMap ? (
              <>
                <button className="ghost-button" type="button" onClick={() => { playSound('pop'); onAddTable(); }}>+ Nova Mesa</button>
                <button className="primary-button" type="button" onClick={() => { setIsEditingMap(false); onNotify("Edições salvas."); }}>Salvar Mapa</button>
              </>
            ) : (
              <>
                <button className="ghost-button" type="button" onClick={() => setShowWaiterModal(true)}>Gerenciar Equipe</button>
                <button className="ghost-button" type="button" onClick={() => setIsEditingMap(true)}>Editar mapa</button>
              </>
            )}
          </div>
        </div>
        <div className="floor-info"><span><strong>{tables.filter((table) => table.status === "Livre").length}</strong> livres</span><span><strong>{tables.filter((table) => table.status === "Ocupada").length}</strong> ocupadas</span><span><strong>{tables.filter((table) => table.status === "Conta").length}</strong> pediu conta</span><span><strong>{tables.filter((table) => table.status === "Reservada").length}</strong> reservadas</span></div>
        <div className={`floor-map ${isEditingMap ? "editing" : ""}`} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
          <div className="bar-counter">BAR / BALCÃO</div>
          {tables.map((table) => {
            const waiter = waiters.find(w => w.id === table.waiterId);
            return (
              <button 
                className={`floor-table ${table.status.toLowerCase()} ${selected.number === table.number ? "selected" : ""}`} 
                type="button" 
                key={table.number} 
                style={{ left: `${table.x}%`, top: `${table.y}%`, width: `${table.width}px`, height: `${table.height}px`, transform: "translate(-50%, -50%)", position: "absolute" }}
                onPointerDown={(e) => {
                  if (isEditingMap) {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDraggingTable(table.number);
                  }
                }}
                onClick={() => {
                  if (isEditingMap && draggingTable === null) {
                    setEditingTableNumber(table.number);
                  } else if (!isEditingMap) {
                    playSound('pop'); 
                    onSelect(table.number); 
                  }
                }}
              >
                {waiter && !isEditingMap && <span style={{ position: "absolute", top: "-8px", right: "-8px", background: `var(--${waiter.color})`, color: "white", borderRadius: "50%", width: "20px", height: "20px", display: "grid", placeItems: "center", fontSize: "8px", fontWeight: "bold" }}>{waiter.initials}</span>}
                <span>M{String(table.number).padStart(2, "0")}</span>
                <small>{table.status === "Reservada" ? table.time : table.status === "Livre" ? `${table.seats} lugares` : getOccupancyText(table.status)}</small>
                {table.guests > 0 && <b>{table.guests} pessoas</b>}
                {isEditingMap && <div className="edit-overlay" style={{ position: "absolute", inset: 0, background: "rgba(229,109,53,0.3)", borderRadius: "inherit", zIndex: 20, display: "grid", placeItems: "center", opacity: draggingTable === table.number ? 1 : 0.4 }}><span style={{ color: "white", fontSize: "16px" }}>{draggingTable === table.number ? "✋" : "✏️"}</span></div>}
              </button>
            );
          })}
          <div className="kitchen-marker">COZINHA</div>
        </div>
      </section>

      {/* COMANDA */}
      <aside className="table-check panel">
        <header><div><p className="eyebrow">COMANDA ABERTA</p><h2>Mesa {String(selected.number).padStart(2, "0")}</h2><span>{selected.guests || selected.seats} pessoas • {selected.status === "Livre" ? "mesa livre" : "em andamento"}</span></div><button type="button">•••</button></header>
        <div className="waiter-row" style={{ position: "relative" }}>
          {selectedWaiter ? (
            <>
              <span className={`avatar ${selectedWaiter.color}`}>{selectedWaiter.initials}</span>
              <span><small>Garçom responsável</small><strong>{selectedWaiter.name}</strong></span>
            </>
          ) : (
            <>
              <span className="avatar" style={{ background: "transparent", border: "1px dashed #666" }}>?</span>
              <span><small>Nenhum responsável</small><strong>Não atribuído</strong></span>
            </>
          )}
          <button type="button" onClick={() => setAssignWaiterTable(assignWaiterTable === selected.number ? null : selected.number)}>Trocar</button>
          
          {/* Dropdown de Garçons */}
          {assignWaiterTable === selected.number && (
            <div className="dropdown-menu" style={{ position: "absolute", top: "100%", right: "20px", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px", padding: "8px", zIndex: 100, width: "200px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
              {waiters.map(w => (
                <button key={w.id} type="button" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "8px", background: "transparent", border: "0", cursor: "pointer", borderRadius: "6px", textAlign: "left", color: "white" }} onClick={() => { onUpdateTable({ ...selected, waiterId: w.id }); setAssignWaiterTable(null); onNotify(`${w.name} atribuído à Mesa ${selected.number}`); }}>
                  <span className={`avatar ${w.color}`} style={{ width: "24px", height: "24px", fontSize: "9px" }}>{w.initials}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600 }}>{w.name}</span>
                </button>
              ))}
              <div style={{ height: "1px", background: "var(--line)", margin: "8px 0" }} />
              <button type="button" style={{ width: "100%", padding: "8px", background: "transparent", border: "0", color: "var(--muted)", cursor: "pointer", fontSize: "10px", textAlign: "left" }} onClick={() => { onUpdateTable({ ...selected, waiterId: undefined }); setAssignWaiterTable(null); }}>Remover atribuição</button>
            </div>
          )}
        </div>
        <div className="check-items">
          {selected.items.length > 0 ? selected.items.map((item, index) => (
            <div className="check-item" key={`${item.name}-${index}`}><b>{item.quantity}×</b><span><strong>{item.name}</strong><small>Observação padrão</small></span><strong>{formatMoney(item.price * item.quantity)}</strong></div>
          )) : <div className="empty-check"><span>◇</span><strong>Nenhum item lançado</strong><small>Adicione o primeiro item desta mesa.</small></div>}
        </div>
        <button className="add-item-button" type="button" onClick={() => { playSound('pop'); onAddItem(); }}>＋ Adicionar item</button>
        <div className="check-total"><span><small>Subtotal</small><strong>{formatMoney(selected.total)}</strong></span><span><small>Serviço (10%)</small><strong>{formatMoney(selected.total * 0.1)}</strong></span><div><span>Total da mesa</span><strong>{formatMoney(selected.total * 1.1)}</strong></div></div>
        <div className="check-actions"><button className="ghost-button" type="button" onClick={() => onNotify("Pré-conta enviada para impressão.")}>Imprimir</button><button className="primary-button" type="button" disabled={selected.total === 0} onClick={() => { playSound('pop'); onClose(); }}>Cobrar</button></div>
      </aside>

      {/* MODAL: EQUIPE / GARÇONS */}
      {showWaiterModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "420px" }}>
            <div className="modal-header">
              <h2>Gestão de Equipe (Garçons)</h2>
              <button className="close-button" type="button" onClick={() => setShowWaiterModal(false)}>×</button>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                {waiters.map(w => (
                  <div key={w.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px" }}>
                    <span className={`avatar ${w.color}`}>{w.initials}</span>
                    <span style={{ flex: 1, fontSize: "14px", fontWeight: "600" }}>{w.name}</span>
                    <button type="button" style={{ border: 0, background: "transparent", color: "var(--orange)", cursor: "pointer", fontSize: "12px" }} onClick={() => { onWaitersUpdate(waiters.filter(wa => wa.id !== w.id)); onNotify("Garçom removido."); }}>Remover</button>
                  </div>
                ))}
              </div>
              
              <div style={{ padding: "16px", border: "1px dashed var(--line)", borderRadius: "10px" }}>
                <h3 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--muted)" }}>Adicionar novo</h3>
                <input type="text" className="modal-input" placeholder="Nome completo" value={newWaiterName} onChange={(e) => setNewWaiterName(e.target.value)} style={{ marginBottom: "12px" }} />
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  {["purple", "orange", "mint", "coral", "blue"].map(color => (
                    <button key={color} type="button" style={{ width: "24px", height: "24px", borderRadius: "50%", background: `var(--${color})`, border: newWaiterColor === color ? "2px solid white" : "2px solid transparent", cursor: "pointer" }} onClick={() => setNewWaiterColor(color)} />
                  ))}
                </div>
                <button type="button" className="primary-button wide" onClick={handleAddWaiter} disabled={!newWaiterName.trim()}>Salvar Garçom</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR MESA */}
      {editingTableNumber !== null && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "380px" }}>
            <div className="modal-header">
              <h2>Editar Mesa {editingTableNumber}</h2>
              <button className="close-button" type="button" onClick={() => setEditingTableNumber(null)}>×</button>
            </div>
            <div style={{ padding: "20px" }}>
              {(() => {
                const t = tables.find(tb => tb.number === editingTableNumber);
                if (!t) return null;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>Lugares (Cadeiras)</label>
                      <input type="number" className="modal-input" value={t.seats} onChange={(e) => onUpdateTable({ ...t, seats: parseInt(e.target.value) || 2 })} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>Largura (Visual)</label>
                        <input type="number" className="modal-input" value={t.width} onChange={(e) => onUpdateTable({ ...t, width: parseInt(e.target.value) || 104 })} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>Altura (Visual)</label>
                        <input type="number" className="modal-input" value={t.height} onChange={(e) => onUpdateTable({ ...t, height: parseInt(e.target.value) || 76 })} />
                      </div>
                    </div>
                    <button type="button" className="ghost-button wide" style={{ color: "var(--orange)", borderColor: "rgba(229,109,53,0.3)", marginTop: "10px" }} onClick={() => { onRemoveTable(t.number); setEditingTableNumber(null); onNotify("Mesa removida com sucesso."); }}>Apagar Mesa</button>
                    <button type="button" className="primary-button wide" onClick={() => setEditingTableNumber(null)}>Concluir</button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
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
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  const crmData = [
    { id: "C01", name: "Camila Rocha", phone: "(11) 98765-4321", totalSpent: 1254.90, avgTicket: 89.60, orders: 14, lastVisit: "08/08", favDish: "Burger Artesanal", segment: "VIP" },
    { id: "C02", name: "João Silva", phone: "(11) 91234-5678", totalSpent: 356.00, avgTicket: 71.20, orders: 5, lastVisit: "08/08", favDish: "Pizza Margherita", segment: "Recorrente" },
    { id: "C03", name: "Mariana Costa", phone: "(11) 99876-5432", totalSpent: 178.50, avgTicket: 89.25, orders: 2, lastVisit: "07/08", favDish: "Porção de Fritas", segment: "Novo" },
    { id: "C04", name: "Pedro Nogueira", phone: "(11) 94567-8901", totalSpent: 2110.30, avgTicket: 105.50, orders: 20, lastVisit: "07/08", favDish: "Combo Casal", segment: "VIP" },
    { id: "C05", name: "Lucas Mendes", phone: "(11) 97654-3210", totalSpent: 65.00, avgTicket: 65.00, orders: 1, lastVisit: "07/08", favDish: "X-Bacon", segment: "Em Risco" },
    { id: "C06", name: "Ana Beatriz", phone: "(11) 98888-7777", totalSpent: 489.00, avgTicket: 61.12, orders: 8, lastVisit: "02/08", favDish: "Refrigerante 2L", segment: "Recorrente" },
    { id: "C07", name: "Felipe Almeida", phone: "(11) 93333-2222", totalSpent: 112.00, avgTicket: 112.00, orders: 1, lastVisit: "01/08", favDish: "Pizza Calabresa", segment: "Novo" },
    { id: "C08", name: "Juliana Santos", phone: "(11) 95555-4444", totalSpent: 870.20, avgTicket: 79.10, orders: 11, lastVisit: "25/07", favDish: "Burger Duplo", segment: "Recorrente" },
  ];

  const toggleClient = (id: string) => {
    setSelectedClients(prev => prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedClients.length === crmData.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(crmData.map(c => c.id));
    }
  };

  const getSegmentBadge = (segment: string) => {
    switch(segment) {
      case "VIP": return <span className="crm-badge vip">🌟 VIP</span>;
      case "Recorrente": return <span className="crm-badge recurrent">🔄 Recorrente</span>;
      case "Novo": return <span className="crm-badge new">🟢 Novo</span>;
      case "Em Risco": return <span className="crm-badge risk">🔴 Em Risco</span>;
      default: return <span className="crm-badge">{segment}</span>;
    }
  };

  return (
    <div className="page-content crm-page">
      <div className="crm-header-section">
        <div className="crm-header-titles">
          <h1>Clientes <span>(CRM)</span></h1>
          <p>Gestão completa de base, inteligência de consumo e retenção.</p>
        </div>
        <div className="crm-header-actions">
          <button className="ghost-button"><Icon name="configuracoes" /> Exportar Base</button>
          <button className="primary-button"><Icon name="entregas" /> Novo Cliente</button>
        </div>
      </div>

      <div className="spreadsheet-container">
        <div className="spreadsheet-toolbar">
          <div className="search-box spreadsheet-search">
            <Icon name="visao-geral" /> 
            <input type="text" placeholder="Buscar cliente por nome ou telefone..." />
            <kbd>⌘K</kbd>
          </div>
          <div className="spreadsheet-filters">
            <select>
              <option>Todos os Segmentos</option>
              <option>VIP</option>
              <option>Recorrentes</option>
              <option>Novos</option>
              <option>Em Risco</option>
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
                  <input type="checkbox" checked={selectedClients.length === crmData.length && crmData.length > 0} onChange={toggleAll} />
                </th>
                <th>Cliente</th>
                <th>Contato</th>
                <th>LTV (Total)</th>
                <th>Tkt. Médio</th>
                <th>Pedidos</th>
                <th>Última Visita</th>
                <th>Prato Favorito</th>
                <th>Status</th>
                <th className="action-cell"></th>
              </tr>
            </thead>
            <tbody>
              {crmData.map(client => (
                <tr key={client.id} className={`spreadsheet-row ${selectedClients.includes(client.id) ? 'selected' : ''}`}>
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
                  <td>{getSegmentBadge(client.segment)}</td>
                  <td className="action-cell">
                    <div className="row-actions">
                      <button title="Enviar WhatsApp" className="action-btn wa-btn"><Icon name="entregas" /> Zap</button>
                      <button title="Ver Perfil" className="action-btn view-btn">Ver</button>
                    </div>
                  </td>
                </tr>
              ))}
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

function IntegrationsView() {
  return (
    <div className="page-content integrations-page">
      <div className="crm-header-section">
        <div className="crm-header-titles">
          <h1>Central de <span>Integrações</span></h1>
          <p>Conecte o 2Type Control às principais plataformas e automatize sua operação.</p>
        </div>
      </div>
      <div className="integrations-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "24px" }}>
        <div className="integration-card" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
              <img src="https://logospng.org/download/ifood/logo-ifood-256.png" alt="iFood" style={{ width: "100%", height: "auto" }} />
            </div>
            <span className="crm-badge new">Conectado</span>
          </div>
          <div>
            <h3 style={{ margin: "8px 0 4px", fontSize: "14px", color: "white" }}>iFood</h3>
            <p style={{ margin: "0", fontSize: "11px", color: "var(--muted)", lineHeight: 1.4 }}>Receba pedidos, atualize status e gerencie o cardápio diretamente por aqui.</p>
          </div>
          <button className="ghost-button" style={{ marginTop: "auto", width: "100%" }}>Configurar Integração</button>
        </div>
        
        <div className="integration-card" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
              <Icon name="whatsapp" />
            </div>
            <span className="crm-badge new">Ativo</span>
          </div>
          <div>
            <h3 style={{ margin: "8px 0 4px", fontSize: "14px", color: "white" }}>WhatsApp Business API</h3>
            <p style={{ margin: "0", fontSize: "11px", color: "var(--muted)", lineHeight: 1.4 }}>Automação de chat, botões de ação e inteligência artificial para pedidos.</p>
          </div>
          <button className="ghost-button" style={{ marginTop: "auto", width: "100%" }}>Desconectar</button>
        </div>

        <div className="integration-card" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", opacity: 0.7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
              <Icon name="entregas" />
            </div>
            <span className="crm-badge">Não conectado</span>
          </div>
          <div>
            <h3 style={{ margin: "8px 0 4px", fontSize: "14px", color: "white" }}>Loggi / Bee Delivery</h3>
            <p style={{ margin: "0", fontSize: "11px", color: "var(--muted)", lineHeight: 1.4 }}>Encontre motoboys automaticamente e calcule a taxa de entrega.</p>
          </div>
          <button className="primary-button" style={{ marginTop: "auto", width: "100%" }}>Conectar</button>
        </div>
      </div>
    </div>
  );
}
