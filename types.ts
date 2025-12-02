import { Role, Permission } from './utils/permissions';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  permissions?: Permission[];
}

export interface Booking {
  id: string;
  clientName: string;
  adventureName: string;
  startDate: string;
  endDate: string;
  participants: number;
  totalValue: number;
  status: 'Confirmada' | 'Pendente' | 'Cancelada' | 'Concluída';
  agency?: string;
  location?: string;
  country?: string;
  time?: string;
  duration?: string;
  paymentStatus?: string;
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number; // Optional second value for comparison
}

export interface NavItem {
  label: string;
  icon: string;
  path: string;
  active?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Administrador' | 'Gestor' | 'Guia' | 'Condutor';
  nif?: string;
  notes: string;
  isActive: boolean;
  auth_id?: string; // Link to Supabase Auth user
}

export interface Agency {
  id: string;
  code: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  contact: string;
  fee: number;
  iban?: string;
  isActive: boolean;
}

export interface SeasonConfig {
  start: string;
  end: string;
  times: string[];
}

export interface Adventure {
  id: string;
  name: string;
  description: string;
  location: string;
  meetingPoint: string;
  duration: string;
  priceAdult: number;
  priceChild: number;
  priceBaby: number;
  minCapacity: number | null;  // null = no minimum
  maxCapacity: number | null;  // null = unlimited
  isActive: boolean;
  highSeason: SeasonConfig;
  lowSeason: SeasonConfig;
}