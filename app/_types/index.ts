export type AppRole = "admin" | "balcao" | "garcom" | "cozinha" | "entregador";

export type View =
  | "Visão geral"
  | "Pedidos"
  | "WhatsApp"
  | "Salão"
  | "Cardápio"
  | "Entregas"
  | "Relatórios"
  | "CRM"
  | "Integrações"
  | "Configurações";

export type OrderStatus =
  | "Novo"
  | "Confirmado"
  | "Em preparo"
  | "Pronto"
  | "Despachado"
  | "Saiu"
  | "Entregue";

export type Order = {
  id: number;
  customer: string;
  channel: "WhatsApp" | "Site" | "Salão";
  detail: string;
  total: number;
  time: string;
  status: OrderStatus;
  feePending?: boolean;
  driver?: string;
  driverFee?: number;
};

export type Waiter = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export type Table = {
  number: number;
  seats: number;
  status: "Livre" | "Ocupada" | "Conta" | "Reservada";
  guests: number;
  total: number;
  time?: string;
  items: { name: string; quantity: number; price: number; options?: string[]; observations?: string }[];
  waiterId?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  area?: "salao" | "varanda";
  reservedFor?: string;
};

export type ChatMessage = {
  side: "customer" | "ai" | "operator";
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  name: string;
  initials: string;
  message: string;
  time: string;
  unread: number;
  isVip?: boolean;
  history: ChatMessage[];
  suggestion?: string;
};

export type MenuItem = {
  id?: number;
  name: string;
  category: string;
  price: number;
  sold: number;
  available: boolean;
};

export type Expense = {
  id: string;
  description: string;
  category: "Ingredientes" | "Funcionários" | "Contas" | "Manutenção" | "Outros";
  date: string;
  amount: number;
  status: "Pago" | "Pendente";
};

export type NavItem = {
  label: View;
  icon: string;
  badge?: string;
  group?: string;
};
