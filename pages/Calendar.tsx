import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock Data for Calendar Events
const events = [
  { id: '12345', title: 'Trilho do Sol', date: '2024-07-15', type: 'Hiking', participants: 2, time: '09:00', value: 350 },
  { id: '12346', title: 'Kayak no Rio', date: '2024-07-18', type: 'Water', participants: 4, time: '14:30', value: 420 },
  { id: '12347', title: 'Escalada Montanha', date: '2024-07-20', type: 'Adventure', participants: 3, time: '08:00', value: 500 },
  { id: '12348', title: 'Observação de Aves', date: '2024-07-22', type: 'Nature', participants: 1, time: '07:00', value: 150 },
  { id: '12349', title: 'Passeio de Barco', date: '2024-07-25', type: 'Water', participants: 2, time: '10:00', value: 200 },
  { id: '12350', title: 'Trilho do Sol', date: '2024-07-28', type: 'Hiking', participants: 4, time: '09:30', value: 700 },
  { id: '12351', title: 'Kayak no Rio', date: '2024-07-30', type: 'Water', participants: 2, time: '15:00', value: 210 },
  { id: '12352', title: 'Trilho dos Passadiços', date: '2024-08-01', type: 'Hiking', participants: 2, time: '08:30', value: 180 },
  { id: '12353', title: 'Tour Gastronómico', date: '2024-08-02', type: 'Culture', participants: 2, time: '12:00', value: 250 },
  { id: '12354', title: 'Passeio de Barco', date: '2024-08-03', type: 'Water', participants: 3, time: '16:00', value: 300 },
];

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'Water': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border-l-2 border-blue-500';
    case 'Hiking': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200 border-l-2 border-green-500';
    case 'Adventure': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200 border-l-2 border-orange-500';
    case 'Culture': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 border-l-2 border-purple-500';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-l-2 border-gray-500';
  }
};

export const Calendar: React.FC = () => {
  const navigate = useNavigate();
  // State for current displayed month
  const [currentDate, setCurrentDate] = useState(new Date(2024, 6, 1)); // Default to July 2024 to match data

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return events.filter(e => e.date === dateStr);
  };

  // Calculate Monthly Totals
  const currentMonthEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
  });

  const totalTours = currentMonthEvents.length;
  const totalPax = currentMonthEvents.reduce((acc, curr) => acc + curr.participants, 0);
  const totalRevenue = currentMonthEvents.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Calendário de Aventuras</h1>
          <p className="text-gray-600 dark:text-[#92c9a0] text-base font-normal mt-1">Planejamento e visualização de passeios.</p>
        </div>
        <div className="flex items-center gap-3">
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Calendar Area */}
        <div className="flex-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl shadow-sm flex flex-col">
            
            {/* Calendar Controls */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-surface-border">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white w-40">
                        {monthNames[currentDate.getMonth()]} <span className="text-gray-500">{currentDate.getFullYear()}</span>
                    </h2>
                    <div className="flex items-center rounded-md border border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-black/20">
                        <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-l-md transition-colors text-gray-600 dark:text-gray-300">
                            <span className="material-symbols-outlined text-xl">chevron_left</span>
                        </button>
                        <button onClick={handleToday} className="px-3 py-1 text-sm font-medium border-x border-gray-200 dark:border-surface-border hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
                            Hoje
                        </button>
                        <button onClick={handleNextMonth} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-r-md transition-colors text-gray-600 dark:text-gray-300">
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="w-full">
                <div className="grid grid-cols-7 min-w-[800px]">
                    {/* Days Header */}
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-black/20 border-b border-gray-200 dark:border-surface-border">
                            {day}
                        </div>
                    ))}

                    {/* Empty cells for previous month */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[110px] bg-gray-50/50 dark:bg-black/10 border-b border-r border-gray-200 dark:border-surface-border"></div>
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayEvents = getEventsForDay(day);
                        const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

                        return (
                            <div key={day} className={`min-h-[110px] p-1.5 border-b border-r border-gray-200 dark:border-surface-border hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative group`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-background-dark font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {day}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <span className="text-[9px] text-gray-400 font-medium">{dayEvents.length}</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    {dayEvents.map(event => (
                                        <div 
                                            key={event.id} 
                                            onClick={(e) => { e.stopPropagation(); navigate(`/bookings/${event.id}`); }}
                                            className={`text-[9px] px-1 py-0.5 rounded border-l-2 truncate cursor-pointer hover:opacity-80 transition-opacity ${getEventTypeColor(event.type)}`}
                                            title={`${event.time} - ${event.title}`}
                                        >
                                            <span className="font-bold mr-1">{event.time}</span>
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                                {/* Add Button on Hover */}
                                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-primary hover:text-background-dark text-gray-500 dark:text-gray-400 transition-colors">
                                        <span className="material-symbols-outlined text-sm block">add</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Fill remaining cells to complete the grid if needed */}
                     {Array.from({ length: (7 - (daysInMonth + firstDayOfMonth) % 7) % 7 }).map((_, i) => (
                        <div key={`empty-end-${i}`} className="min-h-[110px] bg-gray-50/50 dark:bg-black/10 border-b border-r border-gray-200 dark:border-surface-border"></div>
                    ))}
                </div>
            </div>
        </div>

        {/* Sidebar Summary (Visible on Large Screens) */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
            
            {/* Quick Stats - Resumo do Mês */}
            <div className="bg-primary/10 dark:bg-primary/5 border border-primary/20 rounded-xl p-4">
                 <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                    Resumo do Mês
                 </h3>
                 <div className="flex justify-between items-center mb-2 pb-2 border-b border-primary/10">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Total de Passeios</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{totalTours}</span>
                 </div>
                 <div className="flex justify-between items-center mb-2 pb-2 border-b border-primary/10">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Total de Pessoas</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{totalPax}</span>
                 </div>
                 <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Receita Total</span>
                    <span className="text-base font-black text-green-600 dark:text-primary">€{totalRevenue.toLocaleString('pt-PT')}</span>
                 </div>
            </div>

            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-4 shadow-sm flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Próximos Eventos</h3>
                <div className="flex flex-col gap-4 flex-1">
                    {/* Events Slice reduced to 5 and gap adjusted for coherence */}
                    {events.slice(0, 5).map(event => (
                        <div 
                            key={event.id} 
                            onClick={() => navigate(`/bookings/${event.id}`)}
                            className="flex gap-3 items-center pb-3 border-b border-gray-100 dark:border-white/5 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded-lg transition-colors"
                        >
                            <div className="flex flex-col items-center bg-gray-100 dark:bg-white/10 rounded-lg p-1.5 min-w-[45px]">
                                <span className="text-[10px] font-bold text-primary-dark dark:text-primary uppercase">{new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">{new Date(event.date).getDate()}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight hover:text-primary transition-colors truncate max-w-[150px]">{event.title}</h4>
                                <div className="flex gap-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                                        {event.time}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">group</span>
                                        {event.participants}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button 
                  onClick={() => navigate('/bookings')}
                  className="w-full mt-auto py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                    Ver Todos
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};