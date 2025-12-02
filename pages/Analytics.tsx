import React, { useState, useEffect, useMemo } from 'react';
import { MetricCard, TopAdventureRow } from '../components/Metrics';
import { ComposedChart, Line, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../services/supabase';
import { format, subMonths, subWeeks, subYears, startOfYear, endOfYear, isSameMonth, parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { pt } from 'date-fns/locale';

const STATUS_COLORS = {
    'Confirmada': '#13ec49',
    'Concluída': '#13ec49',
    'Concluido': '#13ec49',
    'Pendente': '#fbbf24',
    'Cancelada': '#ef4444',
    'Cancelado': '#ef4444'
};

const CHART_COLORS = ['#13ec49', '#1f2937', '#fbbf24', '#ef4444'];

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

    // Input styling classes
    const inputContainerClass = "w-full";
    const baseInputClass = "w-full appearance-none py-2.5 bg-white dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm pl-3 pr-10 cursor-pointer";
    const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 ml-1";
    const iconClass = "material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none text-gray-500 dark:text-gray-400";

    // Fetch Data
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

    // Calculations
    const {
        metrics,
        chartData,
        bookingStatusData,
        paymentStatusData,
        uniqueAdventures,
        uniqueCountries,
        uniqueAgencies,
        uniqueStatuses,
        topAdventures,
        countryStats
    } = useMemo(() => {
        if (loading) return {
            metrics: {
                revenue: 0, bookings: 0, participants: 0, averageTicket: 0,
                revenueChange: '0%', bookingsChange: '0%', participantsChange: '0%', avgTicketChange: '0%',
                revenuePositive: true, bookingsPositive: true, participantsPositive: true, avgTicketPositive: true
            },
            chartData: [],
            bookingStatusData: [],
            paymentStatusData: [],
            uniqueAdventures: [],
            uniqueCountries: [],
            uniqueAgencies: [],
            uniqueStatuses: [],
            topAdventures: [],
            countryStats: []
        };

        // 1. Filter Data (Non-Period Filters first)
        let baseFiltered = bookings;

        if (adventureFilter !== 'Todas') {
            const advId = adventures.find(a => a.name === adventureFilter)?.id;
            if (advId) baseFiltered = baseFiltered.filter(b => b.adventure_id === advId);
        }
        if (paymentStatusFilter !== 'Todos') {
            baseFiltered = baseFiltered.filter(b => b.payment_status === paymentStatusFilter);
        }
        if (agencyFilter !== 'Todas') {
            const agId = agencies.find(a => a.name === agencyFilter)?.id;
            if (agencyFilter === 'Particular') {
                baseFiltered = baseFiltered.filter(b => b.agency_id === null);
            } else if (agId) {
                baseFiltered = baseFiltered.filter(b => b.agency_id === agId);
            }
        }
        if (statusFilter !== 'Todos') {
            baseFiltered = baseFiltered.filter(b => b.status === statusFilter);
        }

        // 2. Apply Period Filter for Current and Previous Period
        const now = new Date();
        let currentStart = subMonths(now, 3); // Default
        let currentEnd = now;
        let previousStart = subMonths(now, 6);
        let previousEnd = subMonths(now, 3);

        if (period === 'Última Semana') {
            currentStart = subWeeks(now, 1);
            previousStart = subWeeks(now, 2);
            previousEnd = currentStart;
        } else if (period === 'Último Mês') {
            currentStart = subMonths(now, 1);
            previousStart = subMonths(now, 2);
            previousEnd = currentStart;
        } else if (period === 'Últimos 3 meses') {
            currentStart = subMonths(now, 3);
            previousStart = subMonths(now, 6);
            previousEnd = currentStart;
        } else if (period === 'Últimos 6 meses') {
            currentStart = subMonths(now, 6);
            previousStart = subMonths(now, 12);
            previousEnd = currentStart;
        } else if (period === 'Este Ano') {
            currentStart = startOfYear(now);
            previousStart = startOfYear(subYears(now, 1));
            previousEnd = startOfYear(now); // Compare with same period last year? Or just previous year? Usually previous year.
            // Actually usually "Previous Period" for "This Year" is "Last Year".
            previousEnd = endOfYear(subYears(now, 1));
        } else if (period === 'Ano Passado') {
            currentStart = startOfYear(subYears(now, 1));
            currentEnd = endOfYear(subYears(now, 1));
            previousStart = startOfYear(subYears(now, 2));
            previousEnd = endOfYear(subYears(now, 2));
        }

        const filtered = baseFiltered.filter(b => {
            const date = new Date(b.date);
            return date >= currentStart && date <= currentEnd;
        });

        const previousFiltered = baseFiltered.filter(b => {
            const date = new Date(b.date);
            return date >= previousStart && date <= previousEnd;
        });



        // 2. Calculate Metrics
        // 3. Calculate Metrics (Current vs Previous)
        const calculateMetrics = (data: any[]) => {
            const revenue = data.reduce((sum, b) => sum + (['Confirmada', 'Concluída'].includes(b.status) ? (b.total_amount || 0) : 0), 0);
            const bookingsCount = data.length;
            const participants = data.reduce((sum, b) => sum + ((b.adults || 0) + (b.children || 0) + (b.babies || 0)), 0);
            const avgTicket = bookingsCount > 0 ? revenue / bookingsCount : 0;
            return { revenue, bookings: bookingsCount, participants, avgTicket };
        };

        const currentMetrics = calculateMetrics(filtered);
        const previousMetrics = calculateMetrics(previousFiltered);

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? '+100%' : '0%';
            const change = ((current - previous) / previous) * 100;
            return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
        };

        const metrics = {
            revenue: currentMetrics.revenue,
            bookings: currentMetrics.bookings,
            participants: currentMetrics.participants,
            averageTicket: currentMetrics.avgTicket,
            revenueChange: calculateChange(currentMetrics.revenue, previousMetrics.revenue),
            bookingsChange: calculateChange(currentMetrics.bookings, previousMetrics.bookings),
            participantsChange: calculateChange(currentMetrics.participants, previousMetrics.participants),
            avgTicketChange: calculateChange(currentMetrics.avgTicket, previousMetrics.avgTicket),
            revenuePositive: currentMetrics.revenue >= previousMetrics.revenue,
            bookingsPositive: currentMetrics.bookings >= previousMetrics.bookings,
            participantsPositive: currentMetrics.participants >= previousMetrics.participants,
            avgTicketPositive: currentMetrics.avgTicket >= previousMetrics.avgTicket
        };

        // 3. Chart Data (Group by Month)
        // Create a map of last 3-6 months
        // Create a map of months based on period
        const monthsMap = new Map();
        let monthsToShow = 3;

        if (period === 'Última Semana') monthsToShow = 1; // Just show current month or maybe daily? Keeping simple for now
        else if (period === 'Último Mês') monthsToShow = 1;
        else if (period === 'Últimos 3 meses') monthsToShow = 3;
        else if (period === 'Últimos 6 meses') monthsToShow = 6;
        else if (period === 'Este Ano') monthsToShow = 12;
        else if (period === 'Ano Passado') monthsToShow = 12;

        // Initialize months
        // Logic adjustment: For "Ano Passado", we want Jan-Dec of last year.
        // For others, we want last N months from now.

        if (period === 'Ano Passado') {
            const lastYearDate = subYears(new Date(), 1);
            for (let i = 0; i < 12; i++) {
                const d = new Date(lastYearDate.getFullYear(), i, 1);
                const key = format(d, 'MMM', { locale: pt });
                monthsMap.set(key, { name: key, receita: 0, reservas: 0, sortKey: d.getTime() });
            }
        } else if (period === 'Este Ano') {
            const currentYear = new Date().getFullYear();
            for (let i = 0; i < 12; i++) {
                const d = new Date(currentYear, i, 1);
                const key = format(d, 'MMM', { locale: pt });
                monthsMap.set(key, { name: key, receita: 0, reservas: 0, sortKey: d.getTime() });
            }
        } else {
            // Last N months
            for (let i = monthsToShow - 1; i >= 0; i--) {
                const d = subMonths(new Date(), i);
                const key = format(d, 'MMM', { locale: pt });
                monthsMap.set(key, { name: key, receita: 0, reservas: 0, sortKey: d.getTime() });
            }
        }

        filtered.forEach(b => {
            const d = new Date(b.date);
            const key = format(d, 'MMM', { locale: pt });
            // Only add if it's in our range (or dynamically add)
            if (monthsMap.has(key)) {
                const entry = monthsMap.get(key);
                entry.reservas += 1;
                if (['Confirmada', 'Concluída'].includes(b.status)) {
                    entry.receita += (b.total_amount || 0);
                }
            }
        });
        const chartData = Array.from(monthsMap.values()).sort((a, b) => a.sortKey - b.sortKey);

        // 4. Booking Status Data
        const statusCounts = filtered.reduce((acc: any, b) => {
            acc[b.status] = (acc[b.status] || 0) + 1;
            return acc;
        }, {});
        const bookingStatusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

        // 4b. Payment Status Data
        const paymentStatusCounts = filtered.reduce((acc: any, b) => {
            const status = b.payment_status || 'Pendente';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        const paymentStatusData = Object.entries(paymentStatusCounts).map(([name, value]) => ({ name, value }));

        // 5. Lists for Filters
        const uniqueAdventures = [...new Set(adventures.map(a => a.name))];
        const uniqueCountries = [...new Set(bookings.map(b => b.client_country).filter(Boolean))];
        const uniqueAgencies = ['Particular', ...agencies.map(a => a.name)];
        const uniqueStatuses = [...new Set(bookings.map(b => b.status).filter(Boolean))];

        // 6. Top Adventures
        const advCounts = filtered.reduce((acc: any, b) => {
            acc[b.adventure_id] = (acc[b.adventure_id] || 0) + 1;
            return acc;
        }, {});
        const topAdventures = Object.entries(advCounts)
            .map(([id, count]) => {
                const adv = adventures.find(a => a.id === id);
                return { name: adv?.name || 'Desconhecido', count: `${count} reservas` };
            })
            .sort((a: any, b: any) => parseInt(b.count) - parseInt(a.count))
            .slice(0, 3);

        // 7. Country Stats
        const countryRevenue = filtered.reduce((acc: any, b) => {
            if (!b.client_country) return acc;
            if (!acc[b.client_country]) acc[b.client_country] = 0;
            if (['Confirmada', 'Concluída'].includes(b.status)) {
                acc[b.client_country] += (b.total_amount || 0);
            }
            return acc;
        }, {});
        const totalRevenue = Object.values(countryRevenue).reduce((a: any, b: any) => a + b, 0) as number;
        const countryStats = Object.entries(countryRevenue)
            .map(([name, value]: [string, any]) => ({
                name,
                value,
                percentage: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0,
                flag: name === 'Portugal' ? '🇵🇹' : name === 'Espanha' ? '🇪🇸' : name === 'França' ? '🇫🇷' : name === 'Reino Unido' ? '🇬🇧' : '🌍'
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 4);

        return {
            metrics,
            chartData,
            bookingStatusData,
            paymentStatusData,
            uniqueAdventures,
            uniqueCountries,
            uniqueAgencies,
            uniqueStatuses,
            topAdventures,
            countryStats
        };
    }, [bookings, agencies, adventures, period, adventureFilter, agencyFilter, statusFilter, paymentStatusFilter, loading]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 animate-pulse">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando dados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight">Análise de Desempenho</h1>
                    <p className="text-gray-600 dark:text-[#92c9a0] mt-1">Insights aprofundados sobre as suas reservas turísticas.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="no-print flex items-center gap-2 bg-primary hover:bg-primary-dark text-background-dark font-bold py-2.5 px-5 rounded-lg transition-colors shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined">print</span>
                    Exportar Relatório
                </button>
            </div>

            {/* Filters Section */}
            <div className="no-print bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-5 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                    {/* Period Filter */}
                    <div className={inputContainerClass}>
                        <label className={labelClass}>Período</label>
                        <div className="relative">
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className={baseInputClass}
                            >
                                <option value="Última Semana">Última Semana</option>
                                <option value="Último Mês">Último Mês</option>
                                <option value="Últimos 3 meses">Últimos 3 meses</option>
                                <option value="Últimos 6 meses">Últimos 6 meses</option>
                                <option value="Este Ano">Este Ano</option>
                                <option value="Ano Passado">Ano Passado</option>
                            </select>
                            <span className={iconClass}>date_range</span>
                        </div>
                    </div>

                    {/* Adventure Filter */}
                    <div className={inputContainerClass}>
                        <label className={labelClass}>Aventura</label>
                        <div className="relative">
                            <select
                                value={adventureFilter}
                                onChange={(e) => setAdventureFilter(e.target.value)}
                                className={baseInputClass}
                            >
                                <option value="Todas">Todas</option>
                                {uniqueAdventures.map((item: any) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                            <span className={iconClass}>kayaking</span>
                        </div>
                    </div>

                    {/* Agency Filter */}
                    <div className={inputContainerClass}>
                        <label className={labelClass}>Agência</label>
                        <div className="relative">
                            <select
                                value={agencyFilter}
                                onChange={(e) => setAgencyFilter(e.target.value)}
                                className={baseInputClass}
                            >
                                <option value="Todas">Todas</option>
                                {uniqueAgencies.map((item: any) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                            <span className={iconClass}>storefront</span>
                        </div>
                    </div>

                    {/* Payment Status Filter */}
                    <div className={inputContainerClass}>
                        <label className={labelClass}>Status Pagamento</label>
                        <div className="relative">
                            <select
                                value={paymentStatusFilter}
                                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                className={baseInputClass}
                            >
                                <option value="Todos">Todos</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Concluido">Concluido</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                            <span className={iconClass}>payments</span>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className={inputContainerClass}>
                        <label className={labelClass}>Status</label>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={baseInputClass}
                            >
                                <option value="Todos">Todos</option>
                                {uniqueStatuses.map((item: any) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                            <span className={iconClass}>info</span>
                        </div>
                    </div>



                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Receita Total" value={`€${metrics.revenue.toLocaleString()}`} change={`${metrics.revenueChange} vs. anterior`} isPositive={metrics.revenuePositive} />
                <MetricCard label="Total de Reservas" value={metrics.bookings.toString()} change={`${metrics.bookingsChange} vs. anterior`} isPositive={metrics.bookingsPositive} />
                <MetricCard label="Total de Participantes" value={metrics.participants.toString()} change={`${metrics.participantsChange} vs. anterior`} isPositive={metrics.participantsPositive} />
                <MetricCard label="Ticket Médio" value={`€${metrics.averageTicket.toFixed(2)}`} change={`${metrics.avgTicketChange} vs. anterior`} isPositive={metrics.avgTicketPositive} />
            </div>

            {/* Main Analysis Section - Two Columns Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* LEFT COLUMN (Charts & Country Stats) */}
                <div className="lg:col-span-3 flex flex-col gap-6">

                    {/* Main Chart */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tendência de Receita e Reservas</h3>
                                <p className="text-sm text-gray-500">Desempenho no período selecionado</p>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', dy: 10, fontSize: 12 }}
                                    />
                                    {/* Left Axis: Revenue */}
                                    <YAxis
                                        yAxisId="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                                    />
                                    {/* Right Axis: Bookings */}
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#102215', borderColor: '#32673f', color: '#fff', borderRadius: '0.5rem' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value, name) => [
                                            name === 'Receita' ? `€${value.toLocaleString()}` : value,
                                            name
                                        ]}
                                    />
                                    <Legend verticalAlign="top" height={36} iconType="circle" />

                                    <Bar yAxisId="left" name="Receita" dataKey="receita" fill="#13ec49" radius={[4, 4, 0, 0]} barSize={32} fillOpacity={0.8} />
                                    <Line yAxisId="right" type="monotone" name="Nº Reservas" dataKey="reservas" stroke="#ffffff" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Country Performance */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Desempenho por País</h3>
                        <div className="space-y-4">
                            {countryStats.map((stat: any) => (
                                <div key={stat.name} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{stat.flag}</span>
                                        <span className="text-gray-700 dark:text-gray-300">{stat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="font-semibold text-gray-900 dark:text-white">€{stat.value.toLocaleString()}</span>
                                        <span className="text-gray-500 w-10 text-right">{stat.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN (Breakdown & Top Stats) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Booking Status (Replaces Occupancy) */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Status das Reservas</h3>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="relative size-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bookingStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={55}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {bookingStatusData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#9ca3af'} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Centered Text */}
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">{metrics.bookings}</span>
                                    <span className="text-xs text-gray-500">Total</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {bookingStatusData.map((entry: any) => (
                                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#9ca3af' }}></div>
                                        <span className="text-gray-600 dark:text-gray-300">{entry.name} ({entry.value})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment Status Chart */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Status do Pagamento</h3>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="relative size-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={55}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {paymentStatusData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#9ca3af'} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Centered Text */}
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">{metrics.bookings}</span>
                                    <span className="text-xs text-gray-500">Total</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {paymentStatusData.map((entry: any) => (
                                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#9ca3af' }}></div>
                                        <span className="text-gray-600 dark:text-gray-300">{entry.name} ({entry.value})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Adventures */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-6 shadow-sm flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Aventuras</h3>
                        <div className="space-y-4">
                            {topAdventures.map((adv: any) => (
                                <TopAdventureRow key={adv.name} name={adv.name} count={adv.count} />
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};