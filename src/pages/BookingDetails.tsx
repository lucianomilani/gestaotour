import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { Adventure, Agency, PaymentMethod } from '../types';
import { countries } from '../utils/countries';
import { fetchActivePaymentMethods } from '../services/paymentMethodsService';

export const BookingDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showModal } = useModal();
    const { showToast } = useToast();
    const isNew = id === 'new';
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'view';
    const isEditMode = mode === 'edit' || !id; // Edit mode if explicitly set or if creating new (no ID)
    const isNewBooking = !id;

    // State for dropdowns
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [adventures, setAdventures] = useState<Adventure[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial State
    const initialBookingData = {
        id: '',
        status: 'Pendente',
        submissionDate: new Date().toISOString(),
        adventure: {
            id: '',
            name: '',
            location: '',
            meetingPoint: '',
            date: new Date().toISOString().split('T')[0],
            time: '',
            duration: '',
            driver: 'Por definir',
        },
        client: {
            name: '',
            nif: '',
            email: '',
            phone: '',
            city: '',
            country: 'Portugal'
        },
        participants: {
            total: 0,
            children: 0,
            babies: 0,
            adults: 0
        },
        agency: {
            id: '',
            name: 'Particular',
            email: '',
            fee: 0
        },
        financial: {
            totalReserve: 0,
            netTotal: 0,
            paymentType: 'Transferência Bancária',
            paymentMethodId: '',
            paymentMethodName: '',
            paymentStatus: 'Pendente',
            notes: '',
            deposit: 0
        },
        googleCalendarLink: ''
    };

    const [bookingData, setBookingData] = useState(initialBookingData);

    // Fetch Data (Agencies, Adventures, Booking)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Agencies
                const { data: agenciesData } = await supabase
                    .from('agencies')
                    .select('*')
                    .eq('is_active', true);

                const mappedAgencies = (agenciesData || []).map(a => ({
                    id: a.id,
                    name: a.name,
                    email: a.email,
                    commission: a.fee
                }));
                setAgencies(mappedAgencies);

                // Fetch Adventures
                const { data: adventuresData } = await supabase
                    .from('adventures')
                    .select('*')
                    .eq('is_active', true);

                const mappedAdventures = (adventuresData || []).map(a => ({
                    id: a.id,
                    name: a.name,
                    location: a.location,
                    duration: a.duration,
                    priceAdult: a.price_adult,
                    priceChild: a.price_child,
                    priceBaby: a.price_baby,
                    highSeason: {
                        start: a.high_season_start,
                        end: a.high_season_end,
                        times: a.high_season_times || []
                    },
                    lowSeason: {
                        start: a.low_season_start,
                        end: a.low_season_end,
                        times: a.low_season_times || []
                    }
                }));
                setAdventures(mappedAdventures);

                // Fetch Payment Methods
                const paymentMethodsData = await fetchActivePaymentMethods();
                setPaymentMethods(paymentMethodsData);

                // Fetch Booking if ID exists and is not 'new'
                if (id && id !== 'new') {
                    console.log('Fetching booking with ID:', id);
                    const { data: booking, error } = await supabase
                        .from('bookings')
                        .select(`
                            *,
                            agency:agencies(id, name, email, fee),
                            adventure:adventures(id, name, location, meeting_point, duration, high_season_start, high_season_end, high_season_times, low_season_start, low_season_end, low_season_times),
                            payment_method:payment_methods(id, name, code)
                        `)
                        .eq('id', id)
                        .single();

                    if (error) {
                        console.error('Supabase error:', error);
                        showToast(`Erro ao carregar reserva: ${error.message}`, 'error');
                        navigate('/bookings');
                        return;
                    }

                    console.log('Booking data received:', booking);

                    if (booking) {
                        setBookingData({
                            id: booking.id,
                            status: booking.status,
                            submissionDate: booking.created_at,
                            adventure: {
                                id: booking.adventure_id,
                                name: booking.adventure?.name || '',
                                location: booking.adventure?.location || '',
                                meetingPoint: booking.meeting_point || booking.adventure?.meeting_point || '',
                                date: booking.date,
                                time: booking.time,
                                duration: booking.adventure?.duration || '',
                                driver: 'Por definir', // Not in DB yet
                            },
                            client: {
                                name: booking.client_name,
                                nif: booking.client_nif || '',
                                email: booking.client_email,
                                phone: booking.client_phone,
                                city: booking.client_city,
                                country: booking.client_country
                            },
                            participants: {
                                total: (booking.adults || 0) + (booking.children || 0) + (booking.babies || 0),
                                adults: booking.adults || 0,
                                children: booking.children || 0,
                                babies: booking.babies || 0
                            },
                            agency: {
                                id: booking.agency_id || '',
                                name: booking.agency?.name || 'Particular',
                                email: booking.agency?.email || '',
                                fee: booking.agency?.fee || 0
                            },
                            financial: {
                                totalReserve: booking.total_amount || 0,
                                netTotal: (booking.total_amount || 0) - ((booking.total_amount || 0) * ((booking.agency?.fee || 0) / 100)),
                                paymentType: booking.payment_type || 'Transferência Bancária',
                                paymentMethodId: booking.payment_method_id || '',
                                paymentMethodName: booking.payment_method?.name || '',
                                paymentStatus: booking.payment_status || 'Pendente',
                                notes: booking.notes || '',
                                deposit: booking.deposit_amount || 0
                            },
                            googleCalendarLink: booking.google_calendar_link || ''
                        });
                        console.log('Booking data set successfully');
                    }
                }
            } catch (error: any) {
                console.error('Error fetching data:', error);
                console.error('Error details:', error.message, error.details, error.hint);
                showToast(`Erro ao carregar dados: ${error.message || 'Erro desconhecido'}`, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Update Available Times when Adventure or Date changes
    useEffect(() => {
        const selectedAdventure = adventures.find(a => a.id === bookingData.adventure.id);
        if (selectedAdventure && bookingData.adventure.date) {
            const date = new Date(bookingData.adventure.date);
            const highStart = new Date(selectedAdventure.highSeason.start);
            const highEnd = new Date(selectedAdventure.highSeason.end);

            // Simple check: if date is within high season range
            // Note: This assumes current year for simplicity, might need more robust logic for year transitions
            // For now, we compare MM-DD roughly or just full dates if year matches
            // Let's assume the dates in DB are YYYY-MM-DD.

            const isHighSeason = date >= highStart && date <= highEnd;

            setAvailableTimes(isHighSeason ? selectedAdventure.highSeason.times : selectedAdventure.lowSeason.times);
        } else {
            setAvailableTimes([]);
        }
    }, [bookingData.adventure.id, bookingData.adventure.date, adventures]);

    // Calculations
    useEffect(() => {
        const selectedAdventure = adventures.find(a => a.id === bookingData.adventure.id);
        if (selectedAdventure) {
            const total = (bookingData.participants.adults * selectedAdventure.priceAdult) +
                (bookingData.participants.children * selectedAdventure.priceChild) +
                (bookingData.participants.babies * selectedAdventure.priceBaby);

            const feeAmount = total * (bookingData.agency.fee / 100);
            const net = total - feeAmount;

            setBookingData(prev => ({
                ...prev,
                financial: {
                    ...prev.financial,
                    totalReserve: total,
                    netTotal: net
                }
            }));
        }
    }, [bookingData.participants, bookingData.adventure.id, bookingData.agency.fee, adventures]);

    // Handlers
    const handleInputChange = (section: string, field: string, value: any) => {
        setBookingData(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                [field]: value
            }
        }));
    };

    const handleAdventureChange = (adventureId: string) => {
        const selectedAdventure = adventures.find(a => a.id === adventureId);
        if (selectedAdventure) {
            setBookingData(prev => ({
                ...prev,
                adventure: {
                    ...prev.adventure,
                    id: selectedAdventure.id,
                    name: selectedAdventure.name,
                    location: selectedAdventure.location,
                    duration: selectedAdventure.duration
                }
            }));
        }
    };

    const handleAgencyChange = (agencyId: string) => {
        if (agencyId === 'Particular') {
            setBookingData(prev => ({
                ...prev,
                agency: { id: '', name: 'Particular', email: '', fee: 0 }
            }));
        } else {
            const selectedAgency = agencies.find(a => a.id === agencyId);
            if (selectedAgency) {
                setBookingData(prev => ({
                    ...prev,
                    agency: {
                        id: selectedAgency.id,
                        name: selectedAgency.name,
                        email: selectedAgency.email,
                        fee: selectedAgency.commission
                    }
                }));
            }
        }
    };

    const handleParticipantChange = (type: 'adults' | 'children' | 'babies', value: number) => {
        const newValue = Math.max(0, value);
        setBookingData(prev => {
            const newParticipants = { ...prev.participants, [type]: newValue };
            newParticipants.total = newParticipants.adults + newParticipants.children + newParticipants.babies;
            return { ...prev, participants: newParticipants };
        });
    };

    const handleSave = async () => {
        try {
            const payload = {
                adventure_id: bookingData.adventure.id,
                agency_id: bookingData.agency.id || null,
                client_name: bookingData.client.name,
                client_email: bookingData.client.email,
                client_phone: bookingData.client.phone,
                client_nif: bookingData.client.nif,
                client_city: bookingData.client.city,
                client_country: bookingData.client.country,
                date: bookingData.adventure.date,
                time: bookingData.adventure.time,
                meeting_point: bookingData.adventure.meetingPoint,
                adults: bookingData.participants.adults,
                children: bookingData.participants.children,
                babies: bookingData.participants.babies,
                total_amount: bookingData.financial.totalReserve,
                deposit_amount: bookingData.financial.deposit,
                payment_status: bookingData.financial.paymentStatus,
                payment_method_id: bookingData.financial.paymentMethodId || null,
                status: bookingData.status,
                notes: bookingData.financial.notes,
                google_calendar_link: bookingData.googleCalendarLink
            };

            if (isNewBooking) {
                const { error } = await supabase.from('bookings').insert([payload]);
                if (error) throw error;
                showToast('Reserva criada com sucesso!', 'success');
                navigate('/bookings');
            } else {
                const { error } = await supabase
                    .from('bookings')
                    .update(payload)
                    .eq('id', id);

                if (error) throw error;
                showToast('Reserva atualizada com sucesso!', 'success');
                navigate('/bookings');
            }
        } catch (error: any) {
            console.error('Error saving booking:', error);
            showModal({
                title: 'Erro ao Salvar',
                message: `Erro ao salvar reserva: ${error.message}`,
                type: 'error'
            });
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'Concluido':
            case 'Concluído':
                return 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700';
            case 'Pendente':
                return 'text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700';
            case 'Parcial':
                return 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700';
            case 'Cancelado':
                return 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700';
            default:
                return 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600';
        }
    };

    const inputClass = "w-full appearance-none px-3 py-2.5 bg-gray-50 dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#92c9a0]">
                <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</Link>
                <span>/</span>
                <Link to="/bookings" className="hover:text-gray-900 dark:hover:text-white transition-colors">Reservas</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white font-medium">{isNewBooking ? 'Nova Reserva' : <>Reserva <span className="text-xs text-gray-700 dark:text-gray-300">#{bookingData.id}</span></>}</span>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {isNewBooking ? 'Nova Reserva' : (isEditMode ? (
                            <>Editar Reserva <span className="text-lg text-gray-700 dark:text-gray-300">#{bookingData.id}</span></>
                        ) : (
                            <>Detalhes da Reserva <span className="text-lg text-gray-700 dark:text-gray-300">#{bookingData.id}</span></>
                        ))}
                    </h1>

                    {/* Highlighted Status Section */}
                    {!isNewBooking && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit transition-colors duration-300 ${getPaymentStatusColor(bookingData.financial.paymentStatus)}`}>
                            <span className="material-symbols-outlined text-lg">payments</span>
                            <span className="text-sm font-bold uppercase tracking-wide">
                                Pagamento: {bookingData.financial.paymentStatus}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-white/10 text-gray-900 dark:text-white font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-transparent">
                        <span className="material-symbols-outlined text-lg">print</span>
                        Imprimir
                    </button>

                    {isEditMode && (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background-dark font-bold text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-lg">save</span>
                            Salvar
                        </button>
                    )}

                    {!isEditMode && (
                        <Link to={`/bookings/${id}?mode=edit`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background-dark font-bold text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-lg">edit</span>
                            Editar
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details Column (Left) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Adventure Card */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detalhes da Aventura</h2>
                            <span className="material-symbols-outlined text-gray-400">kayaking</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome Aventura</label>
                                {isEditMode ? (
                                    <select
                                        value={bookingData.adventure.id}
                                        onChange={(e) => handleAdventureChange(e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Selecione uma aventura...</option>
                                        {adventures.map(adv => (
                                            <option key={adv.id} value={adv.id}>{adv.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.adventure.name}</p>
                                )}
                            </div>
                            {/* Localização e Ponto de Encontro na mesma linha */}
                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localização</label>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.adventure.location || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ponto de Encontro</label>
                                    {isEditMode ? (
                                        <input
                                            type="text"
                                            value={bookingData.adventure.meetingPoint || ''}
                                            onChange={(e) => handleInputChange('adventure', 'meetingPoint', e.target.value)}
                                            className={inputClass}
                                            placeholder="Ex: Estação de São Bento"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.adventure.meetingPoint || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Data, Hora e Duração na mesma linha */}
                            <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</label>
                                    {isEditMode ? (
                                        <input
                                            type="date"
                                            value={bookingData.adventure.date}
                                            onChange={(e) => handleInputChange('adventure', 'date', e.target.value)}
                                            className={inputClass}
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.adventure.date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hora</label>
                                    {isEditMode ? (
                                        <select
                                            value={bookingData.adventure.time}
                                            onChange={(e) => handleInputChange('adventure', 'time', e.target.value)}
                                            className={inputClass}
                                            disabled={!availableTimes.length}
                                        >
                                            <option value="">{availableTimes.length ? 'Selecione...' : 'Indisponível'}</option>
                                            {availableTimes.map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                            {!availableTimes.includes(bookingData.adventure.time) && bookingData.adventure.time && (
                                                <option value={bookingData.adventure.time}>{bookingData.adventure.time} (Atual)</option>
                                            )}
                                        </select>
                                    ) : (
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.adventure.time}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duração</label>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.adventure.duration || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Client Card */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detalhes do Cliente</h2>
                            <span className="material-symbols-outlined text-gray-400">person</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={bookingData.client.name}
                                        onChange={(e) => handleInputChange('client', 'name', e.target.value)}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NIF</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={bookingData.client.nif}
                                        onChange={(e) => handleInputChange('client', 'nif', e.target.value)}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.nif}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</label>
                                {isEditMode ? (
                                    <input
                                        type="email"
                                        value={bookingData.client.email}
                                        onChange={(e) => handleInputChange('client', 'email', e.target.value)}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefone</label>
                                {isEditMode ? (
                                    <input
                                        type="tel"
                                        value={bookingData.client.phone}
                                        onChange={(e) => handleInputChange('client', 'phone', e.target.value)}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.phone}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cidade</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={bookingData.client.city}
                                        onChange={(e) => handleInputChange('client', 'city', e.target.value)}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.city}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">País</label>
                                {isEditMode ? (
                                    <select
                                        value={bookingData.client.country}
                                        onChange={(e) => handleInputChange('client', 'country', e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Selecione um país...</option>
                                        {countries.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.country}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Participants & Agency Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Participantes</h2>
                                <span className="material-symbols-outlined text-gray-400">groups</span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-end gap-2 mb-4">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{bookingData.participants.total}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total de Pessoas</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm border-b border-gray-100 dark:border-white/5 pb-2">
                                        <span className="text-gray-600 dark:text-gray-300">Adultos</span>
                                        {isEditMode ? (
                                            <input
                                                type="number"
                                                value={bookingData.participants.adults}
                                                onChange={(e) => handleParticipantChange('adults', parseInt(e.target.value) || 0)}
                                                className="w-16 text-right bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded px-1"
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-900 dark:text-white">{bookingData.participants.adults}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-sm border-b border-gray-100 dark:border-white/5 pb-2">
                                        <span className="text-gray-600 dark:text-gray-300">Crianças</span>
                                        {isEditMode ? (
                                            <input
                                                type="number"
                                                value={bookingData.participants.children}
                                                onChange={(e) => handleParticipantChange('children', parseInt(e.target.value) || 0)}
                                                className="w-16 text-right bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded px-1"
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-900 dark:text-white">{bookingData.participants.children}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">Bebés</span>
                                        {isEditMode ? (
                                            <input
                                                type="number"
                                                value={bookingData.participants.babies}
                                                onChange={(e) => handleParticipantChange('babies', parseInt(e.target.value) || 0)}
                                                className="w-16 text-right bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded px-1"
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-900 dark:text-white">{bookingData.participants.babies}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Agency Card */}
                        <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agência</h2>
                                <span className="material-symbols-outlined text-gray-400">storefront</span>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome da Agência</label>
                                    {isEditMode ? (
                                        <select
                                            value={bookingData.agency.id || 'Particular'}
                                            onChange={(e) => handleAgencyChange(e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="Particular">Particular</option>
                                            {agencies.map(agency => (
                                                <option key={agency.id} value={agency.id}>{agency.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.agency.name}</p>
                                    )}
                                </div>
                                {bookingData.agency.name !== 'Particular' && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email da Agência</label>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.agency.email || 'N/A'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column (Right) */}
                <div className="lg:col-span-1 flex flex-col gap-6">

                    {/* Financial Card */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center bg-gray-50 dark:bg-white/5">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financeiro</h2>
                            <span className="material-symbols-outlined text-gray-500">payments</span>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valor Total</label>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">€{bookingData.financial.totalReserve.toFixed(2)}</p>
                            </div>
                            {bookingData.agency.name !== 'Particular' && (
                                <div className="flex justify-between items-center text-red-500">
                                    <label className="text-xs font-medium uppercase">Comissão Agência</label>
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="text-lg font-bold">
                                            -€{(bookingData.financial.totalReserve * (bookingData.agency.fee / 100)).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-red-400">
                                            ({bookingData.agency.fee}%)
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                                <label className="text-xs font-medium text-primary uppercase font-bold">Valor Líquido</label>
                                <p className="text-2xl font-black text-primary">€{bookingData.financial.netTotal.toFixed(2)}</p>
                            </div>

                            <div className="pt-2 space-y-3">
                                <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">Método de Pagamento</label>
                                    {isEditMode ? (
                                        <select
                                            value={bookingData.financial.paymentMethodId}
                                            onChange={(e) => handleInputChange('financial', 'paymentMethodId', e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="">Selecione...</option>
                                            {paymentMethods.map(method => (
                                                <option key={method.id} value={method.id}>{method.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{bookingData.financial.paymentMethodName || 'N/A'}</p>
                                    )}
                                </div>

                                <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">Estado do Pagamento</label>
                                    {isEditMode ? (
                                        <select
                                            value={bookingData.financial.paymentStatus}
                                            onChange={(e) => handleInputChange('financial', 'paymentStatus', e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="Pendente">Pendente</option>
                                            <option value="Parcial">Parcial</option>
                                            <option value="Concluido">Concluído</option>
                                            <option value="Cancelado">Cancelado</option>
                                        </select>
                                    ) : (
                                        <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border font-bold text-sm ${getPaymentStatusColor(bookingData.financial.paymentStatus)}`}>
                                            <span className="material-symbols-outlined text-base">payments</span>
                                            <span>{bookingData.financial.paymentStatus}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">Status da Reserva</label>
                                    {isEditMode ? (
                                        <select
                                            value={bookingData.status}
                                            onChange={(e) => setBookingData(prev => ({ ...prev, status: e.target.value }))}
                                            className={inputClass}
                                        >
                                            <option value="Pendente">Pendente</option>
                                            <option value="Confirmada">Confirmada</option>
                                            <option value="Concluída">Concluída</option>
                                            <option value="Cancelada">Cancelada</option>
                                        </select>
                                    ) : (
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{bookingData.status}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Observações</label>
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
                                    {isEditMode ? (
                                        <textarea
                                            value={bookingData.financial.notes}
                                            onChange={(e) => handleInputChange('financial', 'notes', e.target.value)}
                                            className="w-full bg-transparent border-none outline-none text-sm text-yellow-800 dark:text-yellow-200 italic"
                                            rows={3}
                                        />
                                    ) : (
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200 italic">{bookingData.financial.notes || 'Sem observações.'}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Link Google Calendar</label>
                                {isEditMode ? (
                                    <input
                                        type="url"
                                        value={bookingData.googleCalendarLink}
                                        onChange={(e) => setBookingData(prev => ({ ...prev, googleCalendarLink: e.target.value }))}
                                        className={inputClass}
                                        placeholder="https://calendar.google.com/..."
                                    />
                                ) : (
                                    bookingData.googleCalendarLink ? (
                                        <a
                                            href={bookingData.googleCalendarLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:text-primary-dark underline flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">event</span>
                                            Abrir no Google Calendar
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">Sem link de calendário.</p>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ações</h2>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <a
                                href={`mailto:${bookingData.client.email}`}
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">mail</span>
                                Enviar Email ao Cliente
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};