"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useRef } from "react";
import { ThemeToggle } from "../components/theme-toggle";


export type AppRole = "admin" | "balcao" | "garcom" | "cozinha" | "entregador";

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

type OrderStatus = "Novo" | "Confirmado" | "Em preparo" | "Pronto" | "Saiu" | "Entregue";

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
  area?: "salao" | "varanda";
  reservedFor?: string;
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
  { number: 1, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 13, y: 27, width: 96, height: 72, area: "salao" },
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
    x: 36, y: 27, width: 96, height: 72, area: "salao",
  },
  { number: 3, seats: 2, status: "Reservada", guests: 2, total: 0, time: "20:30", items: [], x: 60, y: 27, width: 80, height: 62, area: "salao", reservedFor: "Família Rocha" },
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
    x: 83, y: 27, width: 112, height: 84, area: "salao",
  },
  { number: 5, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 13, y: 54, width: 96, height: 72, area: "salao" },
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
    x: 36, y: 54, width: 96, height: 72, area: "salao",
  },
  { number: 7, seats: 2, status: "Livre", guests: 0, total: 0, items: [], x: 60, y: 54, width: 80, height: 62, area: "salao" },
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
    x: 83, y: 54, width: 96, height: 72, area: "salao",
  },
  { number: 9, seats: 6, status: "Reservada", guests: 5, total: 0, time: "21:00", items: [], x: 13, y: 82, width: 112, height: 84, area: "salao", reservedFor: "Grupo Silva" },
  {
    number: 10,
    seats: 4,
    status: "Ocupada",
    guests: 4,
    total: 198.8,
    time: "54 min",
    items: [{ name: "Jantar completo", quantity: 4, price: 198.8 }],
    x: 40, y: 82, width: 96, height: 72, area: "salao",
  },
  { number: 11, seats: 2, status: "Livre", guests: 0, total: 0, items: [], x: 63, y: 82, width: 80, height: 62, area: "salao" },
  { number: 12, seats: 8, status: "Livre", guests: 0, total: 0, items: [], x: 84, y: 82, width: 140, height: 96, area: "salao" },
];

const initialVarandaTables: Table[] = [
  { number: 13, seats: 2, status: "Livre", guests: 0, total: 0, items: [], x: 20, y: 30, width: 80, height: 62, area: "varanda" },
  { number: 14, seats: 2, status: "Livre", guests: 0, total: 0, items: [], x: 50, y: 30, width: 80, height: 62, area: "varanda" },
  { number: 15, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 80, y: 30, width: 96, height: 72, area: "varanda" },
  { number: 16, seats: 2, status: "Reservada", guests: 2, total: 0, time: "21:30", items: [], x: 35, y: 68, width: 80, height: 62, area: "varanda", reservedFor: "Casal Mendes" },
  { number: 17, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 65, y: 68, width: 96, height: 72, area: "varanda" },
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

type MenuItem = { name: string; category: string; price: number; sold: number; available: boolean; };

const initialMenuItems: MenuItem[] = [
  { name: "Pizza Margherita", category: "Pizzas", price: 58.9, sold: 34, available: true },
  { name: "Pizza Calabresa", category: "Pizzas", price: 62, sold: 29, available: true },
  { name: "Parmegiana da casa", category: "Pratos", price: 48.5, sold: 24, available: true },
  { name: "Lasanha bolonhesa", category: "Massas", price: 42.9, sold: 19, available: true },
  { name: "Tiramisù", category: "Sobremesas", price: 24, sold: 16, available: true },
  { name: "Nhoque artesanal", category: "Massas", price: 44, sold: 8, available: false },
];

function AppIcon({ name }: { name: string }) {
  switch (name) {
    case 'visao-geral': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18V10M10 18V6M16 18v-4M22 18V3" /><path d="M3 21h20" /><path d="M4 10l6-4 6 8 6-11" /></svg>;
    case 'pedidos': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M9 3.5h6M8 9h8M8 13h5M8 17h7" /></svg>;
    case 'whatsapp': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4a8 8 0 0 0-7 11.8L4 20l4.4-1.1A8 8 0 1 0 12 4Z" /><path d="M9.1 8.6c.6 2.6 2.7 4.7 5.3 5.4l1.2-1.2M9.1 8.6 8 9.7" /></svg>;
    case 'salao': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="6" height="5" rx="1.5" /><rect x="14" y="5" width="6" height="5" rx="1.5" /><rect x="4" y="14" width="6" height="5" rx="1.5" /><rect x="14" y="14" width="6" height="5" rx="1.5" /></svg>;
    case 'cardapio': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>;
    case 'entregas': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11v10H3z" /><path d="M14 10h4l3 3v4h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>;
    case 'crm': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="3" /><circle cx="17" cy="7" r="2.5" /><path d="M3 20c.5-4 2.6-6 5-6s4.5 2 5 6" /><path d="M14 13c3.5 0 5.5 2 6 5" /></svg>;
    case 'relatorios': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V5M16 20v-8M22 20V3" /><path d="M3 20h20" /></svg>;
    case 'integracoes': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="14" width="8" height="8" rx="2" ry="2" /><rect x="14" y="2" width="8" height="8" rx="2" ry="2" /><path d="M6 14V6h8" /></svg>;
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

const initialJardinsOrders: Order[] = [
  { id: 2001, customer: "Marcos Silva", channel: "WhatsApp", detail: "1 Hambúrguer Artesanal", total: 35.9, time: "há 2 min", status: "Novo" },
  { id: 2002, customer: "Mesa 02", channel: "Salão", detail: "2 Chopps • 1 Porção Batata", total: 58.0, time: "há 15 min", status: "Em preparo" },
];

const initialJardinsTables: Table[] = [
  { number: 1, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 20, y: 30, width: 90, height: 70, area: "salao" },
  { number: 2, seats: 4, status: "Ocupada", guests: 2, total: 58.0, time: "15 min", items: [{ name: "Chopp", quantity: 2, price: 14 }, { name: "Porção Batata", quantity: 1, price: 30 }], x: 50, y: 30, width: 90, height: 70, area: "salao" },
  { number: 3, seats: 2, status: "Livre", guests: 0, total: 0, items: [], x: 80, y: 30, width: 70, height: 60, area: "salao" },
];

const initialJardinsWaiters: Waiter[] = [
  { id: "w3", name: "Felipe Jardins", initials: "FJ", color: "var(--blue)" }
];

export function RestaurantDashboard({ role = "admin" }: { role?: AppRole }) {

  // Navigation filtered by role
  const filteredNavigation = useMemo(() => {
    if (role === "admin") return navigation;
    if (role === "balcao") return navigation.filter(n => ["Visão geral", "Pedidos", "WhatsApp", "Salão", "Entregas"].includes(n.label));
    if (role === "garcom") return navigation.filter(n => ["Salão", "Cardápio"].includes(n.label));
    if (role === "cozinha") return navigation.filter(n => ["Pedidos", "Cardápio"].includes(n.label));
    return navigation;
  }, [role]);

  // Default view based on role
  const defaultView = useMemo(() => {
    if (role === "garcom") return "Salão";
    if (role === "cozinha") return "Pedidos";
    return "Visão geral";
  }, [role]);

  const [activeView, setActiveView] = useState<View>(defaultView);

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const feeInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<number | undefined>(undefined);
  const activeUnitRef = useRef<"Matriz" | "Jardins">("Matriz");

  useEffect(() => {
    let mounted = true;
    let controller: AbortController | undefined;

    const fetchOrders = async () => {
      if (activeUnitRef.current !== "Matriz") return;
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
  const [tables, setTables] = useState<Table[]>([...initialTables, ...initialVarandaTables]);
  const [waiters, setWaiters] = useState<Waiter[]>(initialWaiters);
  const [selectedTable, setSelectedTable] = useState(2);
  const [feeModal, setFeeModal] = useState(false);
  const [addItemModal, setAddItemModal] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [cart, setCart] = useState<{ name: string, quantity: number, price: number }[]>([]);
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
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [newOrderData, setNewOrderData] = useState<{ customer: string; channel: "WhatsApp" | "Site" | "Salão"; detail: string; total: string }>({ customer: "", channel: "WhatsApp", detail: "", total: "" });
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

  useEffect(() => {
    activeUnitRef.current = activeUnit;
  }, [activeUnit]);

  useEffect(() => {
    if (!aiEnabled) return;
    const interval = window.setInterval(() => {
      const tips = [
        "🤖 Inteligência Artificial: Vendas de pizza estão 30% abaixo da média desta quinta — quer ativar promoção?",
        "🤖 Inteligência Artificial: Mesa 4 está há 1h40 sem pedir sobremesa — boa hora para oferecer!",
        "🤖 Inteligência Artificial: Camila Rocha pediu 14x. Ela não pede há 2 semanas — enviar cupom?",
        "🤖 Inteligência Artificial: A taxa de ocupação da Varanda caiu 15% nos últimos 3 dias."
      ];
      const tip = tips[Math.floor(Math.random() * tips.length)];
      setNotifications(n => [{ id: Math.random(), text: tip, time: "agora", read: false }, ...n]);
      setToast(tip.replace("🤖 Inteligência Artificial: ", ""));
      playSound('ding');
    }, 45000);
    return () => window.clearInterval(interval);
  }, [aiEnabled]);

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
    setShowNotifications(false);
  };

  const addOrder = (order: Order) => {
    setOrders(current => [order, ...current]);
    notify(`Pedido #${order.id} criado com sucesso!`);
    playSound('ding');
  };

  const openReserveModal = (tableNum: number) => {
    setReserveTableNum(tableNum);
    setReserveData({ name: "", time: "", guests: 2 });
    setReserveModal(true);
  };

  const confirmReservation = () => {
    if (!reserveTableNum || !reserveData.name || !reserveData.time) {
      notify("Preencha o nome e o horário da reserva.");
      return;
    }
    setTables(current => current.map(t =>
      t.number === reserveTableNum
        ? { ...t, status: "Reservada", time: reserveData.time, guests: reserveData.guests, reservedFor: reserveData.name }
        : t
    ));
    setReserveModal(false);
    notify(`Mesa ${String(reserveTableNum).padStart(2, "0")} reservada para ${reserveData.name} às ${reserveData.time}.`);
    playSound('success');
  };


  if (role === "entregador") {
    return (
      <DriverView
        orders={orders}
        onAdvance={advanceOrder}
        onComplete={(id) => setOrders(curr => curr.map(o => o.id === id ? { ...o, status: "Entregue" } : o))}
        onExit={() => window.location.href = "/"}
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
          const totalToAdd = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

          setTables(current => current.map(t => {
            if (t.number !== tableNum) return t;

            const newItems = [...(t.items || [])];
            items.forEach(newItem => {
              const existing = newItems.find(i => i.name === newItem.name);
              if (existing) {
                existing.quantity += newItem.quantity;
              } else {
                newItems.push({ ...newItem });
              }
            });

            return {
              ...t,
              status: "Ocupada",
              total: t.total + totalToAdd,
              items: newItems
            };
          }));

          const orderStr = items.map(i => `${i.quantity}x ${i.name}`).join(" • ");
          addOrder({
            id: 3000 + Math.floor(Math.random() * 1000),
            customer: `Mesa ${String(tableNum).padStart(2, "0")}`,
            channel: "Salão",
            detail: orderStr,
            total: totalToAdd,
            time: "agora",
            status: "Novo"
          });
        }}
      />
    );
  }

  return (
    <div className="app-shell">

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>

        <button className="brand" type="button" onClick={() => chooseView("Visão geral")} style={{ padding: "8px 16px", background: "transparent", border: 0, cursor: "pointer", display: "flex", alignItems: "center" }}>
          <img src="/logopng.png" alt="2Type Control" className="main-logo" style={{ width: "100%", height: "auto", maxHeight: 110, objectFit: "contain" }} />
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
                <button type="button" onClick={() => {
                  setActiveUnit("Matriz");
                  setOrders(initialOrders);
                  setTables([...initialTables, ...initialVarandaTables]);
                  setWaiters(initialWaiters);
                  setShowUnitSwitcher(false);
                  notify("Unidade Matriz carregada.");
                }} style={{ padding: "8px 12px", background: activeUnit === "Matriz" ? "var(--purple-soft)" : "transparent", border: 0, color: "var(--ink)", borderRadius: 6, textAlign: "left", cursor: "pointer" }}>Unidade Matriz</button>
                <button type="button" onClick={() => {
                  setActiveUnit("Jardins");
                  setOrders(initialJardinsOrders);
                  setTables(initialJardinsTables);
                  setWaiters(initialJardinsWaiters);
                  setShowUnitSwitcher(false);
                  notify("Unidade Jardins carregada.");
                }} style={{ padding: "8px 12px", background: activeUnit === "Jardins" ? "var(--purple-soft)" : "transparent", border: 0, color: "var(--ink)", borderRadius: 6, textAlign: "left", cursor: "pointer" }}>Unidade Jardins</button>
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

          <button className="integration-card" type="button" onClick={() => chooseView("Integrações")}>
            <span className="integration-icon">⌁</span>
            <span><strong>Integrações</strong><small>3 de 4 conectadas</small></span>
            <span className="integration-progress"><i /></span>
          </button>
          <div className="user-card">
            <span className="user-avatar">RS</span>
            <span><strong>{role === "admin" ? "Rafael Santos" : role === "balcao" ? "Caixa Central" : role === "garcom" ? "Garçom" : "Cozinha"}</strong><small>{role === "admin" ? "Administrador" : role === "balcao" ? "Balconista" : role === "garcom" ? "Atendimento" : "Produção"}</small></span>
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
            <ThemeToggle />
            <label className="search-box">
              <span>⌕</span>
              <input ref={searchInputRef} aria-label="Buscar pedido ou cliente" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar pedido ou cliente..." />
              <kbd>⌘ K</kbd>
            </label>
            <div style={{ position: "relative" }}>
              <button className="round-button notification" type="button" aria-label="Notificações" onClick={() => setShowNotifications(v => !v)}>🔔{notifications.some(n => !n.read) && <i />}</button>
              {showNotifications && (
                <>
                  <button type="button" aria-label="Fechar notificações" style={{ position: "fixed", inset: 0, background: "transparent", border: 0, zIndex: 190, cursor: "default" }} onClick={() => setShowNotifications(false)} />
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, width: 340, padding: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 200 }}>
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: 14 }}>Notificações</strong>
                      <button type="button" onClick={() => setNotifications(n => n.map(x => ({ ...x, read: true })))} style={{ background: "transparent", border: 0, color: "var(--orange)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Marcar todas como lidas</button>
                    </div>
                    {notifications.map(n => (
                      <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: n.read ? "transparent" : "var(--purple-soft)", display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }} onClick={() => setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}>
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
            onAddOrder={addOrder}
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
            onAddTable={(area) => setTables(current => [...current, { number: current.length > 0 ? Math.max(...current.map(c => c.number)) + 1 : 1, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 50, y: 50, width: 104, height: 76, area }])}
            onRemoveTable={(num) => {
              setTables(current => current.filter(c => c.number !== num));
              if (selectedTable === num) setSelectedTable(tables.find(t2 => t2.number !== num)?.number ?? 1);
            }}
            onWaitersUpdate={setWaiters}
            onOpenReserve={openReserveModal}
            onOpenQr={(num) => setClientSimulatorTable(num)}
          />
        )}
        {activeView === "Cardápio" && <MenuView menuItems={menuItems} setMenuItems={setMenuItems} onNotify={notify} />}
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
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", background: "rgba(255,255,255,0.7)", borderRadius: "0 0 16px 16px", backdropFilter: "blur(10px)" }}>
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
                    {table.items.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "#999", fontSize: 10 }}>Nenhum item consumido.</div>}
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

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--purple-soft)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "10px 14px", marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Dividir conta</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" onClick={() => setSplitCount(Math.max(1, splitCount - 1))} style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--surface-hover)", border: 0, color: "var(--ink)", cursor: "pointer", fontSize: 16, display: "grid", placeItems: "center" }}>−</button>
                    <span style={{ fontWeight: 700, fontSize: 14, minWidth: 24, textAlign: "center" }}>{splitCount}x</span>
                    <button type="button" onClick={() => setSplitCount(splitCount + 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--surface-hover)", border: 0, color: "var(--ink)", cursor: "pointer", fontSize: 16, display: "grid", placeItems: "center" }}>+</button>
                  </div>
                  {splitCount > 1 && (
                    <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>{formatMoney((table.total * 1.1 - appliedDiscount) / splitCount)}/pessoa</span>
                  )}
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
                <input required placeholder="Ex: Família Silva" value={reserveData.name} onChange={e => setReserveData({ ...reserveData, name: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink)", outline: "none" }} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Horário</span>
                  <input required type="time" value={reserveData.time} onChange={e => setReserveData({ ...reserveData, time: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink)", outline: "none", colorScheme: "dark" }} />
                </label>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Pessoas</span>
                  <input required type="number" min="1" max="20" value={reserveData.guests} onChange={e => setReserveData({ ...reserveData, guests: parseInt(e.target.value) || 1 })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink)", outline: "none" }} />
                </label>
              </div>
              <button className="primary-button wide" type="button" onClick={confirmReservation}>Confirmar Reserva</button>
            </div>
          </section>
        </div>
      )}
      {clientSimulatorTable !== null && (
        <ClientMenuSimulator tableNum={clientSimulatorTable} onClose={() => setClientSimulatorTable(null)} menuItems={menuItems} onPlaceOrder={(items, total) => {
          const detail = items.map(i => `${i.quantity}x ${i.name}`).join(" • ");
          addOrder({ id: Math.floor(Math.random() * 9000) + 1000, customer: `Mesa ${String(clientSimulatorTable).padStart(2, "0")}`, channel: "Salão", detail, total, time: "agora", status: "Novo" });
          setClientSimulatorTable(null);
        }} />
      )}
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

        <section className="panel insights-panel" style={{ background: "var(--purple-soft)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <PanelHeader title="Insights da IA" subtitle="Análise em tempo real" action="Ver relatório" onAction={() => onView("Relatórios")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            <div style={{ padding: 12, background: "var(--surface-hover)", borderRadius: 8, borderLeft: "3px solid var(--orange)", fontSize: 13, lineHeight: 1.4 }}>
              🤖 <strong>Oportunidade:</strong> Vendas de massas estão 30% abaixo da média nesta quinta-feira. Recomendamos ativar uma promoção relâmpago.
            </div>
            <div style={{ padding: 12, background: "var(--surface-hover)", borderRadius: 8, borderLeft: "3px solid var(--green)", fontSize: 13, lineHeight: 1.4 }}>
              🤖 <strong>Atenção ao Salão:</strong> A Mesa 04 está há 1h40 sem pedir sobremesa. Boa hora para o garçom oferecer!
            </div>
            <div style={{ padding: 12, background: "var(--surface-hover)", borderRadius: 8, borderLeft: "3px solid var(--blue)", fontSize: 13, lineHeight: 1.4 }}>
              🤖 <strong>CRM:</strong> Camila Rocha pediu 14x, mas não pede há 2 semanas. Enviar cupom automático de saudade?
            </div>
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

function OrdersView({ orders, filter, onFilter, onAdvance, onOpenFee, onNotify, onAddOrder }: { orders: Order[]; filter: string; onFilter: (filter: string) => void; onAdvance: (id: number) => void; onOpenFee: () => void; onNotify: (message: string) => void; onAddOrder?: (order: Order) => void }) {
  const columns: OrderStatus[] = ["Novo", "Confirmado", "Em preparo", "Pronto", "Saiu"];
  const [localNewOrderModal, setLocalNewOrderModal] = useState(false);
  const [localNewOrder, setLocalNewOrder] = useState<{ customer: string; channel: "WhatsApp" | "Site" | "Salão"; detail: string; total: string }>({ customer: "", channel: "WhatsApp", detail: "", total: "" });

  const handleCreateOrder = () => {
    if (!localNewOrder.customer.trim() || !localNewOrder.detail.trim()) { onNotify("Preencha o nome e os itens do pedido."); return; }
    onAddOrder?.({
      id: Math.floor(Math.random() * 9000) + 1000,
      customer: localNewOrder.customer,
      channel: localNewOrder.channel,
      detail: localNewOrder.detail,
      total: parseFloat(localNewOrder.total.replace(",", ".")) || 0,
      time: "agora",
      status: "Novo",
    });
    setLocalNewOrderModal(false);
    setLocalNewOrder({ customer: "", channel: "WhatsApp", detail: "", total: "" });
  };

  return (
    <div className="page-content">
      <div className="section-toolbar">
        <div className="filter-tabs">{["Todos", "WhatsApp", "Site", "Salão"].map((item) => <button type="button" className={filter === item ? "active" : ""} key={item} onClick={() => onFilter(item)}>{item}{item !== "Todos" && <small>{initialOrders.filter((order) => order.channel === item).length}</small>}</button>)}</div>
        <button className="primary-button" type="button" onClick={() => setLocalNewOrderModal(true)}>+ Novo pedido</button>
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

      {localNewOrderModal && (
        <div className="modal-backdrop">
          <button className="modal-scrim" type="button" aria-label="Fechar" onClick={() => setLocalNewOrderModal(false)} />
          <section className="fee-modal" role="dialog" aria-modal="true" aria-labelledby="new-order-title">
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setLocalNewOrderModal(false)}>×</button>
            <span className="modal-icon">📋</span>
            <p className="eyebrow orange">PEDIDOS</p>
            <h2 id="new-order-title">Novo Pedido</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Nome do cliente</span>
                <input required placeholder="Ex: João Silva" value={localNewOrder.customer} onChange={e => setLocalNewOrder({ ...localNewOrder, customer: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
              </label>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Canal</span>
                <select value={localNewOrder.channel} onChange={e => setLocalNewOrder({ ...localNewOrder, channel: e.target.value as "WhatsApp" | "Site" | "Salão" })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }}>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Site">Site</option>
                  <option value="Salão">Salão</option>
                </select>
              </label>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Itens do pedido</span>
                <input required placeholder="Ex: 2 pizzas • 1 refrigerante" value={localNewOrder.detail} onChange={e => setLocalNewOrder({ ...localNewOrder, detail: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
              </label>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Total estimado (R$)</span>
                <input type="number" step="0.01" min="0" placeholder="0,00" value={localNewOrder.total} onChange={e => setLocalNewOrder({ ...localNewOrder, total: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
              </label>
              <button className="primary-button wide" type="button" onClick={handleCreateOrder}>Criar Pedido</button>
            </div>
          </section>
        </div>
      )}
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

function DiningView({ tables, waiters, selected, onSelect, onAddItem, onClose, onNotify, onUpdateTable, onAddTable, onRemoveTable, onWaitersUpdate, onOpenReserve, onOpenQr }: { tables: Table[]; waiters: Waiter[]; selected: Table; onSelect: (number: number) => void; onAddItem: () => void; onClose: () => void; onNotify: (message: string) => void; onUpdateTable: (t: Table) => void; onAddTable: (area: "salao" | "varanda") => void; onRemoveTable: (num: number) => void; onWaitersUpdate: (w: Waiter[]) => void; onOpenReserve: (tableNum: number) => void; onOpenQr: (tableNum: number) => void }) {
  const [activeArea, setActiveArea] = useState("Salão principal");
  const [isEditingMap, setIsEditingMap] = useState(false);
  const [draggingTable, setDraggingTable] = useState<number | null>(null);
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [editingTableNumber, setEditingTableNumber] = useState<number | null>(null);
  const [assignWaiterTable, setAssignWaiterTable] = useState<number | null>(null);
  const [newWaiterName, setNewWaiterName] = useState("");
  const [newWaiterColor, setNewWaiterColor] = useState("purple");

  const currentAreaKey = activeArea === "Varanda" ? "varanda" : "salao";
  const floorTables = tables.filter(t => (t.area || "salao") === currentAreaKey);

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
    const table = floorTables.find(t => t.number === draggingTable);
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
                <button className="ghost-button" type="button" onClick={() => { playSound('pop'); onAddTable(currentAreaKey); }}>+ Nova Mesa</button>
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
        <div className="floor-info"><span><strong>{floorTables.filter((table) => table.status === "Livre").length}</strong> livres</span><span><strong>{floorTables.filter((table) => table.status === "Ocupada").length}</strong> ocupadas</span><span><strong>{floorTables.filter((table) => table.status === "Conta").length}</strong> pediu conta</span><span><strong>{floorTables.filter((table) => table.status === "Reservada").length}</strong> reservadas</span></div>
        <div className={`floor-map ${isEditingMap ? "editing" : ""}`} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
          <div className="bar-counter">BAR / BALCÃO</div>
          {floorTables.map((table) => {
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
                {table.status === "Reservada" && table.reservedFor && !isEditingMap && <b style={{ fontSize: 9, color: "var(--purple)", display: "block", marginTop: 2 }}>{table.reservedFor}</b>}
                {table.guests > 0 && <b>{table.guests} pessoas</b>}
                {isEditingMap && <div className="edit-overlay" style={{ position: "absolute", inset: 0, background: "var(--orange-soft)", borderRadius: "inherit", zIndex: 20, display: "grid", placeItems: "center", opacity: draggingTable === table.number ? 1 : 0.4 }}><span style={{ color: "var(--ink)", fontSize: "16px" }}>{draggingTable === table.number ? "✋" : "✏️"}</span></div>}
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
                <button key={w.id} type="button" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "8px", background: "transparent", border: "0", cursor: "pointer", borderRadius: "6px", textAlign: "left", color: "var(--ink)" }} onClick={() => { onUpdateTable({ ...selected, waiterId: w.id }); setAssignWaiterTable(null); onNotify(`${w.name} atribuído à Mesa ${selected.number}`); }}>
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
        {selected.status === "Livre" && (
          <button type="button" className="ghost-button wide" style={{ margin: "0 24px 12px", width: "calc(100% - 48px)" }} onClick={() => onOpenReserve(selected.number)}>📅 Reservar Esta Mesa</button>
        )}
        <div className="check-total"><span><small>Subtotal</small><strong>{formatMoney(selected.total)}</strong></span><span><small>Serviço (10%)</small><strong>{formatMoney(selected.total * 0.1)}</strong></span><div><span>Total da mesa</span><strong>{formatMoney(selected.total * 1.1)}</strong></div></div>
        <div className="check-actions">
          <button className="ghost-button" type="button" onClick={() => onOpenQr(selected.number)}>📱 QR da Mesa</button>
          <button className="primary-button" type="button" disabled={selected.total === 0} onClick={() => { playSound('pop'); onClose(); }}>Cobrar</button>
        </div>
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
                  <div key={w.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--surface)", padding: "10px", borderRadius: "8px" }}>
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
                    <button type="button" className="ghost-button wide" style={{ color: "var(--orange)", borderColor: "var(--orange-soft)", marginTop: "10px" }} onClick={() => { onRemoveTable(t.number); setEditingTableNumber(null); onNotify("Mesa removida com sucesso."); }}>Apagar Mesa</button>
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

function MenuView({ menuItems, setMenuItems, onNotify }: { menuItems: MenuItem[]; setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>; onNotify: (message: string) => void }) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({ category: "Pizzas", available: true });

  const filteredItems = activeCategory === "Todos" ? menuItems : menuItems.filter(i => i.category === activeCategory);
  const categories = [
    { name: "Todos", icon: "📋" },
    { name: "Pizzas", icon: "🍕" },
    { name: "Pratos", icon: "🍝" },
    { name: "Massas", icon: "🍜" },
    { name: "Sobremesas", icon: "🍰" },
    { name: "Bebidas", icon: "🥤" },
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    const item: MenuItem = {
      name: newItem.name,
      category: newItem.category || "Pizzas",
      price: Number(newItem.price),
      sold: 0,
      available: newItem.available ?? true,
    };
    setMenuItems([item, ...menuItems]);
    setModalOpen(false);
    setNewItem({ category: "Pizzas", available: true });
    onNotify(`${item.name} adicionado ao cardápio com sucesso!`);
  };

  const toggleAvailability = (name: string) => {
    setMenuItems(current => current.map(item => item.name === name ? { ...item, available: !item.available } : item));
  };

  return (
    <div className="page-content">
      <div className="section-toolbar">
        <div className="filter-tabs">
          {categories.map(c => (
            <button key={c.name} className={activeCategory === c.name ? "active" : ""} type="button" onClick={() => setActiveCategory(c.name)}>{c.icon} {c.name}</button>
          ))}
        </div>
        <button className="primary-button" type="button" onClick={() => setModalOpen(true)}>+ Novo item</button>
      </div>
      <section className="panel menu-table-panel">
        <div className="menu-table-heading"><span>ITEM</span><span>CATEGORIA</span><span>PREÇO</span><span>VENDAS HOJE</span><span>DISPONÍVEL</span><span /></div>
        {filteredItems.map((item, index) => (
          <div className="menu-table-row" key={item.name}>
            <span className={`food-thumb food-${(index % 6) + 1}`}>{item.name.slice(0, 1)}</span>
            <span><strong>{item.name}</strong><small>Sincronizado no site e WhatsApp</small></span>
            <span>{item.category}</span>
            <strong>{formatMoney(item.price)}</strong>
            <span>{item.sold} unidades</span>
            <Toggle enabled={item.available} onToggle={() => toggleAvailability(item.name)} />
            <button type="button" onClick={() => onNotify(`Opções de: ${item.name}`)}>•••</button>
          </div>
        ))}
      </section>

      {modalOpen && (
        <div className="modal-backdrop">
          <button className="modal-scrim" type="button" aria-label="Fechar" onClick={() => setModalOpen(false)} />
          <section className="fee-modal" role="dialog" aria-modal="true" style={{ width: "100%", maxWidth: 400 }}>
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setModalOpen(false)}>×</button>
            <p className="eyebrow orange">CARDÁPIO</p>
            <h2>Novo Prato</h2>
            <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24, textAlign: "left" }}>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Nome do Prato</span>
                <input required placeholder="Ex: Pizza Quatro Queijos" value={newItem.name || ""} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Categoria</span>
                  <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }}>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Pratos">Pratos</option>
                    <option value="Massas">Massas</option>
                    <option value="Sobremesas">Sobremesas</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </label>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Preço (R$)</span>
                  <input required type="number" step="0.01" min="0" placeholder="0.00" value={newItem.price || ""} onChange={e => setNewItem({ ...newItem, price: e.target.value as any })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
                </label>
              </div>
              <label className="fee-field" style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                <input type="checkbox" checked={newItem.available} onChange={e => setNewItem({ ...newItem, available: e.target.checked })} />
                <span style={{ fontSize: "14px", color: "var(--ink)" }}>Disponível imediatamente</span>
              </label>
              <button className="primary-button wide" type="submit" style={{ marginTop: 8 }}>Adicionar ao Cardápio</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

const CITIES = [
  { name: "Guaratinguetá, SP", lat: -22.8167, lng: -45.1925 },
  { name: "São Paulo, SP", lat: -23.5505, lng: -46.6333 },
  { name: "Rio de Janeiro, RJ", lat: -22.9068, lng: -43.1729 },
  { name: "Curitiba, PR", lat: -25.4284, lng: -49.2733 },
];

function TelemetryMap() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let mounted = true;
    import('leaflet').then((LModule) => {
      if (!mounted) return;
      const L = LModule.default || LModule;

      if (!leafletMapRef.current) {
        if (!mapRef.current) return;
        // Initialize map
        leafletMapRef.current = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([selectedCity.lat, selectedCity.lng], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(leafletMapRef.current);
      } else {
        leafletMapRef.current.setView([selectedCity.lat, selectedCity.lng], 13);
      }

      const map = leafletMapRef.current;

      // Clear existing layers (except tileLayer)
      map.eachLayer((layer: any) => {
        if (!layer._url) map.removeLayer(layer);
      });

      // Draw Range Rings (2km, 5km, 8km)
      [2000, 5000, 8000].forEach(radius => {
        L.circle([selectedCity.lat, selectedCity.lng], {
          radius,
          color: 'var(--purple)',
          weight: 1.5,
          fill: false,
          dashArray: '4 6',
          opacity: 0.4
        }).addTo(map);
      });

      const offsets = [
        { latOff: 0, lngOff: 0, intensity: 1, type: "center" },
        { latOff: 0.01, lngOff: 0.02, intensity: 0.8, type: "hotspot" },
        { latOff: -0.015, lngOff: -0.01, intensity: 0.6, type: "hotspot" },
        { latOff: 0.02, lngOff: -0.015, intensity: 1.2, type: "hotspot" },
        { latOff: -0.005, lngOff: 0.03, intensity: 0.5, type: "hotspot" },
        { latOff: 0.005, lngOff: -0.025, intensity: 0.7, type: "hotspot" },
        { latOff: -0.02, lngOff: 0.01, intensity: 0.4, type: "hotspot" },
        { latOff: 0.015, lngOff: 0.005, intensity: 0.6, type: "hotspot" },
        { latOff: 0.012, lngOff: 0.015, intensity: 1, type: "active", driver: "Carlos M.", eta: "8 min" },
        { latOff: -0.008, lngOff: -0.012, intensity: 1, type: "active", driver: "Diego R.", eta: "18 min" },
        { latOff: -0.018, lngOff: 0.022, intensity: 1, type: "active", driver: "André L.", eta: "24 min" },
      ];

      offsets.forEach((pt, i) => {
        let html = '';
        if (pt.type === "center") {
          html = `<div style="position:relative; width:0; height:0;">
            <svg viewBox="0 0 100 100" width="800" height="800" style="position:absolute; top:-400px; left:-400px; pointer-events:none;">
              <g class="radar-sweep-container" style="transform-origin: 50% 50%">
                <path d="M50 50 L50 5 A45 45 0 0 1 95 50 Z" fill="var(--purple)" opacity="0.15" />
              </g>
            </svg>
            <svg viewBox="0 0 100 100" width="40" height="40" style="position:absolute; top:-20px; left:-20px;">
              <circle cx="50" cy="50" r="15" fill="var(--purple)" opacity="0.4" class="pulse-slow" />
              <circle cx="50" cy="50" r="6" fill="var(--purple)" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="var(--purple)" stroke-width="1.5" class="ping" />
            </svg>
          </div>`;
        } else if (pt.type === "hotspot") {
          const size = pt.intensity * 80;
          html = `<div style="position:relative; width:0; height:0;">
            <svg viewBox="0 0 100 100" width="${size}" height="${size}" style="position:absolute; top:-${size / 2}px; left:-${size / 2}px; mix-blend-mode: screen; filter: blur(4px);">
              <defs>
                <radialGradient id="heat-${i}" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--orange)" stopOpacity="0.8" />
                  <stop offset="30%" stopColor="var(--orange)" stopOpacity="0.5" />
                  <stop offset="70%" stopColor="rgba(255,100,0,0.2)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="rgba(255,0,0,0)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="50" fill="url(#heat-${i})" class="pulse-random" style="animation-delay: ${(i % 5) * 0.5}s" />
            </svg>
          </div>`;
        } else if (pt.type === "active") {
          html = `<div style="position:relative; width:0; height:0; cursor:pointer;" class="active-delivery-marker">
            <svg viewBox="0 0 100 100" width="48" height="48" style="position:absolute; top:-24px; left:-24px;">
              <defs>
                <filter id="glow-${i}">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="50" cy="50" r="15" fill="var(--green)" opacity="0.2" class="pulse-fast" />
              <circle cx="50" cy="50" r="8" fill="var(--panel)" stroke="var(--green)" stroke-width="2.5" filter="url(#glow-${i})" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="var(--green)" stroke-width="1" class="ping" style="animation-delay: ${(i % 3) * 0.3}s" />
              <circle cx="50" cy="50" r="3" fill="var(--green)" />
            </svg>
            <div class="delivery-tooltip" style="position:absolute; top:-38px; left:50%; transform:translateX(-50%); background:var(--panel); border:1px solid rgba(0, 230, 118, 0.4); color:var(--ink); padding:4px 8px; border-radius:6px; font-size:11px; font-weight:600; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.5); display:flex; align-items:center; gap:6px;">
              <span style="display:flex; align-items:center; justify-content:center; background:var(--green); color:var(--panel); width:16px; height:16px; border-radius:50%; font-size:10px;">🛵</span>
              <div style="display:flex; flex-direction:column; line-height:1.2;">
                <span>${pt.driver}</span>
                <span style="color:var(--green); font-size:9px;">${pt.eta}</span>
              </div>
            </div>
          </div>`;
        }

        const icon = L.divIcon({
          html,
          className: 'custom-leaflet-icon',
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        L.marker([selectedCity.lat + pt.latOff, selectedCity.lng + pt.lngOff], { icon }).addTo(map);
      });

    });

    return () => { mounted = false; };
  }, [selectedCity]);

  return (
    <div className="telemetry-map-container panel">
      <div className="telemetry-header">
        <div className="telemetry-title">
          <span className="live-indicator"></span>
          <div>
            <strong>Telemetria & Alcance</strong>
            <small>Mapa de calor de entregas e entregadores ativos</small>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select
            className="city-select"
            value={selectedCity.name}
            onChange={(e) => {
              const city = CITIES.find(c => c.name === e.target.value);
              if (city) setSelectedCity(city);
            }}
          >
            {CITIES.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
          <div className="telemetry-legend">
            <span><span className="legend-dot hotspot"></span> Alta demanda</span>
            <span><span className="legend-dot active"></span> Em rota</span>
          </div>
        </div>
      </div>
      <div className="telemetry-map">
        <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#0a0a0f' }}></div>
      </div>
    </div>
  );
}

function DeliveryView({ pendingFee, onOpenFee, onNotify }: { pendingFee?: Order; onOpenFee: () => void; onNotify: (message: string) => void }) {
  const [routesConnected, setRoutesConnected] = useState(false);
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="page-content">
      {pendingFee && <section className="attention-banner"><span className="attention-icon">!</span><div><strong>1 pedido precisa da taxa de entrega</strong><p>Revise a distância e confirme o valor antes de enviar para a cozinha.</p></div><button type="button" onClick={onOpenFee}>Resolver agora <span>→</span></button></section>}

      {showMap && <TelemetryMap />}

      <div className="delivery-grid">
        <section className="panel live-deliveries">
          <PanelHeader
            title="Entregas em andamento"
            subtitle="3 entregadores em rota"
            action={showMap ? "Ocultar mapa" : "Ver mapa"}
            onAction={() => setShowMap(!showMap)}
          />
          {[{ id: 1047, name: "Ana Luiza", driver: "Carlos M.", eta: "8 min", progress: 78 }, { id: 1046, name: "Camila Rocha", driver: "Diego R.", eta: "18 min", progress: 54 }, { id: 1043, name: "Paulo Nunes", driver: "André L.", eta: "24 min", progress: 31 }].map((delivery) => <article className="delivery-row" key={delivery.id}><span className="driver-avatar">➜</span><span><strong>#{delivery.id} • {delivery.name}</strong><small>{delivery.driver} • a caminho</small><i><b style={{ width: `${delivery.progress}%` }} /></i></span><span><small>Previsão</small><strong>{delivery.eta}</strong></span></article>)}
        </section>
        <section className="panel delivery-rules"><PanelHeader title="Regras de entrega" subtitle="Valores usados pela IA e pelo site" action="Editar" onAction={() => onNotify("Configurações de entrega abertas.")} />
          {[{ range: "Até 2 km", fee: 6.9, time: "20–30 min" }, { range: "2 a 5 km", fee: 9.9, time: "30–40 min" }, { range: "5 a 8 km", fee: 14.9, time: "40–55 min" }].map((rule) => <div className="rule-row" key={rule.range}><span className="rule-pin">⌖</span><span><strong>{rule.range}</strong><small>{rule.time}</small></span><strong>{formatMoney(rule.fee)}</strong></div>)}
          <div className="auto-rate"><span>✦</span><div><strong>{routesConnected ? "Rotas Conectadas" : "Cálculo automático disponível"}</strong><p>{routesConnected ? "As taxas estão sendo calculadas automaticamente via integração." : "Conecte a geolocalização do site para sugerir a taxa pela distância."}</p></div><button type="button" onClick={() => { setRoutesConnected(true); onNotify(routesConnected ? "Rotas sincronizadas com sucesso." : "Integração de rotas ativada!"); }}>{routesConnected ? "Sincronizar" : "Conectar"}</button></div>
        </section>
      </div>
    </div>
  );
}

type Expense = {
  id: string;
  description: string;
  category: "Ingredientes" | "Funcionários" | "Contas" | "Manutenção" | "Outros";
  date: string;
  amount: number;
  status: "Pago" | "Pendente";
};

const initialExpenses: Expense[] = [
  { id: "e1", description: "Hortifruti da Semana", category: "Ingredientes", date: "08/08", amount: 1240.50, status: "Pago" },
  { id: "e2", description: "Conta de Luz", category: "Contas", date: "10/08", amount: 890.00, status: "Pendente" },
  { id: "e3", description: "Conserto Geladeira", category: "Manutenção", date: "05/08", amount: 450.00, status: "Pago" },
  { id: "e4", description: "Pagamento Garçons", category: "Funcionários", date: "05/08", amount: 3200.00, status: "Pago" },
];

function ReportsView() {
  const bars = [38, 44, 52, 46, 68, 74, 82, 58, 63, 71, 88, 76];

  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [expenseModal, setExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ category: "Ingredientes", status: "Pago" });

  const totalRevenue = 86420;
  const baseExpenses = 32540;
  const currentTotalExpenses = baseExpenses + expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netIncome = totalRevenue - currentTotalExpenses;

  const expenseBreakdown = {
    "Ingredientes": 12540 + expenses.filter(e => e.category === "Ingredientes").reduce((acc, e) => acc + e.amount, 0),
    "Funcionários": 15000 + expenses.filter(e => e.category === "Funcionários").reduce((acc, e) => acc + e.amount, 0),
    "Contas Fixas": 3500 + expenses.filter(e => e.category === "Contas").reduce((acc, e) => acc + e.amount, 0),
    "Manutenção": 500 + expenses.filter(e => e.category === "Manutenção").reduce((acc, e) => acc + e.amount, 0),
    "Outros": 1000 + expenses.filter(e => e.category === "Outros").reduce((acc, e) => acc + e.amount, 0),
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.date) return;
    const exp: Expense = {
      id: Math.random().toString(),
      description: newExpense.description,
      category: newExpense.category as Expense["category"],
      date: newExpense.date,
      amount: Number(newExpense.amount),
      status: newExpense.status as Expense["status"],
    };
    setExpenses([exp, ...expenses]);
    setExpenseModal(false);
    setNewExpense({ category: "Ingredientes", status: "Pago" });
  };

  return (
    <div className="page-content reports-page">
      <div className="crm-header-section" style={{ padding: "0 0 24px" }}>
        <div className="crm-header-titles">
          <h1>Relatórios & <span>Financeiro</span></h1>
          <p>Visão geral de faturamento, canais de venda e controle de fluxo de caixa.</p>
        </div>
        <div className="crm-header-actions">
          <button className="ghost-button"><Icon name="relatorios" /> Exportar Relatório</button>
          <button className="primary-button" onClick={() => setExpenseModal(true)}><Icon name="pedidos" /> Lançar Despesa</button>
        </div>
      </div>

      <section className="metric-grid">
        <Metric title="Faturamento no mês" value={formatMoney(totalRevenue)} note="18,4% acima de julho" color="purple" icon="🛍️" path="M0,25 Q10,15 20,22 T40,20 T60,28 T80,24 T100,10" />
        <Metric title="Despesas (Saídas)" value={formatMoney(currentTotalExpenses)} note="4,2% abaixo de julho" color="orange" icon="📉" path="M0,28 Q15,28 30,20 T60,25 T90,20 T100,22" />
        <Metric title="Saldo Líquido" value={formatMoney(netIncome)} note="Margem de 60,3%" color="green" icon="💰" path="M0,20 Q20,30 40,15 T80,25 T100,20" />
        <Metric title="Ticket médio" value="R$ 78,40" note="R$ 6,20 acima da meta" color="blue" icon="↗" path="M0,20 Q20,10 40,25 T70,15 T100,20" />
      </section>

      <div className="reports-grid">
        <section className="panel" style={{ padding: 24, gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 16 }}>
          <PanelHeader title="Faturamento Mensal" subtitle="Histórico de vendas dos últimos 12 meses" />
          <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 8, marginTop: 16, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
            {bars.map((bar, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", background: "var(--purple)", borderRadius: "4px 4px 0 0", height: `${bar}%`, minHeight: 4, transition: "height 0.3s ease", opacity: i === 11 ? 1 : 0.6 }} />
                <span style={{ fontSize: 10, color: "var(--muted)" }}>{["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][i]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <PanelHeader title="Detalhamento de Gastos" subtitle="Distribuição por categoria" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(expenseBreakdown).map(([category, amount]) => {
              const percentage = Math.round((amount / currentTotalExpenses) * 100);
              return (
                <div key={category} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--ink)" }}>
                    <span>{category}</span>
                    <strong style={{ color: "var(--orange)" }}>{formatMoney(amount)} ({percentage}%)</strong>
                  </div>
                  <div style={{ height: 6, background: "var(--surface)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percentage}%`, background: "var(--orange)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <PanelHeader title="Demonstrativo de Lucro" subtitle="Resultado Líquido do Período" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
              <span style={{ color: "var(--muted)" }}>Faturamento Bruto</span>
              <strong style={{ color: "var(--green)" }}>{formatMoney(totalRevenue)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
              <span style={{ color: "var(--muted)" }}>Custos e Despesas</span>
              <strong style={{ color: "var(--orange)" }}>- {formatMoney(currentTotalExpenses)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>Lucro Líquido Real</span>
              <strong style={{ color: netIncome > 0 ? "var(--green)" : "var(--orange)", fontSize: "18px" }}>
                {formatMoney(netIncome)}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
              <span style={{ color: "var(--muted)", fontSize: "11px" }}>Margem de Lucro</span>
              <strong style={{ color: "var(--ink)", fontSize: "11px" }}>{((netIncome / totalRevenue) * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="spreadsheet-container" style={{ marginTop: 24 }}>
        <div className="spreadsheet-toolbar" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 16 }}>
          <PanelHeader title="Controle de Despesas" subtitle="Últimos lançamentos de fluxo de caixa" />
        </div>
        <div className="spreadsheet-table-wrapper">
          <table className="spreadsheet-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} className="spreadsheet-row">
                  <td><strong>{exp.description}</strong></td>
                  <td>
                    <span className={`crm-badge ${exp.category === "Ingredientes" ? "recurrent" :
                        exp.category === "Funcionários" ? "vip" :
                          exp.category === "Contas" ? "risk" : "new"
                      }`}>{exp.category}</span>
                  </td>
                  <td className="client-date">{exp.date}</td>
                  <td className="client-money" style={{ color: "var(--orange)" }}>- {formatMoney(exp.amount)}</td>
                  <td>
                    <span className={`crm-badge ${exp.status === "Pago" ? "new" : "risk"}`}>{exp.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {expenseModal && (
        <div className="modal-backdrop">
          <button className="modal-scrim" type="button" aria-label="Fechar" onClick={() => setExpenseModal(false)} />
          <section className="fee-modal" role="dialog" aria-modal="true" style={{ width: "100%", maxWidth: 480 }}>
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setExpenseModal(false)}>×</button>
            <p className="eyebrow orange">FLUXO DE CAIXA</p>
            <h2>Lançar Nova Despesa</h2>
            <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24, textAlign: "left" }}>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Descrição da Despesa</span>
                <input required placeholder="Ex: Compra de Hortifruti" value={newExpense.description || ""} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Categoria</span>
                  <select value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value as any })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }}>
                    <option value="Ingredientes">Ingredientes</option>
                    <option value="Funcionários">Funcionários</option>
                    <option value="Contas">Contas Fixas</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Outros">Outros</option>
                  </select>
                </label>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Data</span>
                  <input required type="date" value={newExpense.date || ""} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none", colorScheme: "dark" }} />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Valor (R$)</span>
                  <input required type="number" step="0.01" min="0" placeholder="0.00" value={newExpense.amount || ""} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value as any })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
                </label>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Status</span>
                  <select value={newExpense.status} onChange={e => setNewExpense({ ...newExpense, status: e.target.value as any })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }}>
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </label>
              </div>

              <button className="primary-button wide" type="submit" style={{ marginTop: 8 }}>Registrar Despesa</button>
            </form>
          </section>
        </div>
      )}
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
  const [searchCrm, setSearchCrm] = useState("");
  const [filterSegment, setFilterSegment] = useState("Todos os Segmentos");

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

  const filteredCrm = crmData.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchCrm.toLowerCase()) || client.phone.includes(searchCrm);
    const matchesSegment = filterSegment === "Todos os Segmentos" || client.segment === filterSegment;
    return matchesSearch && matchesSegment;
  });

  const toggleClient = (id: string) => {
    setSelectedClients(prev => prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedClients.length === filteredCrm.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredCrm.map(c => c.id));
    }
  };

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
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
            <input type="text" placeholder="Buscar cliente por nome ou telefone..." value={searchCrm} onChange={e => setSearchCrm(e.target.value)} />
            <kbd>⌘K</kbd>
          </div>
          <div className="spreadsheet-filters">
            <select value={filterSegment} onChange={e => setFilterSegment(e.target.value)}>
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
              {filteredCrm.length > 0 ? filteredCrm.map(client => (
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
            <h3 style={{ margin: "8px 0 4px", fontSize: "14px", color: "var(--ink)" }}>iFood</h3>
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
            <h3 style={{ margin: "8px 0 4px", fontSize: "14px", color: "var(--ink)" }}>WhatsApp Business API</h3>
            <p style={{ margin: "0", fontSize: "11px", color: "var(--muted)", lineHeight: 1.4 }}>Automação de chat, botões de ação e inteligência artificial para pedidos.</p>
          </div>
          <button className="ghost-button" style={{ marginTop: "auto", width: "100%" }}>Desconectar</button>
        </div>

        <div className="integration-card" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", opacity: 0.7 }}>
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

function KdsView({ orders, onAdvance, onExit }: { orders: Order[], onAdvance: (id: number) => void, onExit: () => void }) {
  const pendingOrders = orders.filter(o => o.status === "Novo" || o.status === "Confirmado" || o.status === "Em preparo");
  return (
    <div className="kds-layout">
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--orange)" }}>Monitor de Cozinha (KDS)</h1>
        <button className="ghost-button" type="button" onClick={onExit} style={{ background: "var(--surface-hover)", border: 0, color: "var(--ink)", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>← Voltar ao Sistema</button>
      </header>
      <div className="kds-grid">
        {pendingOrders.length === 0 && <p style={{ color: "#666" }}>Nenhum pedido na fila.</p>}
        {pendingOrders.map(order => (
          <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, borderBottom: "1px solid #333", paddingBottom: 12 }}>
              <strong style={{ fontSize: 18 }}>#{order.id}</strong>
              <span style={{ fontSize: 14, color: order.status === "Em preparo" ? "var(--green)" : "var(--orange)", fontWeight: 600 }}>{order.status}</span>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 16, lineHeight: 1.5 }}>{order.detail.split(' • ').map((str, i) => <span key={i} style={{ display: "block", marginBottom: 4 }}>{str}</span>)}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", borderTop: "1px solid #333", paddingTop: 12 }}>
              <span style={{ fontSize: 12, color: "#999" }}>{order.time}</span>
              <button className="primary-button" style={{ padding: "8px 16px", background: "var(--green)" }} onClick={() => onAdvance(order.id)}>Item Pronto ✓</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientMenuSimulator({ tableNum, onClose, menuItems, onPlaceOrder }: { tableNum: number, onClose: () => void, menuItems: MenuItem[], onPlaceOrder: (items: any[], total: number) => void }) {
  const [cart, setCart] = useState<{ name: string, quantity: number, price: number }[]>([]);
  return (
    <div className="waiter-backdrop">
      <div className="waiter-frame">
        <header style={{ background: "var(--orange)", padding: "16px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: 32 }} />
          <div>
            <h2 style={{ color: "var(--ink)", margin: 0, fontSize: 18 }}>Mesa {tableNum}</h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Autoatendimento</p>
          </div>
          <button style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface-hover)", border: 0, color: "var(--ink)", fontWeight: 700, fontSize: 18, cursor: "pointer", display: "grid", placeItems: "center" }} onClick={onClose}>×</button>
        </header>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {menuItems.map(item => (
            <div key={item.name} style={{ background: "#222", padding: 16, borderRadius: 12, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ color: "var(--ink)", display: "block", fontSize: 14 }}>{item.name}</strong>
                <span style={{ color: "var(--orange)", fontSize: 14, fontWeight: 700 }}>{formatMoney(item.price)}</span>
              </div>
              <button style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--purple)", border: 0, color: "white", fontWeight: 700, cursor: "pointer", display: "grid", placeItems: "center" }} onClick={() => {
                const ex = cart.find(c => c.name === item.name);
                if (ex) setCart(cart.map(c => c.name === item.name ? { ...c, quantity: c.quantity + 1 } : c));
                else setCart([...cart, { name: item.name, price: item.price, quantity: 1 }]);
              }}>+</button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: 20, background: "#222", borderTop: "1px solid #333" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, color: "var(--ink)" }}>
              <span style={{ fontSize: 14 }}>Total do pedido:</span>
              <strong style={{ fontSize: 16 }}>{formatMoney(cart.reduce((a, b) => a + b.price * b.quantity, 0))}</strong>
            </div>
            <button style={{ width: "100%", padding: 16, background: "var(--green)", border: 0, borderRadius: 12, color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer" }} onClick={() => onPlaceOrder(cart, cart.reduce((a, b) => a + b.price * b.quantity, 0))}>Enviar Pedido para Cozinha</button>
          </div>
        )}
      </div>
    </div>
  );
}

function WaiterView({
  tables,
  menuItems,
  onExit,
  onAddItems
}: {
  tables: Table[];
  menuItems: MenuItem[];
  onExit: () => void;
  onAddItems: (tableNum: number, items: { name: string, price: number, quantity: number }[]) => void;
}) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cart, setCart] = useState<{ name: string, price: number, quantity: number }[]>([]);

  const addToCart = (item: MenuItem) => {
    setCart(current => {
      const exists = current.find(i => i.name === item.name);
      if (exists) {
        return current.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...current, { name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (name: string) => {
    setCart(current => current.map(i => i.name === name ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));
  };

  const tableObj = selectedTable ? tables.find(t => t.number === selectedTable) : null;
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="waiter-backdrop">
      {/* Mobile Frame Simulation */}
      <div className="waiter-frame">

        {/* Mobile Header */}
        <div style={{ padding: "20px 20px 10px", background: "var(--panel)", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
          {selectedTable ? (
            <button onClick={() => { setSelectedTable(null); setCart([]); }} style={{ background: "transparent", border: 0, color: "var(--blue)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <span>←</span> Voltar
            </button>
          ) : (
            <div style={{ color: "var(--ink)", fontSize: 18, fontWeight: 600 }}>Atendimento</div>
          )}
          <button onClick={onExit} style={{ background: "transparent", border: 0, color: "var(--red)", fontSize: 14, cursor: "pointer" }}>Sair</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {!selectedTable ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {tables.map(t => (
                <button
                  key={t.number}
                  onClick={() => setSelectedTable(t.number)}
                  style={{
                    background: t.status === "Ocupada" ? "var(--purple-soft)" : "var(--panel)",
                    border: `1px solid ${t.status === "Ocupada" ? "var(--purple)" : "var(--line)"}`,
                    borderRadius: 12,
                    padding: 16,
                    textAlign: "center",
                    cursor: "pointer",
                    color: "var(--ink)"
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 700 }}>Mesa {String(t.number).padStart(2, '0')}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{t.status}</div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              {tableObj && tableObj.items && tableObj.items.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 16, color: "var(--muted)", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>Conta Parcial</div>
                  <div style={{ background: "var(--purple-soft)", borderRadius: 12, padding: 16, border: "1px solid var(--purple)" }}>
                    {tableObj.items.map((it, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "var(--ink)", fontSize: 14 }}>
                        <span>{it.quantity}x {it.name}</span>
                        <span>R$ {(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed rgba(255,255,255,0.2)", display: "flex", justifyContent: "space-between", color: "var(--orange)", fontWeight: 700 }}>
                      <span>Subtotal</span>
                      <span>R$ {tableObj.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ fontSize: 20, color: "var(--ink)", fontWeight: 600, marginBottom: 16 }}>Cardápio</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {menuItems.map(item => (
                  <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--panel)", padding: 12, borderRadius: 8, border: "1px solid var(--line)" }}>
                    <div>
                      <div style={{ color: "var(--ink)", fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                      <div style={{ color: "var(--purple)", fontSize: 13 }}>R$ {item.price.toFixed(2)}</div>
                    </div>
                    <button onClick={() => addToCart(item)} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--purple-soft)", color: "var(--purple)", border: 0, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Footer / Cart */}
        {selectedTable && (
          <div style={{ padding: 20, background: "var(--panel)", borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--ink)" }}>
              <span style={{ fontSize: 14 }}>Itens ({cart.reduce((acc, c) => acc + c.quantity, 0)})</span>
              <strong style={{ fontSize: 18 }}>R$ {cartTotal.toFixed(2)}</strong>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => {
                  onAddItems(selectedTable, cart);
                  setSelectedTable(null);
                  setCart([]);
                }}
                style={{ width: "100%", background: "var(--purple)", color: "white", padding: 16, borderRadius: 12, border: 0, fontSize: 16, fontWeight: 600, cursor: "pointer" }}
              >
                Lançar na Mesa {String(selectedTable).padStart(2, '0')}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}



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
  const [activeTab, setActiveTab] = useState<"ativas" | "historico" | "perfil">("ativas");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [profileName, setProfileName] = useState("Carlos Motoboy");
  const [profileAvatar, setProfileAvatar] = useState("👨‍🚀");

  const AVATARES = ["👨‍🚀", "🏎️", "😎", "🦊", "⚡"];

  const activeOrders = orders.filter(o => o.status === "Pronto" || o.status === "Saiu");
  const historyOrders = orders.filter(o => o.status === "Entregue");

  const weeklyEarnings = 420.50 + (historyOrders.length * 8);
  const weeklyDeliveries = 32 + historyOrders.length;

  return (
    <div className="waiter-backdrop" style={{ background: "var(--canvas)" }}>
      <div className="waiter-frame" style={{ display: "flex", flexDirection: "column" }}>

        {/* Header & Profile Summary */}
        <div style={{ padding: "20px 20px 0", background: "var(--panel)", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, overflow: "hidden" }}>
                {profileAvatar}
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
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>Ganhos (Semana)</div>
              <div style={{ color: "var(--ink)", fontSize: 18, fontWeight: 800 }}>{formatMoney(weeklyEarnings)}</div>
            </div>
            <div style={{ flex: 1, background: "var(--surface)", borderRadius: 12, padding: 12, border: "1px solid var(--line)" }}>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>Entregas</div>
              <div style={{ color: "var(--ink)", fontSize: 18, fontWeight: 800 }}>{weeklyDeliveries}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
            <button
              onClick={() => setActiveTab("ativas")}
              style={{ background: "transparent", border: 0, padding: "0 0 12px", color: activeTab === "ativas" ? "var(--ink)" : "var(--muted)", fontWeight: activeTab === "ativas" ? 700 : 500, fontSize: 14, borderBottom: activeTab === "ativas" ? "2px solid var(--blue)" : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Ativas ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("historico")}
              style={{ background: "transparent", border: 0, padding: "0 0 12px", color: activeTab === "historico" ? "var(--ink)" : "var(--muted)", fontWeight: activeTab === "historico" ? 700 : 500, fontSize: 14, borderBottom: activeTab === "historico" ? "2px solid var(--blue)" : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Histórico ({historyOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("perfil")}
              style={{ background: "transparent", border: 0, padding: "0 0 12px", color: activeTab === "perfil" ? "var(--ink)" : "var(--muted)", fontWeight: activeTab === "perfil" ? 700 : 500, fontSize: 14, borderBottom: activeTab === "perfil" ? "2px solid var(--blue)" : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Meu Perfil
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {activeTab === "ativas" && (
            activeOrders.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 60 }}>
                <p style={{ fontSize: 40, margin: "0 0 16px" }}>🛵</p>
                <p>Nenhuma entrega na fila.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {activeOrders.map(order => {
                  const taxa = 8.00;
                  const trocoPara = 100.00;
                  const valorTroco = trocoPara > order.total ? trocoPara - order.total : 0;
                  const enderecoCompleto = `Av. Min. Salgado Filho, 100, Guaratinguetá, SP, 12522-530`;
                  const distanciaKm = ((order.id % 5) + 1.8).toFixed(1);

                  return (
                    <div key={order.id} style={{ background: "var(--panel)", borderRadius: 16, padding: 20, border: order.status === "Saiu" ? "2px solid var(--green)" : "1px solid var(--line)", position: "relative", overflow: "hidden" }}>
                      {order.status === "Saiu" && <div style={{ position: "absolute", top: 0, right: 0, background: "var(--green)", color: "#000", padding: "4px 12px", fontSize: 10, fontWeight: 800, borderBottomLeftRadius: 10 }}>EM ROTA</div>}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                          <strong style={{ fontSize: 18, display: "block", marginBottom: 4 }}>#{order.id}</strong>
                          <span style={{ fontSize: 16, fontWeight: 700 }}>{order.customer}</span>
                        </div>
                        <div style={{ textAlign: "right", background: "var(--surface)", padding: 8, borderRadius: 8, border: "1px solid var(--line)" }}>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>Total: <strong style={{ color: "var(--ink)" }}>{formatMoney(order.total)}</strong></div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 0 }}>Taxa da Entrega: <strong style={{ color: "var(--green)" }}>{formatMoney(taxa)}</strong></div>
                        </div>
                      </div>

                      <div style={{ background: "var(--surface)", padding: 12, borderRadius: 8, marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Endereço de Entrega</p>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)", background: "rgba(59, 130, 246, 0.15)", padding: "2px 8px", borderRadius: 12 }}>{distanciaKm} km</span>
                        </div>
                        <p style={{ margin: "0 0 4px", color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
                          Av. Min. Salgado Filho, 100 - Vila Municipal<br />
                          Guaratinguetá, SP • CEP: 12522-530
                        </p>
                        <p style={{ margin: 0, color: "var(--orange)", fontSize: 12, fontWeight: 600 }}>📍 Ref: Em frente a quadra de futebol</p>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ marginBottom: expandedOrder === order.id ? 16 : 16 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                          <a href={`https://wa.me/5524981177147?text=Olá ${order.customer}, o seu pedido do Barbosa Restaurante já está a caminho!`} target="_blank" rel="noreferrer" className="ghost-button" style={{ textAlign: "center", textDecoration: "none", fontSize: 13, padding: "12px 0", color: "var(--green)", borderColor: "rgba(34, 197, 94, 0.2)" }}>💬 WhatsApp</a>
                          <button onClick={(e) => { 
                            e.stopPropagation(); 
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                              navigator.clipboard.writeText(enderecoCompleto);
                              alert("Endereço copiado!");
                            } else {
                              const textArea = document.createElement("textarea");
                              textArea.value = enderecoCompleto;
                              document.body.appendChild(textArea);
                              textArea.select();
                              try { document.execCommand('copy'); alert("Endereço copiado!"); } 
                              catch (err) { alert("Não foi possível copiar o endereço automaticamente."); }
                              document.body.removeChild(textArea);
                            }
                          }} className="ghost-button" style={{ textAlign: "center", fontSize: 13, padding: "12px 0", color: "var(--ink)", borderColor: "var(--line)", cursor: "pointer" }}>📋 Copiar Endereço</button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`} target="_blank" rel="noreferrer" className="ghost-button" style={{ textAlign: "center", textDecoration: "none", fontSize: 13, padding: "12px 0", height: "auto" }}>📍 Maps</a>
                          <a href={`http://maps.apple.com/?q=${encodeURIComponent(enderecoCompleto)}`} target="_blank" rel="noreferrer" className="ghost-button" style={{ textAlign: "center", textDecoration: "none", fontSize: 13, padding: "12px 0", height: "auto" }}>🍎 Mapas</a>
                          <a href={`https://waze.com/ul?q=${encodeURIComponent(enderecoCompleto)}&navigate=yes`} target="_blank" rel="noreferrer" className="ghost-button" style={{ textAlign: "center", textDecoration: "none", fontSize: 13, padding: "12px 0", height: "auto" }}>🚙 Waze</a>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        style={{ width: "100%", padding: "12px 0", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      >
                        <span style={{ paddingLeft: 12 }}>Ver ítens do pedido</span>
                        <span style={{ paddingRight: 12, opacity: 0.5 }}>{expandedOrder === order.id ? "▲" : "▼"}</span>
                      </button>

                      {expandedOrder === order.id && (
                        <div style={{ background: "var(--surface)", padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 13, color: "var(--muted)", borderLeft: "3px solid var(--blue)" }}>
                          <strong style={{ color: "var(--ink)", display: "block", marginBottom: 8 }}>Itens na sacola:</strong>
                          <p style={{ margin: "0 0 12px", lineHeight: 1.5 }}>{order.detail}</p>
                          <strong style={{ color: "var(--ink)", display: "block", marginBottom: 8 }}>Pagamento:</strong>
                          <p style={{ margin: 0, lineHeight: 1.5 }}>
                            Pagar na entrega (Dinheiro)<br />
                            {valorTroco > 0 && (
                              <strong style={{ color: "var(--red)" }}>
                                Troco para {formatMoney(trocoPara)} (Levar {formatMoney(valorTroco)} de troco)
                              </strong>
                            )}
                          </p>
                        </div>
                      )}

                      {order.status === "Pronto" ? (
                        <button className="primary-button" style={{ width: "100%", height: "auto", padding: "14px 0", fontSize: 15 }} onClick={() => onAdvance(order.id)}>Pegar Rota 📍</button>
                      ) : (
                        <button className="primary-button" style={{ width: "100%", background: "var(--green)", border: "none", height: "auto", padding: "14px 0", fontSize: 15 }} onClick={() => onComplete(order.id)}>Entregue ✅</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {activeTab === "historico" && (
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

          {activeTab === "perfil" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "var(--panel)", padding: 20, borderRadius: 16, border: "1px solid var(--line)" }}>
                <h3 style={{ fontSize: 16, margin: "0 0 16px" }}>Dados Pessoais</h3>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--blue)", fontSize: 32 }}>
                    {profileAvatar}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {AVATARES.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setProfileAvatar(emoji)}
                        style={{ width: 40, height: 40, borderRadius: "50%", border: profileAvatar === emoji ? "2px solid var(--blue)" : "1px solid var(--line)", background: "var(--surface)", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>NOME DE EXIBIÇÃO</label>
                  <input
                    className="modal-input"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ background: "var(--panel)", padding: 20, borderRadius: 16, border: "1px solid var(--line)" }}>
                <h3 style={{ fontSize: 16, margin: "0 0 16px" }}>Minhas Análises</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, fontSize: 12, color: "var(--muted)" }}>Seg</div>
                    <div style={{ flex: 1, background: "var(--surface)", height: 8, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ background: "var(--blue)", width: "60%", height: "100%" }} />
                    </div>
                    <div style={{ width: 30, fontSize: 12, fontWeight: 600, textAlign: "right" }}>12</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, fontSize: 12, color: "var(--muted)" }}>Ter</div>
                    <div style={{ flex: 1, background: "var(--surface)", height: 8, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ background: "var(--blue)", width: "40%", height: "100%" }} />
                    </div>
                    <div style={{ width: 30, fontSize: 12, fontWeight: 600, textAlign: "right" }}>8</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, fontSize: 12, color: "var(--muted)" }}>Qua</div>
                    <div style={{ flex: 1, background: "var(--surface)", height: 8, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ background: "var(--blue)", width: "80%", height: "100%" }} />
                    </div>
                    <div style={{ width: 30, fontSize: 12, fontWeight: 600, textAlign: "right" }}>16</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, fontSize: 12, color: "var(--muted)" }}>Qui</div>
                    <div style={{ flex: 1, background: "var(--surface)", height: 8, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ background: "var(--orange)", width: "30%", height: "100%" }} />
                    </div>
                    <div style={{ width: 30, fontSize: 12, fontWeight: 600, textAlign: "right" }}>6</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, fontSize: 12, color: "var(--muted)" }}>Sex</div>
                    <div style={{ flex: 1, background: "var(--surface)", height: 8, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ background: "var(--green)", width: `${Math.min(100, (weeklyDeliveries / 20) * 100)}%`, height: "100%" }} />
                    </div>
                    <div style={{ width: 30, fontSize: 12, fontWeight: 600, textAlign: "right", color: "var(--green)" }}>{weeklyDeliveries}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
