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

          // Calculate Metrics
          const totalBookings = activeBookings.length;
          const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
          const pendingBookings = activeBookings.filter(b => b.status === 'Pendente').length;
          const totalParticipants = activeBookings.reduce((sum, b) => sum + (b.adults || 0) + (b.children || 0) + (b.babies || 0), 0);

          setMetrics({
            totalBookings,
            totalRevenue,
            pendingBookings,
            totalParticipants
          });

          // Calculate Occupancy Rates (Today/Upcoming)
          const today = new Date().toISOString().split('T')[0];
          const upcomingBookings = activeBookings.filter(b => b.date >= today);

          // Group by adventure to find high occupancy
          const adventureOccupancy = new Map<string, { name: string, current: number, max: number }>();

          upcomingBookings.forEach(b => {
            if (b.adventure?.max_capacity) {
              const key = `${b.adventure.id}-${b.date}-${b.time}`; // Unique slot
              const current = adventureOccupancy.get(key) || {
                name: `${b.adventure.name} (${b.date} ${b.time})`,
                current: 0,
                max: b.adventure.max_capacity
              };

              current.current += (b.adults || 0) + (b.children || 0) + (b.babies || 0);
              adventureOccupancy.set(key, current);
            }
          });

          // Filter for high occupancy (> 80%)
          const highOccupancy = Array.from(adventureOccupancy.values())
            .filter(item => (item.current / item.max) >= 0.8)
            .map(item => ({
              name: item.name,
              occupancy: item.current,
              max: item.max,
              adventureName: item.name.split(' (')[0],
              date: item.name.match(/\(([^)]+)\)/)?.[1]?.split(' ')[0] || '',
              time: item.name.match(/\(([^)]+)\)/)?.[1]?.split(' ')[1] || ''
            }))
            .sort((a, b) => (b.occupancy / b.max) - (a.occupancy / a.max));

          setAllOccupancyData(highOccupancy);
          setOccupancyData(highOccupancy.slice(0, 3)); // Top 3 for widget

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
          // This is a simplified example. Real-world would need more robust date handling.
          const currentYear = new Date().getFullYear();
          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

          const revenueByMonth = new Array(12).fill(0);
          const participantsByMonth = new Array(12).fill(0);
          const bookingsByMonth = new Array(12).fill(0);

          activeBookings.forEach(b => {
            const date = new Date(b.date);
            if (date.getFullYear() === currentYear) {
              const month = date.getMonth();
              revenueByMonth[month] += (b.total_amount || 0);
              participantsByMonth[month] += (b.adults || 0) + (b.children || 0) + (b.babies || 0);
              bookingsByMonth[month] += 1;
            }
          });

          // Combined data for ComposedChart
          const combinedData = months.map((name, i) => ({
            name,
            revenue: revenueByMonth[i],
            participants: participantsByMonth[i],
            bookings: bookingsByMonth[i]
          }));

          setChartData(combinedData);
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
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Dashboard de Reservas</h1>
          <p className="text-gray-600 dark:text-[#92c9a0] text-base font-normal">Visão geral de métricas e atividades recentes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={() => navigate('/new-booking')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background-dark font-bold text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Nova Reserva</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Reservas Totais"
          value={metrics.totalBookings.toString()}
          change="+0%" // Placeholder for change
          isPositive={true}
        />
        <MetricCard
          label="Receita Total"
          value={`€${metrics.totalRevenue.toFixed(2)}`}
          change="+0%"
          isPositive={true}
        />
        <MetricCard
          label="Reservas Pendentes"
          value={metrics.pendingBookings.toString()}
          change="Atenção"
          isPositive={false}
        />
        <MetricCard
          label="Participantes"
          value={metrics.totalParticipants.toString()}
          change="+0%"
          isPositive={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col rounded-xl border border-gray-200 dark:border-surface-border bg-[#15281A] p-6 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-white text-xl font-bold">Tendência de Receita e Reservas</h3>
              <p className="text-gray-400 text-sm font-medium">Desempenho no período selecionado</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white border-2 border-white"></span>
                <span className="text-white font-medium">Nº Reservas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#22c55e]"></span>
                <span className="text-[#22c55e] font-medium">Receita</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `€${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#102215', borderColor: '#32673f', color: '#fff', borderRadius: '0.5rem', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#9CA3AF', marginBottom: '0.25rem' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  formatter={(value: any, name: any) => {
                    if (name === 'revenue') return [`€${value}`, 'Receita'];
                    if (name === 'bookings') return [value, 'Reservas'];
                    return [value, name];
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                  fillOpacity={1}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#ffffff"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#15281A', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#ffffff' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Calendar Visual (Static for now) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* High Occupancy Alerts */}
          <div className="flex flex-col rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface-dark p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">warning</span>
                <h2 className="text-gray-900 dark:text-white text-lg font-bold">Lotação Alta</h2>
              </div>
              {allOccupancyData.length > 3 && (
                <button
                  onClick={() => setShowOccupancyModal(true)}
                  className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded hover:bg-primary/10"
                >
                  Ver Todos ({allOccupancyData.length})
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto">
              {occupancyData.length > 0 ? (
                occupancyData.map((item, index) => (
                  <div key={index} className="flex flex-col gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{item.name.split(' (')[0]}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.name.includes('(') ? item.name.split('(')[1].replace(')', '') : ''}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 flex-1 mr-2">
                        <div
                          className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((item.occupancy / item.max) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                        {item.occupancy}/{item.max} ({Math.round((item.occupancy / item.max) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  Sem alertas de lotação no momento.
                </div>
              )}
            </div>
          </div>

          {/* Calendar Widget */}
          <div className="flex flex-col rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface-dark p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-900 dark:text-white text-base font-bold">Calendário</h2>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded hover:bg-primary/10"
              >
                Ver Todos
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 mb-1.5">
              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-y-0.5 text-center text-xs font-medium text-gray-800 dark:text-gray-200">
              {/* Previous month days */}
              <span className="text-gray-400 dark:text-gray-600 flex items-center justify-center py-1">30</span>

              {/* Current month days (July 2024 has 31 days) */}
              {[...Array(31)].map((_, i) => getDayContent(i + 1))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface-dark overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-surface-border flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white text-lg font-bold">Reservas Recentes</h2>
          <div className="flex gap-4 text-sm font-medium items-center">
            <button
              onClick={() => setActiveTab('current')}
              className={`${activeTab === 'current' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} transition-colors pb-1`}
            >
              Recentes
            </button>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button
              onClick={() => navigate('/new-booking')}
              className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors pb-1"
            >
              <span>Todas as Reservas</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
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
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1a1d21] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-100 dark:border-gray-800 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-500">warning</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alertas de Lotação Alta</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{allOccupancyData.length} slots com ≥80% de ocupação</p>
                </div>
              </div>
              <button
                onClick={() => setShowOccupancyModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-gray-500">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-6">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-black/20 text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider font-semibold sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Passeio</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Horário</th>
                    <th className="px-4 py-3">Ocupação</th>
                    <th className="px-4 py-3 text-right">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {allOccupancyData.map((item, index) => {
                    const percentage = Math.round((item.occupancy / item.max) * 100);
                    const isFull = percentage >= 100;

                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {item.adventureName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {formatDatePT(item.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {item.time}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 min-w-[80px]">
                              <div
                                className={`h-2 rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-orange-500'}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {item.occupancy}/{item.max}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${isFull
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                            }`}>
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {allOccupancyData.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-4xl opacity-50 mb-2">check_circle</span>
                  <p>Nenhum alerta de lotação alta no momento.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowOccupancyModal(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};