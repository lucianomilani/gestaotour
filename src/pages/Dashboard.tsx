import React, { useState, useEffect } from 'react';
import { MetricCard } from '../components/Metrics';
import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { formatDatePT } from '../utils/dateFormat';
import { getCountryFlag } from '../utils/countryFlags';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'current' | 'next'>('current');
    const [loading, setLoading] = useState(true);

    // Metrics State
    const [metrics, setMetrics] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        pendingBookings: 0,
        totalParticipants: 0
    });

    // Data State
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [allBookings, setAllBookings] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    // Occupancy State
    const [occupancyData, setOccupancyData] = useState<{ name: string, occupancy: number, max: number }[]>([]);
    const [allOccupancyData, setAllOccupancyData] = useState<{ name: string, occupancy: number, max: number, adventureName: string, date: string, time: string }[]>([]);
    const [showOccupancyModal, setShowOccupancyModal] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all bookings for metrics and charts
                const { data: bookings, error } = await supabase
                    .from('bookings')
                    .select(`
                        *,
                        adventure:adventures(id, name, duration, max_capacity)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (bookings) {
                    // Filter out cancelled bookings
                    const activeBookings = bookings.filter(b => b.status !== 'Cancelada');
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();

                    // Calculate Metrics
                    const totalRev = activeBookings.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
                    const pending = activeBookings.filter(b => b.status === 'Pendente').length;
                    const participants = activeBookings.reduce((acc, curr) => acc + (curr.adults || 0) + (curr.children || 0) + (curr.babies || 0), 0);

                    setMetrics({
                        totalBookings: activeBookings.length,
                        totalRevenue: totalRev,
                        pendingBookings: pending,
                        totalParticipants: participants
                    });

                    // Prepare Recent Bookings (Top 5, excluding cancelled)
                    const recent = activeBookings.slice(0, 5).map(b => ({
                        id: b.id,
                        startDate: formatDatePT(b.date),
                        clientName: b.client_name,
                        adventureName: b.adventure?.name || 'N/A',
                        time: b.time || 'N/A',
                        country: b.client_country || 'Desconhecido',
                        countryFlag: getCountryFlag(b.client_country || ''),
                        participants: (b.adults || 0) + (b.children || 0) + (b.babies || 0),
                        totalValue: b.total_amount?.toFixed(2) || '0.00'
                    }));

                    setRecentBookings(recent);
                    setAllBookings(activeBookings); // Store all bookings for calendar

                    // Prepare Chart Data (Simple aggregation by month for current year)
                    const monthlyData = Array(12).fill(0).map((_, i) => ({
                        name: new Date(0, i).toLocaleString('pt-PT', { month: 'short' }),
                        reservas: 0,
                        receita: 0
                    }));

                    activeBookings.forEach(b => {
                        const date = new Date(b.date);
                        if (date.getFullYear() === currentYear) {
                            const month = date.getMonth();
                            monthlyData[month].reservas += 1;
                            monthlyData[month].receita += (b.total_amount || 0);
                        }
                    });

                    setChartData(monthlyData);

                    // Calculate Occupancy
                    const occupancyMap = new Map<string, { current: number, max: number, adventureName: string, date: string, time: string }>();

                    activeBookings.forEach(b => {
                        if (b.adventure && b.date && b.time) {
                            const key = `${b.adventure.name}-${b.date}-${b.time}`;
                            const current = occupancyMap.get(key) || {
                                current: 0,
                                max: b.adventure.max_capacity || 0,
                                adventureName: b.adventure.name,
                                date: b.date,
                                time: b.time
                            };
                            current.current += (b.adults || 0) + (b.children || 0); // Babies usually don't count for capacity
                            occupancyMap.set(key, current);
                        }
                    });

                    const occupancyList = Array.from(occupancyMap.entries())
                        .map(([name, data]) => ({
                            name: data.adventureName,
                            occupancy: data.current,
                            max: data.max,
                            adventureName: data.adventureName,
                            date: data.date,
                            time: data.time
                        }))
                        .sort((a, b) => (b.occupancy / b.max) - (a.occupancy / a.max));

                    setAllOccupancyData(occupancyList);
                    setOccupancyData(occupancyList.slice(0, 3)); // Top 3 highest occupancy
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Helper for calendar visual - now dynamic with booking data
    const getDayContent = (day: number) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Create date string for this day
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Count bookings for this date
        const bookingsOnDate = allBookings.filter(b => b.date === dateStr).length;

        // Determine if it's today
        const isToday = day === today.getDate() && currentMonth === today.getMonth();

        // Build className based on booking status
        let className = "py-1 flex items-center justify-center cursor-pointer rounded-md transition-all text-xs relative ";

        if (isToday) {
            className += "bg-primary text-background-dark font-bold ";
        } else if (bookingsOnDate > 0) {
            className += "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-semibold hover:bg-orange-200 dark:hover:bg-orange-900/50 ";
        } else {
            className += "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 ";
        }

        return (
            <div key={day} onClick={() => navigate(`/calendar?date=${dateStr}`)} className={className}>
                {day}
                {bookingsOnDate > 0 && !isToday && (
                    <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-orange-500 rounded-full"></span>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Bem-vindo ao painel de controle da Naturisnor.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/bookings/new')}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Nova Reserva
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total de Reservas"
                    value={metrics.totalBookings.toString()}
                    icon="confirmation_number"
                    trend="+12%"
                    trendUp={true}
                    color="blue"
                />
                <MetricCard
                    title="Receita Total"
                    value={`€${metrics.totalRevenue.toFixed(2)}`}
                    icon="payments"
                    trend="+8%"
                    trendUp={true}
                    color="green"
                />
                <MetricCard
                    title="Reservas Pendentes"
                    value={metrics.pendingBookings.toString()}
                    icon="pending_actions"
                    trend="-2%"
                    trendUp={true}
                    color="orange"
                />
                <MetricCard
                    title="Total Participantes"
                    value={metrics.totalParticipants.toString()}
                    icon="groups"
                    trend="+15%"
                    trendUp={true}
                    color="purple"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-surface-border">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Desempenho de Reservas</h2>
                        <div className="flex bg-gray-100 dark:bg-black/20 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('current')}
                                className={`px-3 py-1 text-sm rounded-md transition-all ${activeTab === 'current' ? 'bg-white dark:bg-surface-light shadow-sm text-primary font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                            >
                                Este Ano
                            </button>
                            <button
                                onClick={() => setActiveTab('next')}
                                className={`px-3 py-1 text-sm rounded-md transition-all ${activeTab === 'next' ? 'bg-white dark:bg-surface-light shadow-sm text-primary font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                            >
                                Ano Passado
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00A651" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#00A651" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-white/10" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    yAxisId="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: '#374151' }}
                                />
                                <Legend iconType="circle" />
                                <Bar yAxisId="left" dataKey="reservas" name="Nº Reservas" fill="#00A651" radius={[4, 4, 0, 0]} barSize={30} />
                                <Line yAxisId="right" type="monotone" dataKey="receita" name="Receita" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Side Widgets */}
                <div className="space-y-6">
                    {/* Occupancy Widget */}
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-surface-border">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500">warning</span>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lotação Alta</h2>
                            </div>
                            <button
                                onClick={() => setShowOccupancyModal(true)}
                                className="text-sm text-primary hover:text-primary-dark font-medium"
                            >
                                Ver Todos ({allOccupancyData.length})
                            </button>
                        </div>
                        <div className="space-y-4">
                            {occupancyData.length > 0 ? (
                                occupancyData.map((item, index) => (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.date} {item.time}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-black/20 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${(item.occupancy / item.max) >= 1 ? 'bg-red-500' :
                                                        (item.occupancy / item.max) >= 0.8 ? 'bg-orange-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${Math.min((item.occupancy / item.max) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>{Math.round((item.occupancy / item.max) * 100)}% ocupado</span>
                                            <span className="font-mono">{item.occupancy}/{item.max}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma lotação crítica.</p>
                            )}
                        </div>
                    </div>

                    {/* Calendar Widget */}
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-surface-border">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Calendário</h2>
                            <button onClick={() => navigate('/calendar')} className="text-sm text-primary hover:text-primary-dark font-medium">Ver Todos</button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                <div key={i} className="text-xs font-medium text-gray-400 uppercase">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => getDayContent(day))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reservas Recentes</h2>
                    <button onClick={() => navigate('/bookings')} className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                        Todas as Reservas
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-black/20 text-gray-700 dark:text-gray-200 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Data da Reserva</th>
                                <th className="px-6 py-4">Nome do Cliente</th>
                                <th className="px-6 py-4">Aventura</th>
                                <th className="px-6 py-4">Hora</th>
                                <th className="px-6 py-4 text-center">País</th>
                                <th className="px-6 py-4 text-center">Pax</th>
                                <th className="px-6 py-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
                            {recentBookings.length > 0 ? (
                                recentBookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/bookings/${booking.id}`)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">{booking.startDate}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{booking.clientName}</td>
                                        <td className="px-6 py-4">{booking.adventureName}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono">{booking.time}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg" title={booking.country}>{booking.countryFlag}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">{booking.participants}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">€{booking.totalValue}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Nenhuma reserva recente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Occupancy Modal */}
            {showOccupancyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-surface-border flex justify-between items-center sticky top-0 bg-white dark:bg-surface-dark z-10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500">warning</span>
                                Lotação Detalhada
                            </h2>
                            <button
                                onClick={() => setShowOccupancyModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {allOccupancyData.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{item.adventureName}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDatePT(item.date)} às {item.time}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${(item.occupancy / item.max) >= 1 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                (item.occupancy / item.max) >= 0.8 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {Math.round((item.occupancy / item.max) * 100)}%
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-black/20 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-500 ${(item.occupancy / item.max) >= 1 ? 'bg-red-500' :
                                                    (item.occupancy / item.max) >= 0.8 ? 'bg-orange-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${Math.min((item.occupancy / item.max) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>{item.occupancy} participantes</span>
                                        <span>Capacidade: {item.max}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
