export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatar?: string;
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