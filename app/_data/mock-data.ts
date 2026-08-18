import type { Order, Waiter, Table, Conversation, MenuItem, Expense, NavItem } from "../_types";

export const navigation: NavItem[] = [
  { label: "Visão geral", icon: "visao-geral", group: "OPERAÇÃO" },
  { label: "Pedidos", icon: "pedidos", badge: "12" },
  { label: "WhatsApp", icon: "whatsapp", badge: "5" },
  { label: "Salão", icon: "salao" },
  { label: "Cardápio", icon: "cardapio", group: "GESTÃO" },
  { label: "Entregas", icon: "entregas" },
  { label: "Relatórios", icon: "relatorios" },
  { label: "CRM", icon: "crm" },
  { label: "Integrações", icon: "integracoes" },
  { label: "Configurações", icon: "configuracoes", group: "CONFIGURAÇÃO" },
];

export const initialOrders: Order[] = [
  { id: 1052, customer: "Marina Alves", channel: "Site", detail: "2 pizzas • 1 refrigerante", total: 94.7, time: "há 3 min", status: "Novo", feePending: true },
  { id: 1051, customer: "Lucas Mendes", channel: "WhatsApp", detail: "1 combo família • 2 sucos", total: 128.0, time: "há 7 min", status: "Confirmado" },
  { id: 1050, customer: "Mesa 08", channel: "Salão", detail: "4 itens • 3 pessoas", total: 156.5, time: "há 12 min", status: "Em preparo" },
  { id: 1049, customer: "Fernanda Costa", channel: "WhatsApp", detail: "2 massas • 1 sobremesa", total: 86.9, time: "há 18 min", status: "Em preparo" },
  { id: 1048, customer: "João Pedro", channel: "Site", detail: "1 pizza grande • borda", total: 72.0, time: "há 24 min", status: "Pronto", driverFee: 8.5 },
  { id: 1047, customer: "Ana Luiza", channel: "WhatsApp", detail: "1 lasanha • 1 água", total: 49.5, time: "há 31 min", status: "Saiu", driverFee: 9.5 },
];

export const initialWaiters: Waiter[] = [
  { id: "w1", name: "Carlos Silva", initials: "CS", color: "var(--orange, #FF5733)" },
  { id: "w2", name: "Ana Paula", initials: "AP", color: "#33FF57" },
];

export const initialTables: Table[] = [
  { number: 1, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 13, y: 27, width: 96, height: 72, area: "salao" },
  {
    number: 2, seats: 4, status: "Ocupada", guests: 3, total: 128.7, time: "48 min",
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
    number: 4, seats: 6, status: "Conta", guests: 5, total: 284.3, time: "1h 12min",
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
    number: 6, seats: 4, status: "Ocupada", guests: 2, total: 76.4, time: "31 min",
    items: [
      { name: "Massas", quantity: 2, price: 59.8 },
      { name: "Refrigerantes", quantity: 2, price: 16.6 },
    ],
    x: 36, y: 54, width: 96, height: 72, area: "salao",
  },
  { number: 7, seats: 2, status: "Livre", guests: 0, total: 0, items: [], x: 60, y: 54, width: 80, height: 62, area: "salao" },
  {
    number: 8, seats: 4, status: "Ocupada", guests: 3, total: 156.5, time: "26 min",
    items: [
      { name: "Pizza Calabresa", quantity: 1, price: 62 },
      { name: "Parmegiana", quantity: 2, price: 76.5 },
      { name: "Chopp", quantity: 2, price: 18 },
    ],
    x: 83, y: 54, width: 96, height: 72, area: "salao",
  },
  { number: 9, seats: 6, status: "Reservada", guests: 5, total: 0, time: "21:00", items: [], x: 13, y: 82, width: 112, height: 84, area: "salao", reservedFor: "Grupo Silva" },
  {
    number: 10, seats: 4, status: "Ocupada", guests: 4, total: 198.8, time: "54 min",
    items: [{ name: "Jantar completo", quantity: 4, price: 198.8 }],
    x: 40, y: 82, width: 96, height: 72, area: "salao",
  },
  { number: 11, seats: 2, status: "Livre", guests: 0, total: 0, items: [], x: 63, y: 82, width: 80, height: 62, area: "salao" },
  { number: 12, seats: 8, status: "Livre", guests: 0, total: 0, items: [], x: 84, y: 82, width: 140, height: 96, area: "salao" },
];

export const initialVarandaTables: Table[] = [
  { number: 13, seats: 2, status: "Livre", guests: 0, total: 0, items: [], x: 20, y: 30, width: 80, height: 62, area: "varanda" },
  { number: 14, seats: 2, status: "Livre", guests: 0, total: 0, items: [], x: 50, y: 30, width: 80, height: 62, area: "varanda" },
  { number: 15, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 80, y: 30, width: 96, height: 72, area: "varanda" },
  { number: 16, seats: 2, status: "Reservada", guests: 2, total: 0, time: "21:30", items: [], x: 35, y: 68, width: 80, height: 62, area: "varanda", reservedFor: "Casal Mendes" },
  { number: 17, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 65, y: 68, width: 96, height: 72, area: "varanda" },
];

export const initialConversations: Conversation[] = [
  {
    id: "c1", name: "Camila Rocha", initials: "CR", message: "Ótimo, muito obrigada!", time: "10:42", unread: 2, isVip: true,
    history: [
      { side: "customer", text: "Oi! Fiz o pedido #1046. Meu pedido já saiu para entrega?", time: "10:41" },
      { side: "ai", text: "Oi, Camila! Seu pedido #1046 saiu às 10:36 e chega em cerca de 18 min. 😊", time: "10:42" },
      { side: "customer", text: "Ótimo, muito obrigada!", time: "10:42" },
    ],
    suggestion: "Imagina, Camila! Qualquer dúvida estamos à disposição. Bom apetite! 🍕",
  },
  {
    id: "c2", name: "Lucas Mendes", initials: "LM", message: "Perfeito, obrigado!", time: "10:36", unread: 0,
    history: [
      { side: "customer", text: "Boa noite, vocês entregam no bairro Jardins?", time: "10:30" },
      { side: "ai", text: "Boa noite, Lucas! Sim, entregamos no Jardins. A taxa fica em R$ 7,90 e o tempo médio é 40 min.", time: "10:31" },
      { side: "customer", text: "Vou pedir pelo iFood então, valeu.", time: "10:35" },
      { side: "ai", text: "Combinado! Aguardamos seu pedido.", time: "10:35" },
      { side: "customer", text: "Perfeito, obrigado!", time: "10:36" },
    ],
  },
  {
    id: "c3", name: "Beatriz Lima", initials: "BL", message: "Vocês têm opção sem lactose?", time: "10:31", unread: 1,
    history: [
      { side: "customer", text: "Boa noite! Vocês têm opção sem lactose nas pizzas?", time: "10:31" },
    ],
    suggestion: "Oi Beatriz! Temos sim. Nossas pizzas podem ser feitas com queijo muçarela zero lactose. Qual sabor você prefere?",
  },
];

export const initialMenuItems: MenuItem[] = [
  { name: "Pizza Margherita", category: "Pizzas", price: 58.9, sold: 34, available: true },
  { name: "Pizza Calabresa", category: "Pizzas", price: 62, sold: 29, available: true },
  { name: "Parmegiana da casa", category: "Pratos", price: 48.5, sold: 24, available: true },
  { name: "Lasanha bolonhesa", category: "Massas", price: 42.9, sold: 19, available: true },
  { name: "Tiramisù", category: "Sobremesas", price: 24, sold: 16, available: true },
  { name: "Nhoque artesanal", category: "Massas", price: 44, sold: 8, available: false },
];

export const initialExpenses: Expense[] = [
  { id: "e1", description: "Hortifruti da Semana", category: "Ingredientes", date: "08/08", amount: 1240.50, status: "Pago" },
  { id: "e2", description: "Conta de Luz", category: "Contas", date: "10/08", amount: 890.00, status: "Pendente" },
  { id: "e3", description: "Conserto Geladeira", category: "Manutenção", date: "05/08", amount: 450.00, status: "Pago" },
  { id: "e4", description: "Pagamento Garçons", category: "Funcionários", date: "05/08", amount: 3200.00, status: "Pago" },
];

export const initialJardinsOrders: Order[] = [
  { id: 2001, customer: "Marcos Silva", channel: "WhatsApp", detail: "1 Hambúrguer Artesanal", total: 35.9, time: "há 2 min", status: "Novo" },
  { id: 2002, customer: "Mesa 02", channel: "Salão", detail: "2 Chopps • 1 Porção Batata", total: 58.0, time: "há 15 min", status: "Em preparo" },
];

export const initialJardinsTables: Table[] = [
  { number: 1, seats: 4, status: "Livre", guests: 0, total: 0, items: [], x: 20, y: 30, width: 90, height: 70, area: "salao" },
  {
    number: 2, seats: 4, status: "Ocupada", guests: 2, total: 58.0, time: "15 min",
    items: [{ name: "Chopp", quantity: 2, price: 14 }, { name: "Porção Batata", quantity: 1, price: 30 }],
    x: 50, y: 30, width: 90, height: 70, area: "salao",
  },
  { number: 3, seats: 2, status: "Livre", guests: 0, total: 0, items: [], x: 80, y: 30, width: 70, height: 60, area: "salao" },
];

export const initialJardinsWaiters: Waiter[] = [
  { id: "w3", name: "Felipe Jardins", initials: "FJ", color: "var(--blue)" },
];
