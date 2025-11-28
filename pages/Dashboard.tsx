import React, { useState } from 'react';
import { MetricCard } from '../components/Metrics';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

import { mockBookings, mockMetrics, revenueData, participantsData, calendarEvents } from '../services/mockData';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'current' | 'next'>('current');

  const getDayContent = (day: number) => {
    // Assuming July 2024 for the visual
    const dateStr = `2024-07-${String(day).padStart(2, '0')}`;
    const event = calendarEvents.find(e => e.date === dateStr);

    let className = "py-1.5 flex items-center justify-center cursor-pointer rounded-md transition-all text-sm ";

    if (event) {
      switch (event.type) {
        case 'water':
          className += "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60";
          break;
        case 'hiking':
          className += "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-200 font-bold hover:bg-green-200 dark:hover:bg-green-900/60";
          break;
        case 'adventure':
          className += "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-200 font-bold hover:bg-orange-200 dark:hover:bg-orange-900/60";
          break;
        default:
          className += "bg-gray-200 dark:bg-gray-700 font-bold";
      }
    } else {
      className += "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300";
    }

    return (
      <div key={day} onClick={() => navigate('/calendar')} className={className}>
        {day}
      </div>
    );
  };

  // Helper to generate dates relative to today
  const getFutureDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('pt-PT');
  };

  const displayedBookings = activeTab === 'current'
    ? mockBookings.slice(0, 5)
    : mockBookings.slice(5, 10);


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
          <a
            href="https://naturisnor.com/naturisnorreservas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold tracking-wide gap-2 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Nova Reserva</span>
          </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric, index) => (
          <MetricCard
            key={index}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            isPositive={metric.isPositive}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="flex flex-col rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface-dark p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Valor Total da Reserva</p>
              <div className="flex items-end gap-2">
                <p className="text-gray-900 dark:text-white text-2xl font-bold">€18.500</p>
                <span className="text-primary text-xs font-bold mb-1.5">+15.2%</span>
              </div>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#13ec49" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#13ec49" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    dy={10}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#102215', borderColor: '#32673f', color: '#fff', borderRadius: '0.5rem', fontSize: '12px' }}
                    itemStyle={{ color: '#13ec49' }}
                    labelStyle={{ color: '#9CA3AF', marginBottom: '0.25rem' }}
                    cursor={{ stroke: '#32673f', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#13ec49" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Participants Chart */}
          <div className="flex flex-col rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface-dark p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Número de Participantes</p>
              <div className="flex items-end gap-2">
                <p className="text-gray-900 dark:text-white text-2xl font-bold">289</p>
                <span className="text-primary text-xs font-bold mb-1.5">+12.5%</span>
              </div>
            </div>
            <div className="h-48 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participantsData}>
                  <Bar dataKey="value" fill="#13ec49" radius={[4, 4, 0, 0]} barSize={32} fillOpacity={0.6} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Occupancy Calendar Visual (Dynamic Representation) */}
        <div className="lg:col-span-1 flex flex-col rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface-dark p-6 shadow-sm h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 dark:text-white text-lg font-bold">Calendário</h2>
            <button
              onClick={() => navigate('/calendar')}
              className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded hover:bg-primary/10"
            >
              Ver Todos
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
            <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
          </div>
          <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-medium text-gray-800 dark:text-gray-200">
            {/* Previous month days */}
            <span className="text-gray-400 dark:text-gray-600 flex items-center justify-center py-1.5">30</span>

            {/* Current month days (July 2024 has 31 days) */}
            {[...Array(31)].map((_, i) => getDayContent(i + 1))}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface-dark overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-surface-border flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white text-lg font-bold">Visão Geral das Reservas</h2>
          <div className="flex gap-4 text-sm font-medium items-center">
            <button
              onClick={() => setActiveTab('current')}
              className={`${activeTab === 'current' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} transition-colors pb-1`}
            >
              Atuais
            </button>
            <button
              onClick={() => setActiveTab('next')}
              className={`${activeTab === 'next' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} transition-colors pb-1`}
            >
              Próximas
            </button>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button
              onClick={() => navigate('/bookings')}
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
                <th className="px-6 py-4">Início</th>
                <th className="px-6 py-4">Fim</th>
                <th className="px-6 py-4 text-center">Part.</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
              {displayedBookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{booking.startDate}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{booking.clientName}</td>
                  <td className="px-6 py-4">{booking.adventureName}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{booking.startDate}</td>
                  <td className="px-6 py-4">{booking.endDate}</td>
                  <td className="px-6 py-4 text-center">{booking.participants}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">€{booking.totalValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};