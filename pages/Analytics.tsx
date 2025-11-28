import React, { useState } from 'react';
import { MetricCard, TopAdventureRow } from '../components/Metrics';
import { ComposedChart, Line, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const analyticsData = [
  { name: 'Jan', receita: 45000, reservas: 245 },
  { name: 'Fev', receita: 36000, reservas: 210 },
  { name: 'Mar', receita: 54000, reservas: 387 },
];

const occupancyData = [
  { name: 'Ocupado', value: 78 },
  { name: 'Livre', value: 22 },
];
const occupancyColors = ['#13ec49', '#1f2937']; // Primary Green vs Gray-800

// Mock options for dropdowns
const adventuresList = ['Trilho do Sol', 'Kayak no Rio', 'Escalada Montanha', 'Observação de Aves', 'Passeio de Barco', 'Tour Gastronómico', 'Trilho dos Passadiços'];
const locationsList = ['Serra de Montesinho', 'Rio Douro', 'Gerês', 'Albufeira do Azibo', 'Paiva', 'Bragança'];
const countriesList = ['Portugal', 'Espanha', 'França', 'Reino Unido'];
const agenciesList = ['Particular', 'Viagens Norte', 'GetYourGuide', 'Airbnb', 'Booking.com', 'MLTours'];

export const Analytics: React.FC = () => {
  // Filter States
  const [period, setPeriod] = useState('Últimos 3 meses');
  const [adventure, setAdventure] = useState('Todas');
  const [location, setLocation] = useState('Todas');
  const [country, setCountry] = useState('Todos');
  const [agency, setAgency] = useState('Todas');

  // Input styling classes (matching BookingsList for consistency)
  const inputContainerClass = "w-full";
  const baseInputClass = "w-full appearance-none py-2.5 bg-white dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm pl-3 pr-10 cursor-pointer";
  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 ml-1";
  const iconClass = "material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none text-gray-500 dark:text-gray-400";

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
                        value={adventure}
                        onChange={(e) => setAdventure(e.target.value)}
                        className={baseInputClass}
                    >
                        <option value="Todas">Todas</option>
                        {adventuresList.map(item => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                    <span className={iconClass}>kayaking</span>
                </div>
            </div>

            {/* Location Filter */}
            <div className={inputContainerClass}>
                <label className={labelClass}>Localização</label>
                <div className="relative">
                    <select 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={baseInputClass}
                    >
                        <option value="Todas">Todas</option>
                        {locationsList.map(item => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                    <span className={iconClass}>location_on</span>
                </div>
            </div>

            {/* Country Filter */}
            <div className={inputContainerClass}>
                <label className={labelClass}>País</label>
                <div className="relative">
                    <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={baseInputClass}
                    >
                        <option value="Todos">Todos</option>
                        {countriesList.map(item => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                    <span className={iconClass}>public</span>
                </div>
            </div>

            {/* Agency Filter */}
            <div className={inputContainerClass}>
                <label className={labelClass}>Agência</label>
                <div className="relative">
                    <select 
                        value={agency}
                        onChange={(e) => setAgency(e.target.value)}
                        className={baseInputClass}
                    >
                        <option value="Todas">Todas</option>
                        {agenciesList.map(item => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                    <span className={iconClass}>storefront</span>
                </div>
            </div>

        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Receita Total" value="€125,850" change="+18.5% vs. anterior" isPositive={true} />
        <MetricCard label="Total de Reservas" value="842" change="+12.1% vs. anterior" isPositive={true} />
        <MetricCard label="Total de Participantes" value="2,105" change="+15.3% vs. anterior" isPositive={true} />
        <MetricCard label="Ticket Médio" value="€149.46" change="+5.7% vs. anterior" isPositive={true} />
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
                        <p className="text-sm text-gray-500">Desempenho nos últimos 3 meses</p>
                    </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={analyticsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#9CA3AF', dy: 10, fontSize: 12}} 
                            />
                            {/* Left Axis: Revenue */}
                            <YAxis 
                                yAxisId="left" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#9CA3AF', fontSize: 12}}
                                tickFormatter={(value) => `€${(value/1000).toFixed(0)}k`} 
                            />
                            {/* Right Axis: Bookings */}
                            <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#9CA3AF', fontSize: 12}} 
                            />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#102215', borderColor: '#32673f', color: '#fff', borderRadius: '0.5rem'}}
                                itemStyle={{color: '#fff'}}
                                formatter={(value, name) => [
                                    name === 'Receita' ? `€${value.toLocaleString()}` : value, 
                                    name
                                ]}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            
                            <Bar yAxisId="left" name="Receita" dataKey="receita" fill="#13ec49" radius={[4, 4, 0, 0]} barSize={32} fillOpacity={0.8} />
                            <Line yAxisId="right" type="monotone" name="Nº Reservas" dataKey="reservas" stroke="#ffffff" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Country Performance (Moved here to match chart width) */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Desempenho por País</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🇵🇹</span>
                            <span className="text-gray-700 dark:text-gray-300">Portugal</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="font-semibold text-gray-900 dark:text-white">€58,200</span>
                            <span className="text-gray-500 w-10 text-right">46%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🇪🇸</span>
                            <span className="text-gray-700 dark:text-gray-300">Espanha</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="font-semibold text-gray-900 dark:text-white">€35,150</span>
                            <span className="text-gray-500 w-10 text-right">28%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🇫🇷</span>
                            <span className="text-gray-700 dark:text-gray-300">França</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="font-semibold text-gray-900 dark:text-white">€21,500</span>
                            <span className="text-gray-500 w-10 text-right">17%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🇬🇧</span>
                            <span className="text-gray-700 dark:text-gray-300">Reino Unido</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="font-semibold text-gray-900 dark:text-white">€11,000</span>
                            <span className="text-gray-500 w-10 text-right">9%</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN (Breakdown & Top Stats) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* NEW: Occupancy Rate */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Taxa de Ocupação</h3>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">+4% vs. anterior</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative size-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={occupancyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={55}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {occupancyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={occupancyColors[index % occupancyColors.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Centered Text */}
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">78%</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm">
                             <div className="w-3 h-3 rounded-full bg-primary"></div>
                             <span className="text-gray-600 dark:text-gray-300">Ocupado</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                             <div className="w-3 h-3 rounded-full bg-gray-800 dark:bg-gray-700"></div>
                             <span className="text-gray-600 dark:text-gray-300">Livre</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Participants Breakdown */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quantidade de Participantes</h3>
                <div className="space-y-4">
                    <TopAdventureRow name="Total de Participantes" count="2,105" />
                    <TopAdventureRow name="Adultos" count="1,895" />
                    <TopAdventureRow name="Crianças 5+" count="158" />
                    <TopAdventureRow name="Crianças 4-" count="52" />
                </div>
            </div>

            {/* Top Adventures */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-6 shadow-sm flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Aventuras</h3>
                <div className="space-y-4">
                     <TopAdventureRow name="Passeio de Kayak no Douro" count="287 reservas" />
                     <TopAdventureRow name="Trilho dos Passadiços" count="198 reservas" />
                     <TopAdventureRow name="Observação de Aves" count="153 reservas" />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};