import React, { useState, useEffect, useMemo } from 'react';
import { MetricCard } from '../components/Metrics';
import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../services/supabase';
import { format, subMonths, subWeeks, subYears, startOfYear, endOfYear, isSameMonth, parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { pt } from 'date-fns/locale';
import { getCountryFlag } from '../utils/countryFlags';

const STATUS_COLORS = {
    'Confirmada': '#13ec49',
    'Pendente': '#fbbf24',
    'Cancelada': '#ef4444',
    'Concluída': '#3b82f6'
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Analytics: React.FC = () => {
    // State
    const [bookings, setBookings] = useState<any[]>([]);
    const [agencies, setAgencies] = useState<any[]>([]);
    const [adventures, setAdventures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [period, setPeriod] = useState('Últimos 3 meses');
    const [adventureFilter, setAdventureFilter] = useState('Todas');
    const [agencyFilter, setAgencyFilter] = useState('Todas');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('Todos');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [bookingsRes, agenciesRes, adventuresRes] = await Promise.all([
                    supabase.from('bookings').select('*'),
                    supabase.from('agencies').select('*'),
                    supabase.from('adventures').select('*')
                ]);

                if (bookingsRes.data) setBookings(bookingsRes.data);
                if (agenciesRes.data) setAgencies(agenciesRes.data);
                if (adventuresRes.data) setAdventures(adventuresRes.data);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter Logic
    const filteredData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'Última semana':
                startDate = subWeeks(now, 1);
                break;
            case 'Último mês':
                startDate = subMonths(now, 1);
                break;
            case 'Últimos 3 meses':
                startDate = subMonths(now, 3);
                break;
            case 'Últimos 6 meses':
                startDate = subMonths(now, 6);
                break;
            case 'Este ano':
                startDate = startOfYear(now);
                break;
            case 'Ano passado':
                startDate = startOfYear(subYears(now, 1));
                break;
            default:
                startDate = subMonths(now, 3);
        }

        return bookings.filter(b => {
            const date = new Date(b.date);
            const matchesDate = date >= startDate && date <= now;
            const matchesAdventure = adventureFilter === 'Todas' || (adventures.find(a => a.id === b.adventure_id)?.name === adventureFilter);
            const matchesAgency = agencyFilter === 'Todas' || (agencies.find(a => a.id === b.agency_id)?.name === agencyFilter);
            const matchesStatus = statusFilter === 'Todos' || b.status === statusFilter;
            const matchesPayment = paymentStatusFilter === 'Todos' || b.payment_status === paymentStatusFilter;

            return matchesDate && matchesAdventure && matchesAgency && matchesStatus && matchesPayment;
        });
    }, [bookings, period, adventureFilter, agencyFilter, statusFilter, paymentStatusFilter, adventures, agencies]);

    // Metrics Calculations
    const metrics = useMemo(() => {
        const totalRevenue = filteredData.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
        const totalBookings = filteredData.length;
        const totalPax = filteredData.reduce((acc, curr) => acc + (curr.adults || 0) + (curr.children || 0), 0);
        const averageTicket = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        return { totalRevenue, totalBookings, totalPax, averageTicket };
    }, [filteredData]);

    // Charts Data
    const chartsData = useMemo(() => {
        // Revenue by Month
        const revenueByMonth = filteredData.reduce((acc: any, b) => {
            const date = new Date(b.date);
            const key = format(date, 'MMM yyyy', { locale: pt });
            if (!acc[key]) acc[key] = 0;
            acc[key] += (b.total_amount || 0);
            return acc;
        }, {});

        const revenueChart = Object.entries(revenueByMonth).map(([name, value]) => ({ name, value }));

        // Status Distribution
        const statusDist = filteredData.reduce((acc: any, b) => {
            if (!acc[b.status]) acc[b.status] = 0;
            acc[b.status]++;
            return acc;
        }, {});

        const statusChart = Object.entries(statusDist).map(([name, value]) => ({ name, value }));

        // Country Stats (Updated with getCountryFlag)
        const countryRevenue = filteredData.reduce((acc: any, b) => {
            if (!b.client_country) return acc;
            if (!acc[b.client_country]) acc[b.client_country] = 0;
            if (['Confirmada', 'Concluída'].includes(b.status)) {
                acc[b.client_country] += (b.total_amount || 0);
            }
            return acc;
        }, {});

        const totalRev = Object.values(countryRevenue).reduce((a: any, b: any) => a + b, 0) as number;
        const countryStats = Object.entries(countryRevenue)
            .map(([name, value]: [string, any]) => ({
                name,
                value,
                percentage: totalRev > 0 ? Math.round((value / totalRev) * 100) : 0,
                flag: getCountryFlag(name)
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return { revenueChart, statusChart, countryStats };
    }, [filteredData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Análise de Desempenho</h1>
                    <p className="text-gray-500 dark:text-gray-400">Visualize métricas e indicadores chave.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option>Última semana</option>
                        <option>Último mês</option>
                        <option>Últimos 3 meses</option>
                        <option>Últimos 6 meses</option>
                        <option>Este ano</option>
                        <option>Ano passado</option>
                    </select>

                    <select
                        value={adventureFilter}
                        onChange={(e) => setAdventureFilter(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="Todas">Todas as Aventuras</option>
                        {adventures.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Receita Total"
                    value={`€${metrics.totalRevenue.toFixed(2)}`}
                    icon="payments"
                    trend="+12%"
                    trendUp={true}
                    color="green"
                />
                <MetricCard
                    title="Total Reservas"
                    value={metrics.totalBookings.toString()}
                    icon="confirmation_number"
                    trend="+5%"
                    trendUp={true}
                    color="blue"
                />
                <MetricCard
                    title="Total Pax"
                    value={metrics.totalPax.toString()}
                    icon="groups"
                    trend="+8%"
                    trendUp={true}
                    color="purple"
                />
                <MetricCard
                    title="Ticket Médio"
                    value={`€${metrics.averageTicket.toFixed(2)}`}
                    icon="receipt_long"
                    trend="+2%"
                    trendUp={true}
                    color="orange"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-surface-border">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Evolução da Receita</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartsData.revenueChart}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-white/10" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Country Performance */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-surface-border">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Desempenho por País</h3>
                    <div className="space-y-4">
                        {chartsData.countryStats.map((stat, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <span className="text-2xl">{stat.flag}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.name}</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">€{stat.value.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-black/20 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{ width: `${stat.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-gray-500 w-12 text-right">{stat.percentage}%</span>
                            </div>
                        ))}
                        {chartsData.countryStats.length === 0 && (
                            <p className="text-center text-gray-500 py-8">Sem dados para o período selecionado.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for AreaChart since it wasn't imported in the main block
import { AreaChart } from 'recharts';
