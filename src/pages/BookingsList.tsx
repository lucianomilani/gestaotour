import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDatePT } from '../utils/dateFormat';
import { supabase } from '../services/supabase';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { getCountryFlag } from '../utils/countryFlags';

export const BookingsList: React.FC = () => {
    const navigate = useNavigate();
    const { canEdit } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [allAdventures, setAllAdventures] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters State
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('Todos');
    const [adventureFilter, setAdventureFilter] = useState('Todas');
    const [agencyFilter, setAgencyFilter] = useState('Todas');
    const [countryFilter, setCountryFilter] = useState('Todos');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, []);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, paymentStatusFilter, adventureFilter, agencyFilter, countryFilter, startDate, endDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select(`
                    *,
                    agency: agencies(name),
                    adventure: adventures(name)
                `)
                .order('created_at', { ascending: false });

            if (bookingsError) throw bookingsError;

            const mappedBookings: Booking[] = (bookingsData || []).map(item => ({
                id: item.id,
                clientName: item.client_name,
                clientEmail: item.client_email,
                clientPhone: item.client_phone,
                clientNif: item.client_nif,
                city: item.client_city,
                country: item.client_country,
                adventureName: item.adventure?.name || 'Desconhecida',
                agency: item.agency?.name || 'Particular',
                startDate: item.date,
                time: item.time,
                adults: item.adults,
                children: item.children,
                babies: item.babies,
                participants: (item.adults || 0) + (item.children || 0) + (item.babies || 0),
                status: item.status,
                paymentStatus: item.payment_status,
                totalValue: item.total_amount,
                deposit: item.deposit_amount,
                notes: item.notes,
                location: item.client_city,
                endDate: item.date
            }));

            setBookings(mappedBookings);

            // Extract unique adventures
            const adventures = Array.from(new Set(mappedBookings.map(b => b.adventureName))).sort();
            setAllAdventures(adventures);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Confirmada': return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300';
            case 'Pendente': return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300';
            case 'Cancelada': return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
            case 'Concluída': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'Concluido':
            case 'Concluído':
                return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
            case 'Pendente':
                return 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700';
            case 'Parcial':
                return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
            case 'Cancelado':
                return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
        }
    };

    // Filter Logic
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.clientEmail && booking.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'Todos' || booking.status === statusFilter;
        const matchesPayment = paymentStatusFilter === 'Todos' || booking.paymentStatus === paymentStatusFilter;
        const matchesAdventure = adventureFilter === 'Todas' || booking.adventureName === adventureFilter;
        const matchesAgency = agencyFilter === 'Todas' || booking.agency === agencyFilter;
        const matchesCountry = countryFilter === 'Todos' || booking.country === countryFilter;

        // Date Range Filter
        let matchesDate = true;
        if (startDate && endDate) {
            const bookingDate = new Date(booking.startDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);
            matchesDate = bookingDate >= start && bookingDate <= end;
        } else if (startDate) {
            const bookingDate = new Date(booking.startDate);
            const start = new Date(startDate);
            matchesDate = bookingDate >= start;
        } else if (endDate) {
            const bookingDate = new Date(booking.startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = bookingDate <= end;
        }

        return matchesSearch && matchesStatus && matchesPayment && matchesAdventure && matchesAgency && matchesCountry && matchesDate;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredBookings.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Unique values for filters
    const uniqueAgencies = Array.from(new Set(bookings.map(b => b.agency))).sort();
    const uniqueCountries = Array.from(new Set(bookings.map(b => b.country).filter(Boolean))).sort();

    const inputContainerClass = "flex flex-col gap-1";
    const labelClass = "text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide";
    const inputClass = "w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reservas</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie todas as reservas do sistema.</p>
                </div>
                <button
                    onClick={() => navigate('/bookings/new')}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nova Reserva
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-200 dark:border-surface-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Row 1 */}
                    <div className={inputContainerClass}>
                        <label className={labelClass}>Pesquisar</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Nome, Email ou ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`${inputClass} pl-9`}
                            />
                        </div>
                    </div>

                    <div className={inputContainerClass}>
                        <label className={labelClass}>Aventura</label>
                        <select
                            value={adventureFilter}
                            onChange={(e) => setAdventureFilter(e.target.value)}
                            className={inputClass}
                        >
                            <option value="Todas">Todas as Aventuras</option>
                            {allAdventures.map(adv => (
                                <option key={adv} value={adv}>{adv}</option>
                            ))}
                        </select>
                    </div>

                    <div className={inputContainerClass}>
                        <label className={labelClass}>Data Início</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className={inputContainerClass}>
                        <label className={labelClass}>Data Fim</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    {/* Row 2 */}
                    <div className={inputContainerClass}>
                        <label className={labelClass}>Agência</label>
                        <select
                            value={agencyFilter}
                            onChange={(e) => setAgencyFilter(e.target.value)}
                            className={inputClass}
                        >
                            <option value="Todas">Todas as Agências</option>
                            {uniqueAgencies.map(agency => (
                                <option key={agency} value={agency}>{agency}</option>
                            ))}
                        </select>
                    </div>

                    <div className={inputContainerClass}>
                        <label className={labelClass}>País</label>
                        <select
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className={inputClass}
                        >
                            <option value="Todos">Todos os Países</option>
                            {uniqueCountries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>

                    <div className={inputContainerClass}>
                        <label className={labelClass}>Estado Pagamento</label>
                        <select
                            value={paymentStatusFilter}
                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                            className={inputClass}
                        >
                            <option value="Todos">Todos</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Parcial">Parcial</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </div>

                    <div className={inputContainerClass}>
                        <label className={labelClass}>Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={inputClass}
                        >
                            <option value="Todos">Todos</option>
                            <option value="Confirmada">Confirmada</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Concluída">Concluída</option>
                            <option value="Cancelada">Cancelada</option>
                        </select>
                    </div>
                </div>

                {/* Clear Filters Button (Visible only if filters are active) */}
                {(startDate || endDate || statusFilter !== 'Todos' || searchTerm !== '' || agencyFilter !== 'Todas' || paymentStatusFilter !== 'Todos' || countryFilter !== 'Todos' || adventureFilter !== 'Todas') && (
                    <div className="flex justify-end mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                        <button
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setSearchTerm('');
                                setStatusFilter('Todos');
                                setPaymentStatusFilter('Todos');
                                setAgencyFilter('Todas');
                                setAdventureFilter('Todas');
                                setCountryFilter('Todos');
                            }}
                            className="text-xs font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Limpar Filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-surface-border">
                                <th className="px-3 py-3 whitespace-nowrap">ID</th>
                                <th className="px-3 py-3 whitespace-nowrap">Cliente</th>
                                <th className="px-3 py-3 whitespace-nowrap">Agência</th>
                                <th className="px-3 py-3 whitespace-nowrap">Aventura</th>
                                <th className="px-3 py-3 whitespace-nowrap">Data</th>
                                <th className="px-3 py-3 whitespace-nowrap">Hora</th>
                                <th className="px-3 py-3 text-center whitespace-nowrap">País</th>
                                <th className="px-3 py-3 text-center whitespace-nowrap">Pax</th>
                                <th className="px-3 py-3 whitespace-nowrap">Pagamento</th>
                                <th className="px-3 py-3 whitespace-nowrap">Status</th>
                                <th className="px-3 py-3 text-right whitespace-nowrap">Valor</th>
                                <th className="no-print px-3 py-3 text-center whitespace-nowrap">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
                            {currentBookings.length > 0 ? (
                                currentBookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-3 py-3 cursor-pointer" onClick={() => navigate(`/bookings/${booking.id}`)}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(booking.id);
                                                    // Optional: Show a toast notification here
                                                }}
                                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors group/id"
                                                title={`ID: ${booking.id}\nClique para copiar`}
                                            >
                                                <span className="material-symbols-outlined text-base text-gray-600 dark:text-gray-400 group-hover/id:text-primary">
                                                    tag
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-3 py-3 cursor-pointer" onClick={() => navigate(`/bookings/${booking.id}`)}>
                                            <div className="flex items-center gap-2 max-w-[160px]">
                                                <div className="size-6 shrink-0 rounded-full bg-primary/20 text-primary-dark dark:text-primary flex items-center justify-center text-[10px] font-bold">
                                                    {booking.clientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={booking.clientName}>{booking.clientName}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium truncate max-w-[100px] ${booking.agency === 'Particular' ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'}`} title={booking.agency}>
                                                {booking.agency || '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[130px] truncate" title={booking.adventureName}>{booking.adventureName}</td>
                                        <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">{formatDatePT(booking.startDate)}</td>
                                        <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">{booking.time || '-'}</td>
                                        <td className="px-3 py-3 text-center">
                                            <span className="text-lg" title={booking.country || 'Desconhecido'}>
                                                {getCountryFlag(booking.country || '')}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white font-medium text-center">{booking.participants}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${getPaymentStatusColor(booking.paymentStatus || 'Pendente')}`}>
                                                <span className="material-symbols-outlined text-xs">payments</span>
                                                {booking.paymentStatus || 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusStyle(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-sm font-bold text-gray-900 dark:text-white text-right whitespace-nowrap">€{booking.totalValue}</td>
                                        <td className="no-print px-3 py-3">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/bookings/${booking.id}`);
                                                    }}
                                                    className="p-1 text-gray-500 hover:text-primary transition-colors"
                                                    title="Ver detalhes"
                                                >
                                                    <span className="material-symbols-outlined text-base">visibility</span>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/bookings/${booking.id}?mode=edit`);
                                                    }}
                                                    className="p-1 text-gray-500 hover:text-primary transition-colors"
                                                    title="Editar reserva"
                                                >
                                                    <span className="material-symbols-outlined text-base">edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={12} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl opacity-50">search_off</span>
                                            <p>Nenhuma reserva encontrada com os filtros atuais.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-surface-border flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Mostrando <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> a <span className="font-medium text-gray-900 dark:text-white">{Math.min(endIndex, filteredBookings.length)}</span> de <span className="font-medium text-gray-900 dark:text-white">{filteredBookings.length}</span> resultados
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-200 dark:border-surface-border rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Anterior
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${currentPage === page
                                            ? 'bg-primary text-white'
                                            : 'border border-gray-200 dark:border-surface-border hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm border border-gray-200 dark:border-surface-border rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
