import { Booking, Metric, ChartDataPoint } from '../types';

export const mockBookings: Booking[] = [
    { id: '12355', clientName: 'Ricardo Gomes', adventureName: 'Trilho do Sol', startDate: '2024-07-28', endDate: '2024-07-28', participants: 2, totalValue: 150, status: 'Confirmada', agency: 'Particular', location: 'Serra de Montesinho', country: 'Portugal', time: '09:00' },
    { id: '12356', clientName: 'Helena Costa', adventureName: 'Kayak no Rio', startDate: '2024-07-29', endDate: '2024-07-29', participants: 4, totalValue: 220, status: 'Confirmada', agency: 'Viagens Norte', location: 'Rio Douro', country: 'Portugal', time: '14:30' },
    { id: '12357', clientName: 'Manuel Antunes', adventureName: 'Escalada Montanha', startDate: '2024-07-30', endDate: '2024-07-30', participants: 3, totalValue: 250, status: 'Pendente', agency: 'GetYourGuide', location: 'Gerês', country: 'Portugal', time: '08:00' },
    { id: '12358', clientName: 'Sara Martins', adventureName: 'Observação de Aves', startDate: '2024-07-31', endDate: '2024-07-31', participants: 2, totalValue: 180, status: 'Confirmada', agency: 'Airbnb', location: 'Albufeira do Azibo', country: 'Portugal', time: '07:00' },
    { id: '12359', clientName: 'Diogo Silva', adventureName: 'Passeio de Barco', startDate: '2024-08-01', endDate: '2024-08-01', participants: 5, totalValue: 400, status: 'Confirmada', agency: 'Particular', location: 'Rio Douro', country: 'França', time: '10:00' },
    { id: '12360', clientName: 'Patrícia Lima', adventureName: 'Trilho do Sol', startDate: '2024-08-02', endDate: '2024-08-02', participants: 2, totalValue: 150, status: 'Pendente', agency: 'Booking.com', location: 'Serra de Montesinho', country: 'Portugal', time: '09:30' },
    { id: '12361', clientName: 'João Ferreira', adventureName: 'Tour Gastronómico', startDate: '2024-08-03', endDate: '2024-08-03', participants: 2, totalValue: 200, status: 'Confirmada', agency: 'Viagens Norte', location: 'Bragança', country: 'Espanha', time: '12:00' },
    { id: '12362', clientName: 'Ana Rodrigues', adventureName: 'Kayak no Rio', startDate: '2024-08-04', endDate: '2024-08-04', participants: 4, totalValue: 220, status: 'Cancelada', agency: 'Particular', location: 'Rio Douro', country: 'Portugal', time: '15:00' },
    { id: '12363', clientName: 'Carlos Santos', adventureName: 'Escalada Montanha', startDate: '2024-08-05', endDate: '2024-08-05', participants: 1, totalValue: 85, status: 'Confirmada', agency: 'GetYourGuide', location: 'Gerês', country: 'Portugal', time: '08:30' },
    { id: '12364', clientName: 'Sofia Neves', adventureName: 'Trilho dos Passadiços', startDate: '2024-08-06', endDate: '2024-08-06', participants: 3, totalValue: 120, status: 'Confirmada', agency: 'Particular', location: 'Paiva', country: 'Portugal', time: '09:00' },
];

export const mockMetrics: Metric[] = [
    { label: 'Total de Reservas (Mês)', value: '124', change: '+5%', isPositive: true },
    { label: 'Receita Prevista', value: '€18.500', change: '+2.1%', isPositive: true },
    { label: 'Taxa de Ocupação', value: '78%', change: '-1.5%', isPositive: false },
    { label: 'Novas Reservas (Hoje)', value: '5', change: '+3%', isPositive: true },
];

export const revenueData: ChartDataPoint[] = [
    { name: '1', value: 4000 },
    { name: '5', value: 3000 },
    { name: '10', value: 5000 },
    { name: '15', value: 2780 },
    { name: '20', value: 1890 },
    { name: '25', value: 6390 },
    { name: '30', value: 3490 },
];

export const participantsData: ChartDataPoint[] = [
    { name: 'Sem 1', value: 120 },
    { name: 'Sem 2', value: 150 },
    { name: 'Sem 3', value: 180 },
    { name: 'Sem 4', value: 200 },
];

export const calendarEvents = [
    { date: '2024-07-15', type: 'hiking' },
    { date: '2024-07-18', type: 'water' },
    { date: '2024-07-20', type: 'adventure' },
    { date: '2024-07-22', type: 'nature' },
    { date: '2024-07-25', type: 'water' },
    { date: '2024-07-28', type: 'hiking' },
    { date: '2024-07-30', type: 'water' },
];
