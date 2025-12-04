import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Agency } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AgenciesList: React.FC = () => {
    const { canDelete, companyId } = useAuth();
    const { showToast, showConfirm } = useToast();
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Status Filters (Toggles)
    const [showActive, setShowActive] = useState(true);
    const [showInactive, setShowInactive] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    // Form State
    const [currentAgency, setCurrentAgency] = useState<Agency>({
        id: '',
        code: '',
        name: '',
        nif: '',
        email: '',
        phone: '',
        contact: '',
        fee: 0,
        iban: '',
        isActive: true
    });

    // Fetch Agencies
    const fetchAgencies = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('agencies')
                .select('*')
                .order('name');

            if (error) throw error;

            // Map Supabase snake_case to camelCase
            const mappedAgencies: Agency[] = (data || []).map(item => ({
                id: item.id,
                code: item.code,
                name: item.name,
                nif: item.nif,
                email: item.email,
                phone: item.phone,
                contact: item.contact,
                fee: item.fee,
                iban: item.iban,
                isActive: item.is_active
            }));

            setAgencies(mappedAgencies);
        } catch (error) {
            console.error('Error fetching agencies:', error);
            showToast('Erro ao carregar agências.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgencies();
    }, []);

    // Filter Logic
    const filteredAgencies = agencies.filter(agency => {
        const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (agency.nif && agency.nif.includes(searchTerm));

        const matchesStatus = (agency.isActive && showActive) || (!agency.isActive && showInactive);

        return matchesSearch && matchesStatus;
    });

    // Handlers
    const handleDelete = async (id: string) => {
        // Check if agency is used in bookings
        try {
            const { count, error: countError } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('agency_id', id);

            if (countError) {
                showToast('Erro ao verificar dependências.', 'error');
                return;
            }

            if (count && count > 0) {
                await showConfirm({
                    title: 'Não é Possível Remover',
                    message: `Esta agência está associada a ${count} reserva${count > 1 ? 's' : ''}. Para manter o histórico, recomendamos desativar a agência em vez de removê-la.`,
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
            title: 'Remover Agência',
            message: 'Tem a certeza que deseja remover esta agência? Esta ação não pode ser revertida.',
            variant: 'danger',
            confirmText: 'Remover',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('agencies')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setAgencies(agencies.filter(a => a.id !== id));
                showToast('Agência removida com sucesso!', 'success');
            } catch (error: any) {
                console.error('Error deleting agency:', error);
                showToast(`Erro ao remover: ${error.message || 'Verifique as permissões'}`, 'error');
            }
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setCurrentAgency({
            id: '',
            code: '',
            name: '',
            nif: '',
            email: '',
            phone: '',
            contact: '',
            fee: 0,
            iban: '',
            isActive: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (agency: Agency) => {
        setModalMode('edit');
        setCurrentAgency(agency);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentAgency(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusToggle = () => {
        setCurrentAgency(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const agencyData = {
                code: currentAgency.code,
                name: currentAgency.name,
                nif: currentAgency.nif,
                email: currentAgency.email,
                phone: currentAgency.phone,
                contact: currentAgency.contact,
                fee: Number(currentAgency.fee),
                iban: currentAgency.iban,
                is_active: currentAgency.isActive
            };

            if (modalMode === 'add') {
                const { data, error } = await supabase
                    .from('agencies')
                    .insert([{ ...agencyData, company_id: companyId }])
                    .select()
                    .single();

                if (error) throw error;

                const newAgency: Agency = {
                    ...currentAgency,
                    id: data.id,
                    isActive: data.is_active
                };
                setAgencies([...agencies, newAgency]);
            } else {
                // Edit Mode
                const { error } = await supabase
                    .from('agencies')
                    .update(agencyData)
                    .eq('id', currentAgency.id);

                if (error) throw error;

                setAgencies(agencies.map(a => a.id === currentAgency.id ? currentAgency : a));
            }

            setIsModalOpen(false);
            showToast(modalMode === 'add' ? 'Agência criada com sucesso!' : 'Agência atualizada!', 'success');
            fetchAgencies();
        } catch (error: any) {
            console.error('Error saving agency:', error);
            showToast(`Erro ao salvar agência: ${error.message || 'Erro desconhecido'}`, 'error');
        }
    };

    // Styles
    const baseInputClass = "w-full appearance-none py-2.5 bg-white dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm pl-3";
    const labelClass = "block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5";

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
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Gestão de Agências</h1>
                    <p className="text-gray-600 dark:text-[#92c9a0] text-base font-normal mt-1">Administre os seus parceiros e agências de turismo.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold tracking-wide gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined">add</span>
                    <span>Nova Agência</span>
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
                            placeholder="Nome, Código ou NIF..."
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
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">Ativas</span>
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
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">Inativas</span>
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
                                <th className="px-4 py-3 whitespace-nowrap">Código</th>
                                <th className="px-4 py-3 whitespace-nowrap">Nome da Agência</th>
                                <th className="px-4 py-3 whitespace-nowrap">NIF</th>
                                <th className="px-4 py-3 whitespace-nowrap">Email</th>
                                <th className="px-4 py-3 whitespace-nowrap">Telefone</th>
                                <th className="px-4 py-3 whitespace-nowrap">Contato</th>
                                <th className="px-4 py-3 whitespace-nowrap">Fee (%)</th>
                                <th className="px-4 py-3 text-center whitespace-nowrap">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
                            {filteredAgencies.length > 0 ? (
                                filteredAgencies.map((agency) => (
                                    <tr key={agency.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${agency.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'}`}>
                                                {agency.isActive ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono font-medium text-gray-500 dark:text-gray-400">{agency.code}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{agency.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{agency.nif}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{agency.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{agency.phone}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{agency.contact}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{agency.fee}%</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(agency)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Editar Agência"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                {canDelete('agencies') && (
                                                    <button
                                                        onClick={() => handleDelete(agency.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Apagar Agência"
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
                                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl opacity-50">domain_disabled</span>
                                            <p>Nenhuma agência encontrada.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Adding/Editing Agency */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-border overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-black/20">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {modalMode === 'add' ? 'Adicionar Nova Agência' : 'Editar Agência'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Nome da Agência</label>
                                <div className="relative">
                                    <input
                                        type="text" name="name" required
                                        value={currentAgency.name} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="Ex: Viagens Norte"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">storefront</span>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Código</label>
                                <input
                                    type="text" name="code" required
                                    value={currentAgency.code} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Ex: AGT001"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>NIF</label>
                                <div className="relative">
                                    <input
                                        type="text" name="nif" required
                                        value={currentAgency.nif} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="123456789"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">badge</span>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Email</label>
                                <div className="relative">
                                    <input
                                        type="email" name="email" required
                                        value={currentAgency.email} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="geral@agencia.com"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">email</span>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Telefone</label>
                                <div className="relative">
                                    <input
                                        type="tel" name="phone"
                                        value={currentAgency.phone} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="+351 912 345 678"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">phone</span>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Nome do Contato</label>
                                <div className="relative">
                                    <input
                                        type="text" name="contact"
                                        value={currentAgency.contact} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="Ex: Ana Silva"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">person</span>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Fee (%)</label>
                                <input
                                    type="number" name="fee" min="0" max="100" step="0.1"
                                    value={currentAgency.fee} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Ex: 10"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>IBAN</label>
                                <div className="relative">
                                    <input
                                        type="text" name="iban"
                                        value={currentAgency.iban || ''} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="PT50..."
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">account_balance</span>
                                </div>
                            </div>

                            {/* Status Switch in Modal */}
                            <div className="col-span-1 md:col-span-2 flex flex-col justify-end">
                                <label className={labelClass}>Estado da Agência</label>
                                <button
                                    type="button"
                                    onClick={handleStatusToggle}
                                    className={`flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all ${currentAgency.isActive
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-[#102215] border-gray-200 dark:border-gray-700'}`}
                                >
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${currentAgency.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${currentAgency.isActive ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                    <span className={`text-sm font-semibold ${currentAgency.isActive ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {currentAgency.isActive ? 'Ativa (Parceiro Habilitado)' : 'Inativa (Parceiro Suspenso)'}
                                    </span>
                                </button>
                            </div>

                            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
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
                                    {modalMode === 'add' ? 'Salvar Agência' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}

        </div >
    );
};