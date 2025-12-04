import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { PaymentMethod } from '../../types';
import { fetchActivePaymentMethods } from '../../services/paymentMethodsService';


const countriesList = [
    'Afeganistão', 'África do Sul', 'Albânia', 'Alemanha', 'Andorra', 'Angola', 'Antígua e Barbuda', 'Arábia Saudita', 'Argélia', 'Argentina', 'Arménia', 'Austrália', 'Áustria', 'Azerbaijão',
    'Bahamas', 'Bangladexe', 'Barbados', 'Barém', 'Bélgica', 'Belize', 'Benim', 'Bielorrússia', 'Bolívia', 'Bósnia e Herzegovina', 'Botsuana', 'Brasil', 'Brunei', 'Bulgária', 'Burquina Faso', 'Burundi', 'Butão',
    'Cabo Verde', 'Camarões', 'Camboja', 'Canadá', 'Catar', 'Cazaquistão', 'Chade', 'Chile', 'China', 'Chipre', 'Colômbia', 'Comores', 'Congo', 'Coreia do Norte', 'Coreia do Sul', 'Costa do Marfim', 'Costa Rica', 'Croácia', 'Cuba',
    'Dinamarca', 'Dominica', 'Egito', 'Emirados Árabes Unidos', 'Equador', 'Eritreia', 'Eslováquia', 'Eslovénia', 'Espanha', 'Essuatíni', 'Estónia', 'Etiópia',
    'Fiji', 'Filipinas', 'Finlândia', 'França',
    'Gabão', 'Gâmbia', 'Gana', 'Geórgia', 'Granada', 'Grécia', 'Guatemala', 'Guiana', 'Guiné', 'Guiné Equatorial', 'Guiné-Bissau',
    'Haiti', 'Honduras', 'Hungria',
    'Iémen', 'Ilhas Marshall', 'Ilhas Salomão', 'Índia', 'Indonésia', 'Irão', 'Iraque', 'Irlanda', 'Islândia', 'Israel', 'Itália',
    'Jamaica', 'Japão', 'Jibuti', 'Jordânia',
    'Kiribati', 'Kosovo', 'Koweit',
    'Laos', 'Lesoto', 'Letónia', 'Líbano', 'Libéria', 'Líbia', 'Listenstaine', 'Lituânia', 'Luxemburgo',
    'Macedónia do Norte', 'Madagáscar', 'Malásia', 'Maláui', 'Maldivas', 'Mali', 'Malta', 'Marrocos', 'Maurícia', 'Mauritânia', 'México', 'Mianmar', 'Micronésia', 'Moçambique', 'Moldávia', 'Mónaco', 'Mongólia', 'Montenegro',
    'Namíbia', 'Nauru', 'Nepal', 'Nicarágua', 'Níger', 'Nigéria', 'Noruega', 'Nova Zelândia',
    'Omã',
    'Países Baixos', 'Palau', 'Panamá', 'Papua-Nova Guiné', 'Paquistão', 'Paraguai', 'Peru', 'Polónia', 'Portugal',
    'Quénia', 'Quirguistão',
    'Reino Unido', 'República Centro-Africana', 'República Checa', 'República Democrática do Congo', 'República Dominicana', 'Roménia', 'Ruanda', 'Rússia',
    'Samoa', 'Santa Lúcia', 'São Cristóvão e Neves', 'São Marinho', 'São Tomé e Príncipe', 'São Vicente e Granadinas', 'Senegal', 'Serra Leoa', 'Sérvia', 'Seicheles', 'Singapura', 'Síria', 'Somália', 'Sri Lanca', 'Sudão', 'Sudão do Sul', 'Suécia', 'Suíça', 'Suriname',
    'Tailândia', 'Tajiquistão', 'Tanzânia', 'Timor-Leste', 'Togo', 'Tonga', 'Trindade e Tobago', 'Tunísia', 'Turcomenistão', 'Turquia', 'Tuvalu',
    'Ucrânia', 'Uganda', 'Uruguai', 'Usbequistão',
    'Vanuatu', 'Vaticano', 'Venezuela', 'Vietname',
    'Zâmbia', 'Zimbábue'
];

export const BookingForm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const agencyCode = searchParams.get('code');
    const isAgency = !!agencyCode;

    const [loading, setLoading] = useState(true);
    const [adventures, setAdventures] = useState<any[]>([]);
    const [agencyDetails, setAgencyDetails] = useState<any>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [formData, setFormData] = useState({
        adventure: '',
        date: '',
        time: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientNif: '',
        clientCity: '',
        clientCountry: '',
        adults: 1,
        children: 0,
        babies: 0,
        paymentMethodId: '',
        notes: ''
    });

    const [availableTimes, setAvailableTimes] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch active adventures
                const { data: adventuresData } = await supabase
                    .from('adventures')
                    .select('*')
                    .eq('is_active', true);

                const mappedAdventures = (adventuresData || []).map(a => ({
                    id: a.id,
                    name: a.name,
                    priceAdult: a.price_adult,
                    priceChild: a.price_child,
                    priceBaby: a.price_baby,
                    minCapacity: a.min_capacity,
                    maxCapacity: a.max_capacity,
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

                // Fetch payment methods
                const paymentMethodsData = await fetchActivePaymentMethods();
                setPaymentMethods(paymentMethodsData);

                // Fetch agency if code provided
                if (isAgency) {
                    const { data: agency } = await supabase
                        .from('agencies')
                        .select('*')
                        .eq('code', agencyCode)
                        .eq('is_active', true)
                        .single();

                    if (agency) {
                        setAgencyDetails({
                            id: agency.id,
                            name: agency.name,
                            code: agency.code,
                            email: agency.email,
                            nif: agency.nif,
                            phone: agency.phone,
                            contact: agency.contact,
                            fee: agency.fee
                        });
                    } else {
                        navigate('/book');
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [agencyCode, isAgency, navigate]);

    const [currentOccupancy, setCurrentOccupancy] = useState<number>(0);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState<string | null>(null);

    // Update available times based on season
    useEffect(() => {
        if (formData.adventure && formData.date) {
            const selectedAdventure = adventures.find(a => a.id === formData.adventure);
            if (selectedAdventure) {
                const date = new Date(formData.date);
                const highStart = new Date(selectedAdventure.highSeason.start);
                const highEnd = new Date(selectedAdventure.highSeason.end);

                const isHighSeason = date >= highStart && date <= highEnd;
                setAvailableTimes(isHighSeason ? selectedAdventure.highSeason.times : selectedAdventure.lowSeason.times);
            }
        } else {
            setAvailableTimes([]);
        }
    }, [formData.adventure, formData.date, adventures]);

    // Check availability when parameters change
    useEffect(() => {
        const checkAvailability = async () => {
            if (!formData.adventure || !formData.date || !formData.time) {
                setCurrentOccupancy(0);
                setAvailabilityError(null);
                return;
            }

            const selectedAdventure = adventures.find(a => a.id === formData.adventure);
            if (!selectedAdventure) return;

            // If no max capacity, no need to check (unless we want to show total booked for info)
            if (selectedAdventure.maxCapacity === null) {
                setAvailabilityError(null);
                return;
            }

            try {
                setCheckingAvailability(true);
                setAvailabilityError(null);

                const { data: bookings, error } = await supabase
                    .from('bookings')
                    .select('adults, children, babies')
                    .eq('adventure_id', formData.adventure)
                    .eq('date', formData.date)
                    .eq('time', formData.time)
                    .neq('status', 'Cancelada');

                if (error) throw error;

                const totalBooked = (bookings || []).reduce((acc, booking) => {
                    return acc + (booking.adults || 0) + (booking.children || 0) + (booking.babies || 0);
                }, 0);

                setCurrentOccupancy(totalBooked);

                const currentRequest = Number(formData.adults) + Number(formData.children) + Number(formData.babies);
                const remainingSpots = selectedAdventure.maxCapacity - totalBooked;

                if (remainingSpots <= 0) {
                    setAvailabilityError('Este horário está esgotado.');
                } else if (currentRequest > remainingSpots) {
                    setAvailabilityError(`Apenas ${remainingSpots} vagas disponíveis para este horário.`);
                }

            } catch (error) {
                console.error('Error checking availability:', error);
            } finally {
                setCheckingAvailability(false);
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [formData.adventure, formData.date, formData.time, formData.adults, formData.children, formData.babies, adventures]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const { showModal } = useModal();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (availabilityError) {
            showModal({
                title: 'Indisponibilidade',
                message: 'Por favor, corrija os erros de disponibilidade antes de continuar.',
                type: 'warning',
                confirmText: 'Entendi'
            });
            return;
        }

        try {
            // Calculate total amount
            const selectedAdventure = adventures.find(a => a.id === formData.adventure);
            let totalAmount = 0;

            if (selectedAdventure) {
                // Final Availability Check (Race Condition Prevention)
                if (selectedAdventure.maxCapacity !== null) {
                    const { data: bookings } = await supabase
                        .from('bookings')
                        .select('adults, children, babies')
                        .eq('adventure_id', formData.adventure)
                        .eq('date', formData.date)
                        .eq('time', formData.time)
                        .neq('status', 'Cancelada');

                    const totalBooked = (bookings || []).reduce((acc, booking) =>
                        acc + (booking.adults || 0) + (booking.children || 0) + (booking.babies || 0), 0);

                    const currentRequest = Number(formData.adults) + Number(formData.children) + Number(formData.babies);

                    if (totalBooked + currentRequest > selectedAdventure.maxCapacity) {
                        setAvailabilityError('Desculpe, as vagas acabaram de esgotar.');
                        showModal({
                            title: 'Vagas Esgotadas',
                            message: 'Desculpe, as vagas para este horário acabaram de esgotar.',
                            type: 'error',
                            confirmText: 'Escolher outro horário'
                        });
                        return;
                    }
                }

                // Minimum Capacity Check
                const currentRequest = Number(formData.adults) + Number(formData.children) + Number(formData.babies);
                if (selectedAdventure.minCapacity !== null && currentRequest < selectedAdventure.minCapacity) {
                    showModal({
                        title: 'Mínimo de Participantes',
                        message: `Esta aventura requer um mínimo de ${selectedAdventure.minCapacity} participantes.`,
                        type: 'warning',
                        confirmText: 'Ajustar'
                    });
                    return;
                }

                totalAmount = (
                    (Number(formData.adults) * selectedAdventure.priceAdult) +
                    (Number(formData.children) * selectedAdventure.priceChild) +
                    (Number(formData.babies) * selectedAdventure.priceBaby)
                );
            }

            const payload = {
                adventure_id: formData.adventure,
                agency_id: isAgency ? agencyDetails.id : null,
                client_name: formData.clientName,
                client_email: formData.clientEmail,
                client_phone: formData.clientPhone,
                client_nif: formData.clientNif,
                client_city: formData.clientCity,
                client_country: formData.clientCountry,
                date: formData.date,
                time: formData.time,
                adults: formData.adults,
                children: formData.children,
                babies: formData.babies,
                payment_status: 'Pendente',
                status: 'Pendente',
                notes: formData.notes,
                payment_method_id: formData.paymentMethodId,
                total_amount: totalAmount
            };

            const { error } = await supabase.from('bookings').insert([payload]);

            if (error) throw error;

            showToast('Reserva submetida com sucesso!', 'success');
            navigate('/');
        } catch (error: any) {
            console.error('Error submitting booking:', error);
            showModal({
                title: 'Erro na Reserva',
                message: `Erro ao submeter reserva: ${error.message}`,
                type: 'error'
            });
        }
    };

    const totalParticipants = Number(formData.adults) + Number(formData.children) + Number(formData.babies);

    // Calculate total amount for display
    const selectedAdventure = adventures.find(a => a.id === formData.adventure);
    const calculatedTotal = selectedAdventure ? (
        (Number(formData.adults) * selectedAdventure.priceAdult) +
        (Number(formData.children) * selectedAdventure.priceChild) +
        (Number(formData.babies) * selectedAdventure.priceBaby)
    ) : 0;

    const inputClass = "w-full px-4 py-2.5 bg-gray-50 dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500";
    const labelClass = "block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="mb-8">
                <button onClick={() => navigate('/bookings/new')} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 mb-4 transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Voltar
                </button>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                    {isAgency ? 'Nova Reserva (Parceiro)' : 'Nova Reserva'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Preencha os dados abaixo para confirmar a sua aventura.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-2xl p-8 shadow-sm space-y-8">

                {/* Agency Details Section (Read-Only) */}
                {isAgency && agencyDetails && (
                    <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">storefront</span>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dados da Agência</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClass}>Nome</label>
                                <p className="font-medium text-gray-900 dark:text-white">{agencyDetails.name}</p>
                            </div>
                            <div>
                                <label className={labelClass}>Código</label>
                                <p className="font-mono font-medium text-gray-900 dark:text-white">{agencyDetails.code}</p>
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <p className="font-medium text-gray-900 dark:text-white">{agencyDetails.email}</p>
                            </div>
                            <div>
                                <label className={labelClass}>NIF</label>
                                <p className="font-medium text-gray-900 dark:text-white">{agencyDetails.nif}</p>
                            </div>
                            <div>
                                <label className={labelClass}>Telefone</label>
                                <p className="font-medium text-gray-900 dark:text-white">{agencyDetails.phone}</p>
                            </div>
                            <div>
                                <label className={labelClass}>Contato</label>
                                <p className="font-medium text-gray-900 dark:text-white">{agencyDetails.contact}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Adventure Details */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">kayaking</span>
                        Detalhes da Aventura
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className={labelClass}>Aventura</label>
                            <select
                                name="adventure"
                                value={formData.adventure}
                                onChange={handleInputChange}
                                className={inputClass}
                                required
                            >
                                <option value="">Selecione uma aventura...</option>
                                {adventures.map(adv => (
                                    <option key={adv.id} value={adv.id}>{adv.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Data</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Hora</label>
                            <select
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                className={`${inputClass} ${availabilityError ? 'border-red-500 focus:ring-red-500' : ''}`}
                                required
                                disabled={!availableTimes.length}
                            >
                                <option value="">{availableTimes.length ? 'Selecione uma hora...' : 'Selecione data/aventura'}</option>
                                {availableTimes.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                            {checkingAvailability && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                    Verificando disponibilidade...
                                </p>
                            )}
                            {availabilityError && (
                                <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {availabilityError}
                                </p>
                            )}
                            {!availabilityError && !checkingAvailability && formData.time && (
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Horário disponível
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 dark:border-white/5" />

                {/* Client Details */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Dados do Cliente
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className={labelClass}>Nome Completo</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="clientName"
                                    value={formData.clientName}
                                    onChange={handleInputChange}
                                    className={`${inputClass} pr-10`}
                                    placeholder="Ex: João Silva"
                                    required
                                />
                                <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">person</span>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="clientEmail"
                                    value={formData.clientEmail}
                                    onChange={handleInputChange}
                                    className={`${inputClass} pr-10`}
                                    placeholder="Ex: joao@email.com"
                                    required
                                />
                                <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">email</span>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Telefone</label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    name="clientPhone"
                                    value={formData.clientPhone}
                                    onChange={handleInputChange}
                                    className={`${inputClass} pr-10`}
                                    placeholder="Ex: 912 345 678"
                                    required
                                />
                                <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">phone</span>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>NIF (Opcional)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="clientNif"
                                    value={formData.clientNif}
                                    onChange={handleInputChange}
                                    className={`${inputClass} pr-10`}
                                    placeholder="Ex: 123456789"
                                />
                                <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">badge</span>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Cidade</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="clientCity"
                                    value={formData.clientCity}
                                    onChange={handleInputChange}
                                    className={`${inputClass} pr-10`}
                                    placeholder="Ex: Lisboa"
                                    required
                                />
                                <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">location_city</span>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>País</label>
                            <select
                                name="clientCountry"
                                value={formData.clientCountry}
                                onChange={handleInputChange}
                                className={inputClass}
                                required
                            >
                                <option value="">Selecione o país...</option>
                                {countriesList.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 dark:border-white/5" />

                {/* Participants */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">groups</span>
                            Participantes
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg text-sm font-semibold text-gray-700 dark:text-white">
                                Total: {totalParticipants}
                            </div>
                            {calculatedTotal > 0 && (
                                <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-lg text-sm font-bold text-primary">
                                    €{calculatedTotal.toFixed(2)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className={labelClass}>Adultos</label>
                            <input
                                type="number"
                                name="adults"
                                min="1"
                                value={formData.adults}
                                onChange={handleInputChange}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Crianças (4-12)</label>
                            <input
                                type="number"
                                name="children"
                                min="0"
                                value={formData.children}
                                onChange={handleInputChange}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Bebés (&lt;4)</label>
                            <input
                                type="number"
                                name="babies"
                                min="0"
                                value={formData.babies}
                                onChange={handleInputChange}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 dark:border-white/5" />

                {/* Payment & Notes */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">payments</span>
                        Pagamento e Observações
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className={labelClass}>Método de Pagamento</label>
                            <select
                                name="paymentMethodId"
                                value={formData.paymentMethodId}
                                onChange={handleInputChange}
                                className={inputClass}
                                required
                            >
                                <option value="">Selecione o método de pagamento...</option>
                                {paymentMethods.map(method => (
                                    <option key={method.id} value={method.id}>{method.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Observações</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                className={inputClass}
                                rows={3}
                                placeholder="Alguma restrição alimentar ou pedido especial?"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={!!availabilityError || checkingAvailability}
                        className={`px-8 py-3 font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] ${availabilityError || checkingAvailability
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary-dark text-background-dark shadow-primary/20'
                            }`}
                    >
                        Confirmar Reserva
                    </button>
                </div>

            </form>
        </div>
    );
};
