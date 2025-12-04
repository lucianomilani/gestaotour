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
  company_id?: string; // Link to Company
  company_name?: string; // Display name
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
  company_id?: string; // Link to Company
  company_name?: string; // Display name
  isSuperAdmin?: boolean; // SuperAdmin flag - can manage all companies
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
  company_id?: string; // Link to Company
  company_name?: string; // Display name
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
  company_id?: string; // Link to Company
  company_name?: string; // Display name
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description?: string;
  apiConfig?: Record<string, any>; // Legacy field for backward compatibility
  isActive: boolean;
  displayOrder: number;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
  // API Configuration Fields
  apiEnabled?: boolean;
  apiEndpoint?: string;
  apiKeyEncrypted?: string;
  apiSecretEncrypted?: string;
  webhookUrl?: string;
  webhookSecretEncrypted?: string;
  sandboxMode?: boolean;
  apiVersion?: string;
  additionalConfig?: Record<string, any>;
  company_id?: string; // Link to Company
  company_name?: string; // Display name
}

export interface CompanySettings {
  id: string;
  code: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  contact: string;
  iban?: string;
  address: string;
  postalCode: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}