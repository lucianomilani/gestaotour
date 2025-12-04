import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Adventure } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const timeOptions = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

export const AdventuresList: React.FC = () => {
    const { canDelete, companyId } = useAuth();
    const { showToast, showConfirm } = useToast();
    const [adventures, setAdventures] = useState<Adventure[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Status Filters (Checkboxes)
    const [showActive, setShowActive] = useState(true);
    const [showInactive, setShowInactive] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    // Dropdown states for times
    const [openTimeDropdown, setOpenTimeDropdown] = useState<'high' | 'low' | null>(null);

    // Form State
    const [currentAdventure, setCurrentAdventure] = useState<Adventure>({
        id: '',
        name: '',
        description: '',
        location: '',
        meetingPoint: '',
        duration: '',
        priceAdult: 0,
        priceChild: 0,
        priceBaby: 0,
        minCapacity: null,
        maxCapacity: null,
        isActive: true,
        highSeason: { start: '', end: '', times: [] },
        lowSeason: { start: '', end: '', times: [] }
    });

    // Fetch Adventures
    const fetchAdventures = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('adventures')
                .select('*')
                .order('name');

            if (error) throw error;

            // Map Supabase flat structure to nested frontend structure
            const mappedAdventures: Adventure[] = (data || []).map(item => ({
                id: item.id,
                name: item.name,
                description: item.description,
                location: item.location,
                meetingPoint: item.meeting_point,
                duration: item.duration,
                priceAdult: item.price_adult,
                priceChild: item.price_child,
                priceBaby: item.price_baby,
                minCapacity: item.min_capacity,
                maxCapacity: item.max_capacity,
                isActive: item.is_active,
                highSeason: {
                    start: item.high_season_start,
                    end: item.high_season_end,
                    times: item.high_season_times || []
                },
                lowSeason: {
                    start: item.low_season_start,
                    end: item.low_season_end,
                    times: item.low_season_times || []
                }
            }));

            setAdventures(mappedAdventures);
        } catch (error) {
            console.error('Error fetching adventures:', error);
            showToast('Erro ao carregar passeios.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdventures();
    }, []);

    // Filter Logic
    const filteredAdventures = adventures.filter(adv => {
        const matchesSearch = adv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            adv.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = (adv.isActive && showActive) || (!adv.isActive && showInactive);

        return matchesSearch && matchesStatus;
    });

    // Handlers
    const handleDelete = async (id: string) => {
        // Check if adventure is used in bookings
        try {
            const { count, error: countError } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('adventure_id', id);

            if (countError) {
                showToast('Erro ao verificar dependências.', 'error');
                return;
            }

            if (count && count > 0) {
                await showConfirm({
                    title: 'Não é Possível Remover',
                    message: `Este passeio está associado a ${count} reserva${count > 1 ? 's' : ''}. Para manter o histórico, recomendamos desativar o passeio em vez de removê-lo.`,
                    variant: 'warning',
                    confirmText: 'Entendi',
                    cancelText: ''
                });
                return;
            }
        } catch (error) {
            showToast('Erro ao verificar dependências.', 'error');
            return;
        }

        const confirmed = await showConfirm({
            title: 'Remover Passeio',
            message: 'Tem a certeza que deseja remover este passeio? Esta ação não pode ser revertida.',
            variant: 'danger',
            confirmText: 'Remover',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('adventures')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setAdventures(adventures.filter(a => a.id !== id));
                showToast('Passeio removido com sucesso!', 'success');
            } catch (error: any) {
                console.error('Error deleting adventure:', error);
                showToast(`Erro ao remover: ${error.message || 'Verifique as permissões'}`, 'error');
            }
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setCurrentAdventure({
            id: '', name: '', description: '', location: '', meetingPoint: '', duration: '',
            priceAdult: 0, priceChild: 0, priceBaby: 0,
            minCapacity: null, maxCapacity: null,
            isActive: true,
            highSeason: { start: '', end: '', times: [] },
            lowSeason: { start: '', end: '', times: [] }
        });
        setIsModalOpen(true);
        setOpenTimeDropdown(null);
    };

    const openEditModal = (adv: Adventure) => {
        setModalMode('edit');
        setCurrentAdventure(JSON.parse(JSON.stringify(adv))); // Deep copy
        setIsModalOpen(true);
        setOpenTimeDropdown(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle numbers
        if (type === 'number') {
            setCurrentAdventure(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setCurrentAdventure(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSeasonChange = (season: 'highSeason' | 'lowSeason', field: 'start' | 'end', value: string) => {
        setCurrentAdventure(prev => ({
            ...prev,
            [season]: { ...prev[season], [field]: value }
        }));
    };

    const handleStatusToggle = () => {
        setCurrentAdventure(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const toggleTimeSelection = (season: 'highSeason' | 'lowSeason', time: string) => {
        setCurrentAdventure(prev => {
            const times = prev[season].times;
            const exists = times.includes(time);
            let newTimes;
            if (exists) {
                newTimes = times.filter(t => t !== time).sort();
            } else {
                newTimes = [...times, time].sort();
            }
            return { ...prev, [season]: { ...prev[season], times: newTimes } };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Map nested frontend structure to flat Supabase structure
            const adventureData = {
                name: currentAdventure.name,
                description: currentAdventure.description,
                location: currentAdventure.location,
                meeting_point: currentAdventure.meetingPoint,
                duration: currentAdventure.duration,
                price_adult: currentAdventure.priceAdult,
                price_child: currentAdventure.priceChild,
                price_baby: currentAdventure.priceBaby,
                min_capacity: currentAdventure.minCapacity,
                max_capacity: currentAdventure.maxCapacity,
                is_active: currentAdventure.isActive,
                high_season_start: currentAdventure.highSeason.start,
                high_season_end: currentAdventure.highSeason.end,
                high_season_times: currentAdventure.highSeason.times,
                low_season_start: currentAdventure.lowSeason.start,
                low_season_end: currentAdventure.lowSeason.end,
                low_season_times: currentAdventure.lowSeason.times
            };

            if (modalMode === 'add') {
                const { data, error } = await supabase
                    .from('adventures')
                    .insert([{ ...adventureData, company_id: companyId }])
                    .select()
                    .single();

                if (error) throw error;

                // Re-map response to frontend structure
                const newAdventure: Adventure = {
                    ...currentAdventure,
                    id: data.id,
                    isActive: data.is_active,
                    // Ensure we keep the nested structure we have in state, 
                    // or we could re-map from 'data' if we wanted to be 100% sure of DB state
                };
                setAdventures([...adventures, newAdventure]);
            } else {
                // Edit Mode
                const { error } = await supabase
                    .from('adventures')
                    .update(adventureData)
                    .eq('id', currentAdventure.id);

                if (error) throw error;

                setAdventures(adventures.map(a => a.id === currentAdventure.id ? currentAdventure : a));
            }

            setIsModalOpen(false);
            showToast(modalMode === 'add' ? 'Passeio criado com sucesso!' : 'Passeio atualizado!', 'success');
            fetchAdventures();
        } catch (error: any) {
            console.error('Error saving adventure:', error);
            showToast(`Erro ao salvar passeio: ${error.message || 'Erro desconhecido'}`, 'error');
        }
    };

    // Styles
    const baseInputClass = "w-full appearance-none py-2.5 bg-white dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm pl-3";
    const labelClass = "block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5";
    const sectionTitleClass = "text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-1 mb-3 mt-1";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Gestão de Passeios</h1>
                    <p className="text-gray-600 dark:text-[#92c9a0] text-base font-normal mt-1">Configure as suas ofertas turísticas, preços e horários.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold tracking-wide gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined">hiking</span>
                    <span>Novo Passeio</span>
                </button>
            </div>

            {/* Search Bar & Filters */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-6 items-end">
                <div className="w-full max-w-md relative">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Pesquisar</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Nome do passeio, localização..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Status Toggles */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">Mostrar</span>
                    <div className="flex items-center gap-6 h-[42px]">
                        {/* Active Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer group select-none">
                            <div className={`relative w-9 h-5 rounded-full transition-colors ${showActive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <input
                                    type="checkbox"
                                    checked={showActive}
                                    onChange={(e) => setShowActive(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform shadow-sm ${showActive ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">Ativos</span>
                        </label>

                        {/* Inactive Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer group select-none">
                            <div className={`relative w-9 h-5 rounded-full transition-colors ${showInactive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <input
                                    type="checkbox"
                                    checked={showInactive}
                                    onChange={(e) => setShowInactive(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform shadow-sm ${showInactive ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">Inativos</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-surface-border">
                                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 whitespace-nowrap">Nome</th>
                                <th className="px-4 py-3 whitespace-nowrap">Localização</th>
                                <th className="px-4 py-3 whitespace-nowrap">Duração</th>
                                <th className="px-4 py-3 whitespace-nowrap">Adulto</th>
                                <th className="px-4 py-3 whitespace-nowrap">Horários</th>
                                <th className="px-4 py-3 whitespace-nowrap">Lotação</th>
                                <th className="px-4 py-3 text-center whitespace-nowrap">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
                            {filteredAdventures.length > 0 ? (
                                filteredAdventures.map((adv) => (
                                    <tr key={adv.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${adv.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'}`}>
                                                {adv.isActive ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{adv.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{adv.location}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{adv.duration}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">€{adv.priceAdult.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-bold text-orange-500 uppercase">Alta</span>
                                                    <span className="text-xs">{adv.highSeason.times.length > 0 ? adv.highSeason.times.slice(0, 2).join(', ') + (adv.highSeason.times.length > 2 ? '...' : '') : 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-bold text-blue-500 uppercase">Baixa</span>
                                                    <span className="text-xs">{adv.lowSeason.times.length > 0 ? adv.lowSeason.times.slice(0, 2).join(', ') + (adv.lowSeason.times.length > 2 ? '...' : '') : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-bold text-orange-500 uppercase">Min</span>
                                                    <span className="text-xs">{adv.minCapacity ?? 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-bold text-blue-500 uppercase">Max</span>
                                                    <span className="text-xs">{adv.maxCapacity ?? 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(adv)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                {canDelete('adventures') && (
                                                    <button
                                                        onClick={() => handleDelete(adv.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Apagar"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl opacity-50">hiking</span>
                                            <p>Nenhum passeio encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Adding/Editing Adventure */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-border overflow-hidden my-8">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-black/20">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {modalMode === 'add' ? 'Adicionar Novo Passeio' : 'Editar Passeio'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Basic Info */}
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Nome do Passeio</label>
                                <input
                                    type="text" name="name" required
                                    value={currentAdventure.name} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Ex: Trilho Panorâmico"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Descrição</label>
                                <textarea
                                    name="description" required rows={3}
                                    value={currentAdventure.description} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Descrição detalhada do passeio..."
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Localização</label>
                                <div className="relative">
                                    <input
                                        type="text" name="location" required
                                        value={currentAdventure.location} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="Ex: Serra do Gerês"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">location_on</span>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Ponto de Encontro</label>
                                <div className="relative">
                                    <input
                                        type="text" name="meetingPoint" required
                                        value={currentAdventure.meetingPoint} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="Ex: Centro de Turismo"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">place</span>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Duração</label>
                                <div className="relative">
                                    <input
                                        type="text" name="duration" required
                                        value={currentAdventure.duration} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="Ex: 3 horas"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">schedule</span>
                                </div>
                            </div>

                            {/* Status Switch */}
                            <div className="flex flex-col justify-end">
                                <label className={labelClass}>Estado do Passeio</label>
                                <button
                                    type="button"
                                    onClick={handleStatusToggle}
                                    className={`flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all ${currentAdventure.isActive
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-[#102215] border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${currentAdventure.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${currentAdventure.isActive ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                    <span className={`text-sm font-semibold ${currentAdventure.isActive ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {currentAdventure.isActive ? 'Ativo (Disponível)' : 'Inativo (Indisponível)'}
                                    </span>
                                </button>
                            </div>

                            {/* Pricing */}
                            <div className="col-span-1 md:col-span-2 pt-2">
                                <h3 className={sectionTitleClass}>Tabela de Preços</h3>
                            </div>

                            <div>
                                <label className={labelClass}>Valor Adulto (€)</label>
                                <input
                                    type="number" step="0.01" name="priceAdult" required
                                    value={currentAdventure.priceAdult} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Valor Criança (€)</label>
                                <input
                                    type="number" step="0.01" name="priceChild" required
                                    value={currentAdventure.priceChild} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Valor Bebé (&lt;4) (€)</label>
                                <input
                                    type="number" step="0.01" name="priceBaby" required
                                    value={currentAdventure.priceBaby} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="0.00"
                                />
                            </div>

                            {/* Capacity Section */}
                            <div className="col-span-1 md:col-span-2 pt-2">
                                <h3 className={sectionTitleClass}>Capacidade / Lotação</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2 mb-3">
                                    Deixe vazio para capacidade ilimitada
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>Capacidade Mínima</label>
                                <input
                                    type="number"
                                    name="minCapacity"
                                    min="0"
                                    value={currentAdventure.minCapacity ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? null : parseInt(e.target.value);
                                        setCurrentAdventure(prev => ({ ...prev, minCapacity: value }));
                                    }}
                                    className={baseInputClass}
                                    placeholder="Sem mínimo"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                                    Mínimo de pessoas necessárias
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>Capacidade Máxima</label>
                                <input
                                    type="number"
                                    name="maxCapacity"
                                    min="0"
                                    value={currentAdventure.maxCapacity ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? null : parseInt(e.target.value);
                                        setCurrentAdventure(prev => ({ ...prev, maxCapacity: value }));
                                    }}
                                    className={baseInputClass}
                                    placeholder="Sem limite"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                                    Máximo de pessoas permitidas
                                </p>
                            </div>

                            {/* High Season Config */}
                            <div className="col-span-1 md:col-span-2 pt-4">
                                <h3 className={`${sectionTitleClass} text-orange-600 dark:text-orange-400`}>Configuração Época Alta</h3>
                            </div>

                            <div>
                                <label className={labelClass}>Início Época Alta</label>
                                <input
                                    type="date"
                                    value={currentAdventure.highSeason.start}
                                    onChange={(e) => handleSeasonChange('highSeason', 'start', e.target.value)}
                                    className={baseInputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Fim Época Alta</label>
                                <input
                                    type="date"
                                    value={currentAdventure.highSeason.end}
                                    onChange={(e) => handleSeasonChange('highSeason', 'end', e.target.value)}
                                    className={baseInputClass}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2 relative">
                                <label className={labelClass}>Horários Época Alta</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setOpenTimeDropdown(openTimeDropdown === 'high' ? null : 'high')}
                                        className={`text-left ${baseInputClass} flex items-center justify-between`}
                                    >
                                        <span className={currentAdventure.highSeason.times.length ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                                            {currentAdventure.highSeason.times.length
                                                ? `${currentAdventure.highSeason.times.length} horários selecionados`
                                                : 'Selecione os horários...'}
                                        </span>
                                        <span className="material-symbols-outlined text-gray-400">{openTimeDropdown === 'high' ? 'expand_less' : 'expand_more'}</span>
                                    </button>

                                    {openTimeDropdown === 'high' && (
                                        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 p-4 animate-fade-in max-h-60 overflow-y-auto">
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                                {timeOptions.map(time => {
                                                    const isSelected = currentAdventure.highSeason.times.includes(time);
                                                    return (
                                                        <button
                                                            key={time}
                                                            type="button"
                                                            onClick={() => toggleTimeSelection('highSeason', time)}
                                                            className={`py-1.5 px-1 text-xs font-bold rounded-md border transition-colors ${isSelected
                                                                ? 'bg-orange-500 text-white border-orange-500'
                                                                : 'bg-gray-50 dark:bg-black/20 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-500'
                                                                }`}
                                                        >
                                                            {time}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex justify-end mt-3 pt-2 border-t border-gray-100 dark:border-white/5">
                                                <button type="button" onClick={() => setOpenTimeDropdown(null)} className="text-xs font-bold text-primary hover:underline">Confirmar</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Low Season Config */}
                            <div className="col-span-1 md:col-span-2 pt-4">
                                <h3 className={`${sectionTitleClass} text-blue-600 dark:text-blue-400`}>Configuração Época Baixa</h3>
                            </div>

                            <div>
                                <label className={labelClass}>Início Época Baixa</label>
                                <input
                                    type="date"
                                    value={currentAdventure.lowSeason.start}
                                    onChange={(e) => handleSeasonChange('lowSeason', 'start', e.target.value)}
                                    className={baseInputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Fim Época Baixa</label>
                                <input
                                    type="date"
                                    value={currentAdventure.lowSeason.end}
                                    onChange={(e) => handleSeasonChange('lowSeason', 'end', e.target.value)}
                                    className={baseInputClass}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2 relative">
                                <label className={labelClass}>Horários Época Baixa</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setOpenTimeDropdown(openTimeDropdown === 'low' ? null : 'low')}
                                        className={`text-left ${baseInputClass} flex items-center justify-between`}
                                    >
                                        <span className={currentAdventure.lowSeason.times.length ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                                            {currentAdventure.lowSeason.times.length
                                                ? `${currentAdventure.lowSeason.times.length} horários selecionados`
                                                : 'Selecione os horários...'}
                                        </span>
                                        <span className="material-symbols-outlined text-gray-400">{openTimeDropdown === 'low' ? 'expand_less' : 'expand_more'}</span>
                                    </button>

                                    {openTimeDropdown === 'low' && (
                                        <div className="absolute bottom-full left-0 w-full mb-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 p-4 animate-fade-in max-h-60 overflow-y-auto">
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                                {timeOptions.map(time => {
                                                    const isSelected = currentAdventure.lowSeason.times.includes(time);
                                                    return (
                                                        <button
                                                            key={time}
                                                            type="button"
                                                            onClick={() => toggleTimeSelection('lowSeason', time)}
                                                            className={`py-1.5 px-1 text-xs font-bold rounded-md border transition-colors ${isSelected
                                                                ? 'bg-blue-500 text-white border-blue-500'
                                                                : 'bg-gray-50 dark:bg-black/20 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-500'
                                                                }`}
                                                        >
                                                            {time}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex justify-end mt-3 pt-2 border-t border-gray-100 dark:border-white/5">
                                                <button type="button" onClick={() => setOpenTimeDropdown(null)} className="text-xs font-bold text-primary hover:underline">Confirmar</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-background-dark hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                                >
                                    {modalMode === 'add' ? 'Criar Passeio' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};