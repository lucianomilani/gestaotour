import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { CompanySettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createAuthUser } from '../services/userService';

export const CompaniesList: React.FC = () => {
    const navigate = useNavigate();
    const { isSuperAdmin } = useAuth();
    const { showToast } = useToast();
    const [companies, setCompanies] = useState<CompanySettings[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentCompany, setCurrentCompany] = useState<CompanySettings>({
        id: '',
        code: '',
        name: '',
        nif: '',
        email: '',
        phone: '',
        contact: '',
        iban: '',
        address: '',
        postalCode: '',
        website: '',
        logoUrl: '',
        description: '',
        isActive: true
    });

    // Redirect if not SuperAdmin
    useEffect(() => {
        if (!loading && !isSuperAdmin) {
            showToast('Acesso negado. Apenas SuperAdmin pode aceder a esta página.', 'error');
            navigate('/dashboard');
        }
    }, [isSuperAdmin, loading, navigate]);

    // Fetch Companies
    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('company_settings')
                .select('*')
                .order('name');

            if (error) throw error;

            const mappedCompanies: CompanySettings[] = (data || []).map(item => ({
                id: item.id,
                code: item.code,
                name: item.name,
                nif: item.nif,
                email: item.email,
                phone: item.phone,
                contact: item.contact,
                iban: item.iban,
                address: item.address,
                postalCode: item.postal_code,
                website: item.website,
                logoUrl: item.logo_url,
                description: item.description,
                isActive: item.is_active,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }));

            setCompanies(mappedCompanies);
        } catch (error: any) {
            console.error('Error fetching companies:', error);
            showToast('Erro ao carregar empresas', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isSuperAdmin) {
            fetchCompanies();
        }
    }, [isSuperAdmin]);

    // Filter Logic
    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Admin Creation State
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Handlers
    const openAddModal = () => {
        setModalMode('add');
        setCurrentCompany({
            id: '', code: '', name: '', nif: '', email: '', phone: '', contact: '',
            iban: '', address: '', postalCode: '', website: '', logoUrl: '', description: '',
            isActive: true
        });
        // Reset admin fields
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');

        setIsModalOpen(true);
    };

    const openEditModal = (company: CompanySettings) => {
        setModalMode('edit');
        setCurrentCompany(company);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentCompany(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const companyData = {
                code: currentCompany.code,
                name: currentCompany.name,
                nif: currentCompany.nif,
                email: currentCompany.email,
                phone: currentCompany.phone,
                contact: currentCompany.contact,
                iban: currentCompany.iban || null,
                address: currentCompany.address,
                postal_code: currentCompany.postalCode,
                website: currentCompany.website || null,
                logo_url: currentCompany.logoUrl || null,
                description: currentCompany.description || null,
                is_active: currentCompany.isActive
            };

            if (modalMode === 'add') {
                // 1. Create Company
                const { data: newCompany, error: companyError } = await supabase
                    .from('company_settings')
                    .insert([companyData])
                    .select()
                    .single();

                if (companyError) throw companyError;

                // 2. Create Admin User (if fields are filled)
                if (adminEmail && adminPassword && adminName) {
                    try {
                        // Create Auth User via RPC
                        const authResult = await createAuthUser({
                            email: adminEmail,
                            password: adminPassword,
                            name: adminName,
                            role: 'Administrador'
                        });

                        if (!authResult.success || !authResult.user) {
                            throw new Error(authResult.error || 'Erro ao criar utilizador administrador.');
                        }

                        // Create Staff Record linked to new company
                        const { error: staffError } = await supabase
                            .from('staff')
                            .insert([{
                                auth_id: authResult.user.id,
                                name: adminName,
                                email: adminEmail,
                                role: 'Administrador',
                                company_id: newCompany.id,
                                is_active: true
                            }]);

                        if (staffError) {
                            console.error('Error creating staff record:', staffError);
                            showToast('Empresa criada, mas erro ao criar registo de staff do admin.', 'warning');
                        } else {
                            showToast('Empresa e Administrador criados com sucesso!', 'success');
                        }
                    } catch (adminError: any) {
                        console.error('Error creating admin:', adminError);
                        showToast(`Empresa criada, mas erro ao criar admin: ${adminError.message}`, 'warning');
                    }
                } else {
                    showToast('Empresa criada com sucesso (sem administrador)!', 'success');
                }

                fetchCompanies();
            } else {
                const { error } = await supabase
                    .from('company_settings')
                    .update(companyData)
                    .eq('id', currentCompany.id);

                if (error) throw error;

                showToast('Empresa atualizada com sucesso!', 'success');
                fetchCompanies();
            }

            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving company:', error);
            showToast(`Erro ao salvar empresa: ${error.message}`, 'error');
        }
    };

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
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Gestão de Empresas</h1>
                    <p className="text-gray-600 dark:text-[#92c9a0] text-base font-normal mt-1">Gerir empresas no sistema (SuperAdmin)</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold tracking-wide gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined">add_business</span>
                    <span>Nova Empresa</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-5 shadow-sm">
                <div className="w-full max-w-md relative">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Pesquisar</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Nome ou código da empresa..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
                                <th className="px-4 py-3 whitespace-nowrap">Nome</th>
                                <th className="px-4 py-3 whitespace-nowrap">NIF</th>
                                <th className="px-4 py-3 whitespace-nowrap">Email</th>
                                <th className="px-4 py-3 whitespace-nowrap">Telefone</th>
                                <th className="px-4 py-3 text-center whitespace-nowrap">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
                            {filteredCompanies.length > 0 ? (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${company.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'}`}>
                                                {company.isActive ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono font-medium text-gray-500 dark:text-gray-400">{company.code}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{company.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{company.nif}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{company.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{company.phone}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => openEditModal(company)}
                                                className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl opacity-50">domain_disabled</span>
                                            <p>Nenhuma empresa encontrada.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Adding/Editing Company */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-border overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-black/20 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {modalMode === 'add' ? 'Criar Nova Empresa' : 'Editar Empresa'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Nome da Empresa</label>
                                <input
                                    type="text" name="name" required
                                    value={currentCompany.name} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Ex: Turismo Norte"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Código</label>
                                <input
                                    type="text" name="code" required
                                    value={currentCompany.code} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="COMP001"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>NIF</label>
                                <input
                                    type="text" name="nif" required
                                    value={currentCompany.nif} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="000000000"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Email</label>
                                <input
                                    type="email" name="email" required
                                    value={currentCompany.email} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="contato@empresa.com"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Telefone</label>
                                <input
                                    type="tel" name="phone" required
                                    value={currentCompany.phone} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="+351 000 000 000"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Pessoa de Contato</label>
                                <input
                                    type="text" name="contact" required
                                    value={currentCompany.contact} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Nome do responsável"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Morada</label>
                                <input
                                    type="text" name="address" required
                                    value={currentCompany.address} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Rua Principal, nº 123"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Código Postal</label>
                                <input
                                    type="text" name="postalCode" required
                                    value={currentCompany.postalCode} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="0000-000"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Website</label>
                                <input
                                    type="url" name="website"
                                    value={currentCompany.website || ''} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="https://www.empresa.com"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={currentCompany.isActive}
                                        onChange={(e) => setCurrentCompany(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="absolute w-6 h-6 opacity-0 cursor-pointer z-10"
                                    />
                                    <label htmlFor="isActive" className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${currentCompany.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></label>
                                    <div className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${currentCompany.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                    Empresa Ativa
                                </label>
                            </div>

                            {/* Admin Creation Section - Only for new companies */}
                            {modalMode === 'add' && (
                                <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                                        Criar Administrador da Empresa
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className={labelClass}>Nome do Administrador</label>
                                            <input
                                                type="text"
                                                value={adminName}
                                                onChange={(e) => setAdminName(e.target.value)}
                                                className={baseInputClass}
                                                placeholder="Nome completo"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Email de Login</label>
                                            <input
                                                type="email"
                                                value={adminEmail}
                                                onChange={(e) => setAdminEmail(e.target.value)}
                                                className={baseInputClass}
                                                placeholder="admin@empresa.com"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Senha Inicial</label>
                                            <input
                                                type="password"
                                                value={adminPassword}
                                                onChange={(e) => setAdminPassword(e.target.value)}
                                                className={baseInputClass}
                                                placeholder="Mínimo 6 caracteres"
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                    {modalMode === 'add' ? 'Criar Empresa' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
