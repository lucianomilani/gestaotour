import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Staff } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createAuthUser, updateAuthUser } from '../services/userService';

export const StaffList: React.FC = () => {
    const { canDelete, isSuperAdmin, companyId } = useAuth();
    const { showToast, showConfirm } = useToast();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Status Filters (Toggles)
    const [showActive, setShowActive] = useState(true);
    const [showInactive, setShowInactive] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    // Form State
    const [currentStaff, setCurrentStaff] = useState<Staff>({
        id: '',
        name: '',
        email: '',
        phone: '',
        role: 'Guia',
        nif: '',
        notes: '',
        isActive: true
    });
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Companies list for SuperAdmin
    const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);

    // Fetch Data
    const fetchStaff = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('staff')
                .select('*, company_settings(name)')
                .order('name');

            if (error) throw error;

            const formattedStaff: Staff[] = (data || []).map(item => ({
                id: item.id,
                name: item.name,
                email: item.email,
                phone: item.phone || '',
                role: item.role,
                nif: item.nif || '',
                notes: item.notes || '',
                isActive: item.is_active,
                auth_id: item.auth_id, // Include auth_id to show login status
                company_id: item.company_id,
                company_name: item.company_settings?.name
            }));

            setStaffList(formattedStaff);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    // Helper to get company name for modal (assuming single company context or from staff record)
    const [defaultCompanyName, setDefaultCompanyName] = useState('');

    useEffect(() => {
        const fetchDefaultCompany = async () => {
            if (isSuperAdmin) {
                // Fetch all companies for SuperAdmin
                const { data } = await supabase
                    .from('company_settings')
                    .select('id, name')
                    .order('name');
                if (data) {
                    setCompanies(data);
                    if (data.length > 0) {
                        setDefaultCompanyName(data[0].name);
                    }
                }
            } else {
                // Fetch only user's company
                const { data } = await supabase
                    .from('company_settings')
                    .select('name')
                    .eq('id', companyId)
                    .single();
                if (data) setDefaultCompanyName(data.name);
            }
        };
        fetchDefaultCompany();
    }, [isSuperAdmin, companyId]);

    // Filter Logic
    const filteredStaff = staffList.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = (staff.isActive && showActive) || (!staff.isActive && showInactive);

        return matchesSearch && matchesStatus;
    });

    // Handlers
    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm({
            title: 'Remover Colaborador',
            message: 'Tem a certeza que deseja remover este colaborador? Esta ação também removerá o acesso ao sistema.',
            variant: 'danger',
            confirmText: 'Remover',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            try {
                const { error } = await supabase.from('staff').delete().eq('id', id);
                if (error) throw error;
                setStaffList(prev => prev.filter(s => s.id !== id));
                showToast('Colaborador removido com sucesso!', 'success');
            } catch (error: any) {
                console.error('Error deleting staff:', error);
                showToast(`Erro ao remover: ${error.message || 'Verifique as permissões'}`, 'error');
            }
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        const initialCompanyId = isSuperAdmin && companies.length > 0 ? companies[0].id : undefined;
        setCurrentStaff({
            id: '',
            name: '',
            email: '',
            phone: '',
            role: 'Guia',
            nif: '',
            notes: '',
            isActive: true,
            company_id: initialCompanyId
        });
        setPassword('');
        setShowPassword(false);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (staff: Staff) => {
        setModalMode('edit');
        setCurrentStaff(staff);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentStaff(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusToggle = () => {
        setCurrentStaff(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        // Validate password for new users
        if (modalMode === 'add') {
            if (!password || password.length < 6) {
                setSubmitError('A senha deve ter no mínimo 6 caracteres.');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const staffData = {
                name: currentStaff.name,
                email: currentStaff.email,
                phone: currentStaff.phone,
                role: currentStaff.role,
                nif: currentStaff.nif,
                notes: currentStaff.notes,
                is_active: currentStaff.isActive
            };

            if (modalMode === 'add') {
                // Step 1: Get Company ID (assuming single company for now)
                const { data: companyData } = await supabase
                    .from('company_settings')
                    .select('id')
                    .limit(1)
                    .single();

                const companyId = companyData?.id;

                // Step 2: Create staff profile first
                const targetCompanyId = isSuperAdmin && currentStaff.company_id
                    ? currentStaff.company_id
                    : companyId;

                const { data: staffRecord, error: staffError } = await supabase
                    .from('staff')
                    .insert([{ ...staffData, company_id: targetCompanyId }])
                    .select()
                    .single();

                if (staffError) {
                    throw new Error(`Erro ao criar perfil: ${staffError.message}`);
                }

                // Step 3: Create auth user via Edge Function
                const authResult = await createAuthUser({
                    email: currentStaff.email,
                    password: password,
                    name: currentStaff.name,
                    role: currentStaff.role
                });

                if (!authResult.success) {
                    // Rollback: Delete the staff profile if auth creation failed
                    await supabase.from('staff').delete().eq('id', staffRecord.id);
                    throw new Error(authResult.error || 'Erro ao criar utilizador de autenticação');
                }

                // Step 3: Update local state with new staff (trigger will auto-link auth_id)
                const newStaff: Staff = {
                    id: staffRecord.id,
                    name: staffRecord.name,
                    email: staffRecord.email,
                    phone: staffRecord.phone || '',
                    role: staffRecord.role,
                    nif: staffRecord.nif || '',
                    notes: staffRecord.notes || '',
                    isActive: staffRecord.is_active,
                    auth_id: authResult.user?.id, // Will be set by trigger, but we can set it optimistically
                    company_id: companyId,
                    company_name: defaultCompanyName
                };

                setStaffList(prev => [...prev, newStaff]);
                showToast('Colaborador criado com sucesso!', 'success');
                setIsModalOpen(false);

                // Show credentials in a second toast
                setTimeout(() => {
                    showToast(`Login: ${currentStaff.email} | Senha: ${password}`, 'info', 8000);
                }, 500);

            } else {
                // Edit mode: update staff profile and optionally password
                const { error } = await supabase
                    .from('staff')
                    .update(staffData)
                    .eq('id', currentStaff.id);

                if (error) throw error;

                // If password provided, update it via Edge Function
                if (password && password.length >= 6 && currentStaff.auth_id) {
                    try {
                        const updateResult = await updateAuthUser({
                            userId: currentStaff.auth_id,
                            password: password
                        });

                        if (!updateResult.success) {
                            console.error('Error updating password:', updateResult.error);
                            showToast(`Perfil atualizado, mas erro ao alterar senha: ${updateResult.error}`, 'warning');
                        } else {
                            showToast(`Colaborador atualizado com sucesso!${password ? ' Nova senha definida.' : ''}`, 'success');
                        }
                    } catch (pwdError) {
                        console.error('Password update error:', pwdError);
                        showToast('Perfil atualizado, mas não foi possível alterar a senha.', 'warning');
                    }
                } else {
                    showToast('Colaborador atualizado com sucesso!', 'success');
                }

                setStaffList(prev => prev.map(s => s.id === currentStaff.id ? currentStaff : s));
                setIsModalOpen(false);
            }

        } catch (error: any) {
            console.error('Error saving staff:', error);
            setSubmitError(error.message || 'Erro ao salvar colaborador');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Styles (Consistent with other lists)
    const baseInputClass = "w-full appearance-none py-2.5 bg-white dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm pl-3";
    const labelClass = "block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5";

    // Role Badge Color
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Administrador': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case 'Gestor': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'Guia': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
            default: return 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Gestão de Equipa</h1>
                    <p className="text-gray-600 dark:text-[#92c9a0] text-base font-normal mt-1">Gerencie os colaboradores e acessos ao sistema.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold tracking-wide gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined">person_add</span>
                    <span>Novo Colaborador</span>
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
                            placeholder="Nome, Email ou Função..."
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
                                <th className="px-4 py-3 whitespace-nowrap">Empresa</th>
                                <th className="px-4 py-3 whitespace-nowrap">Email</th>
                                <th className="px-4 py-3 whitespace-nowrap">Telefone</th>
                                <th className="px-4 py-3 whitespace-nowrap">Função</th>
                                <th className="px-4 py-3 whitespace-nowrap">Observações</th>
                                <th className="px-4 py-3 text-center whitespace-nowrap">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex justify-center items-center gap-2">
                                            <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                            <span>Carregando equipa...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStaff.length > 0 ? (
                                filteredStaff.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${staff.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'}`}>
                                                {staff.isActive ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="size-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                                    {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{staff.name}</span>
                                                        {staff.auth_id ? (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" title="Login ativo">
                                                                <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                                                Login
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" title="Sem login">
                                                                <span className="material-symbols-outlined text-[10px]">error</span>
                                                                Sem Login
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-gray-400 text-sm">business</span>
                                                {staff.company_name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{staff.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{staff.phone}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(staff.role)}`}>
                                                {staff.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={staff.notes}>
                                            {staff.notes || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(staff)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                {canDelete('staff') && (
                                                    <button
                                                        onClick={() => handleDelete(staff.id)}
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
                                            <span className="material-symbols-outlined text-4xl opacity-50">group_off</span>
                                            <p>Nenhum colaborador encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Adding/Editing Staff */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-border overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-black/20">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {modalMode === 'add' ? 'Adicionar Novo Colaborador' : 'Editar Colaborador'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Error Alert */}
                            {submitError && (
                                <div className="col-span-1 md:col-span-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl flex-shrink-0">error</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">Erro ao salvar colaborador</p>
                                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">{submitError}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSubmitError(null)}
                                        className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            )}

                            {/* Company Field - Dropdown for SuperAdmin, Read-only for others */}
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Empresa</label>
                                {isSuperAdmin ? (
                                    <div className="relative">
                                        <select
                                            name="company_id"
                                            value={currentStaff.company_id || ''}
                                            onChange={(e) => {
                                                const selectedCompany = companies.find(c => c.id === e.target.value);
                                                setCurrentStaff(prev => ({
                                                    ...prev,
                                                    company_id: e.target.value,
                                                    company_name: selectedCompany?.name
                                                }));
                                            }}
                                            className={`${baseInputClass} pr-10 cursor-pointer`}
                                            required
                                        >
                                            <option value="">Selecione uma empresa...</option>
                                            {companies.map(company => (
                                                <option key={company.id} value={company.id}>
                                                    {company.name}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400 pointer-events-none">business</span>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={currentStaff.company_name || defaultCompanyName || 'Carregando...'}
                                            readOnly
                                            className={`${baseInputClass} bg-gray-50 dark:bg-black/20 cursor-not-allowed text-gray-500`}
                                        />
                                        <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">business</span>
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-1">
                                    {isSuperAdmin
                                        ? 'Escolha a empresa à qual o colaborador pertence.'
                                        : 'O colaborador será vinculado a esta empresa.'}
                                </p>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Nome Completo</label>
                                <div className="relative">
                                    <input
                                        type="text" name="name" required
                                        value={currentStaff.name} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="Ex: João Silva"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">person</span>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Email (Login)</label>
                                <div className="relative">
                                    <input
                                        type="email" name="email" required
                                        value={currentStaff.email}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'edit'}
                                        className={`${baseInputClass} pr-10 ${modalMode === 'edit' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        placeholder={modalMode === 'edit' ? 'Email não pode ser alterado' : 'email@naturisnor.com'}
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">email</span>
                                </div>
                                {modalMode === 'edit' && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                                        O email de login não pode ser alterado aqui. Para mudar, gerencie no Supabase Auth.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>Telefone</label>
                                <div className="relative">
                                    <input
                                        type="tel" name="phone"
                                        value={currentStaff.phone} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="+351 912 345 678"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">phone</span>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>NIF</label>
                                <div className="relative">
                                    <input
                                        type="text" name="nif"
                                        value={currentStaff.nif || ''} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="123456789"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">badge</span>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Função</label>
                                <div className="relative">
                                    <select
                                        name="role"
                                        value={currentStaff.role}
                                        onChange={handleInputChange}
                                        className={baseInputClass}
                                    >
                                        <option value="Administrador">Administrador</option>
                                        <option value="Gestor">Gestor</option>
                                        <option value="Guia">Guia</option>
                                        <option value="Condutor">Condutor</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            {/* Password field - Required for new users, Optional for edit */}
                            <div>
                                <label className={labelClass}>
                                    {modalMode === 'add' ? 'Senha Inicial *' : 'Nova Senha (Opcional)'}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required={modalMode === 'add'}
                                        minLength={6}
                                        className={`${baseInputClass} pr-20`}
                                        placeholder={modalMode === 'add' ? 'Mínimo 6 caracteres' : 'Deixe vazio para não alterar'}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                            tabIndex={-1}
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                                    {modalMode === 'add'
                                        ? 'Esta será a senha de login do colaborador'
                                        : 'Preencha apenas se desejar alterar a senha do colaborador'}
                                </p>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Observações</label>
                                <textarea
                                    name="notes"
                                    rows={3}
                                    value={currentStaff.notes} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Informações adicionais..."
                                />
                            </div>

                            {/* Status Switch in Modal */}
                            <div className="col-span-1 md:col-span-2 flex flex-col justify-end">
                                <label className={labelClass}>Estado do Colaborador</label>
                                <button
                                    type="button"
                                    onClick={handleStatusToggle}
                                    className={`flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all ${currentStaff.isActive
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-[#102215] border-gray-200 dark:border-gray-700'}`}
                                >
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${currentStaff.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${currentStaff.isActive ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                    <span className={`text-sm font-semibold ${currentStaff.isActive ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {currentStaff.isActive ? 'Ativo (Acesso Permitido)' : 'Inativo (Acesso Bloqueado)'}
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
                                    disabled={isSubmitting}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg flex items-center gap-2 ${isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-primary text-background-dark hover:bg-primary-dark shadow-primary/20'
                                        }`}
                                >
                                    {isSubmitting && (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    )}
                                    {isSubmitting
                                        ? (modalMode === 'add' ? 'Criando...' : 'Salvando...')
                                        : (modalMode === 'add' ? 'Criar Colaborador' : 'Salvar Alterações')
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};