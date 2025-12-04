import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PaymentMethod } from '../types';
import { useAuth } from '../context/AuthContext';

export const PaymentMethodsList: React.FC = () => {
    const { canDelete, companyId } = useAuth();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Status Filters (Toggles)
    const [showActive, setShowActive] = useState(true);
    const [showInactive, setShowInactive] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    // Form State
    const [currentMethod, setCurrentMethod] = useState<PaymentMethod>({
        id: '',
        name: '',
        code: '',
        description: '',
        apiConfig: undefined,
        isActive: true,
        displayOrder: 0,
        icon: '',
        apiEnabled: false,
        apiEndpoint: '',
        apiKeyEncrypted: '',
        apiSecretEncrypted: '',
        webhookUrl: '',
        webhookSecretEncrypted: '',
        sandboxMode: true,
        apiVersion: '',
        additionalConfig: {}
    });

    // Fetch Payment Methods
    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('payment_methods')
                .select('*')
                .order('display_order');

            if (error) throw error;

            // Map Supabase snake_case to camelCase
            const mappedMethods: PaymentMethod[] = (data || []).map(item => ({
                id: item.id,
                name: item.name,
                code: item.code,
                description: item.description,
                apiConfig: item.api_config,
                isActive: item.is_active,
                displayOrder: item.display_order,
                icon: item.icon,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
                apiEnabled: item.api_enabled,
                apiEndpoint: item.api_endpoint,
                apiKeyEncrypted: item.api_key_encrypted,
                apiSecretEncrypted: item.api_secret_encrypted,
                webhookUrl: item.webhook_url,
                webhookSecretEncrypted: item.webhook_secret_encrypted,
                sandboxMode: item.sandbox_mode,
                apiVersion: item.api_version,
                additionalConfig: item.additional_config
            }));

            setPaymentMethods(mappedMethods);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            alert('Erro ao carregar métodos de pagamento.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    // Filter Logic
    const filteredMethods = paymentMethods.filter(method => {
        const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            method.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (method.description && method.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = (method.isActive && showActive) || (!method.isActive && showInactive);

        return matchesSearch && matchesStatus;
    });

    // Handlers
    const handleDelete = async (id: string) => {
        if (window.confirm('Tem a certeza que deseja remover este método de pagamento?')) {
            try {
                const { error } = await supabase
                    .from('payment_methods')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setPaymentMethods(paymentMethods.filter(m => m.id !== id));
            } catch (error) {
                console.error('Error deleting payment method:', error);
                alert('Erro ao remover método de pagamento.');
            }
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setCurrentMethod({
            id: '',
            name: '',
            code: '',
            description: '',
            apiConfig: undefined,
            isActive: true,
            displayOrder: paymentMethods.length + 1,
            icon: '',
            apiEnabled: false,
            apiEndpoint: '',
            apiKeyEncrypted: '',
            apiSecretEncrypted: '',
            webhookUrl: '',
            webhookSecretEncrypted: '',
            sandboxMode: true,
            apiVersion: '',
            additionalConfig: {}
        });
        setIsModalOpen(true);
    };

    const openEditModal = (method: PaymentMethod) => {
        setModalMode('edit');
        setCurrentMethod(method);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentMethod(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusToggle = () => {
        setCurrentMethod(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const methodData = {
                name: currentMethod.name,
                code: currentMethod.code,
                description: currentMethod.description || null,
                icon: currentMethod.icon || null,
                display_order: Number(currentMethod.displayOrder),
                is_active: currentMethod.isActive,
                api_enabled: currentMethod.apiEnabled || false,
                api_endpoint: currentMethod.apiEndpoint || null,
                api_key_encrypted: currentMethod.apiKeyEncrypted || null,
                api_secret_encrypted: currentMethod.apiSecretEncrypted || null,
                webhook_url: currentMethod.webhookUrl || null,
                webhook_secret_encrypted: currentMethod.webhookSecretEncrypted || null,
                sandbox_mode: currentMethod.sandboxMode ?? true,
                api_version: currentMethod.apiVersion || null,
                additional_config: currentMethod.additionalConfig || {}
            };

            if (modalMode === 'add') {
                const { data, error } = await supabase
                    .from('payment_methods')
                    .insert([{ ...methodData, company_id: companyId }])
                    .select()
                    .single();

                if (error) throw error;

                const newMethod: PaymentMethod = {
                    id: data.id,
                    name: data.name,
                    code: data.code,
                    description: data.description,
                    apiConfig: data.api_config,
                    isActive: data.is_active,
                    displayOrder: data.display_order,
                    icon: data.icon,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                    apiEnabled: data.api_enabled,
                    apiEndpoint: data.api_endpoint,
                    apiKeyEncrypted: data.api_key_encrypted,
                    apiSecretEncrypted: data.api_secret_encrypted,
                    webhookUrl: data.webhook_url,
                    webhookSecretEncrypted: data.webhook_secret_encrypted,
                    sandboxMode: data.sandbox_mode,
                    apiVersion: data.api_version,
                    additionalConfig: data.additional_config
                };
                setPaymentMethods([...paymentMethods, newMethod]);
            } else {
                // Edit Mode
                const { error } = await supabase
                    .from('payment_methods')
                    .update(methodData)
                    .eq('id', currentMethod.id);

                if (error) throw error;

                setPaymentMethods(paymentMethods.map(m => m.id === currentMethod.id ? currentMethod : m));
            }

            setIsModalOpen(false);
            fetchPaymentMethods(); // Refresh to get updated data
        } catch (error: any) {
            console.error('Error saving payment method:', error);
            alert(`Erro ao salvar método de pagamento: ${error.message || 'Erro desconhecido'}`);
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
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Métodos de Pagamento</h1>
                    <p className="text-gray-600 dark:text-[#92c9a0] text-base font-normal mt-1">Gerir os métodos de pagamento disponíveis no sistema.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold tracking-wide gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined">add</span>
                    <span>Novo Método</span>
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
                            placeholder="Nome, Código ou Descrição..."
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
                                <th className="px-4 py-3 whitespace-nowrap">Ordem</th>
                                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 whitespace-nowrap">Nome</th>
                                <th className="px-4 py-3 whitespace-nowrap">Código</th>
                                <th className="px-4 py-3 whitespace-nowrap">Descrição</th>
                                <th className="px-4 py-3 whitespace-nowrap">Ícone</th>
                                <th className="px-4 py-3 text-center whitespace-nowrap">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
                            {filteredMethods.length > 0 ? (
                                filteredMethods.map((method) => (
                                    <tr key={method.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-sm font-bold text-gray-700 dark:text-gray-300">
                                                {method.displayOrder}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${method.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'}`}>
                                                {method.isActive ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{method.name}</td>
                                        <td className="px-4 py-3 text-xs font-mono font-medium text-gray-500 dark:text-gray-400">{method.code}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{method.description || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{method.icon || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(method)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Editar Método"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                {canDelete('payment_methods') && (
                                                    <button
                                                        onClick={() => handleDelete(method.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Apagar Método"
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
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl opacity-50">payments</span>
                                            <p>Nenhum método de pagamento encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Adding/Editing Payment Method */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-border overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-black/20">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {modalMode === 'add' ? 'Adicionar Novo Método de Pagamento' : 'Editar Método de Pagamento'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Nome do Método</label>
                                <div className="relative">
                                    <input
                                        type="text" name="name" required
                                        value={currentMethod.name} onChange={handleInputChange}
                                        className={`${baseInputClass} pr-10`} placeholder="Ex: MBWay"
                                    />
                                    <span className="material-symbols-outlined filled absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400">payments</span>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Código</label>
                                <input
                                    type="text" name="code" required
                                    value={currentMethod.code} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Ex: mbway"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Código único (sem espaços, minúsculas)</p>
                            </div>

                            <div>
                                <label className={labelClass}>Ordem de Exibição</label>
                                <input
                                    type="number" name="displayOrder" required min="0"
                                    value={currentMethod.displayOrder} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Ex: 1"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Descrição</label>
                                <textarea
                                    name="description"
                                    value={currentMethod.description || ''} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Descrição opcional do método de pagamento"
                                    rows={2}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Ícone (Opcional)</label>
                                <input
                                    type="text" name="icon"
                                    value={currentMethod.icon || ''} onChange={handleInputChange}
                                    className={baseInputClass} placeholder="Ex: credit_card"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nome do ícone Material Symbols</p>
                            </div>

                            {/* API Configuration Section */}
                            <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-gray-200 dark:border-surface-border">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Configuração API</h3>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentMethod(prev => ({ ...prev, apiEnabled: !prev.apiEnabled }))}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${currentMethod.apiEnabled
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                            : 'bg-gray-50 dark:bg-[#102215] border-gray-200 dark:border-gray-700'}`}
                                    >
                                        <div className={`w-8 h-4 rounded-full relative transition-colors ${currentMethod.apiEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${currentMethod.apiEnabled ? 'left-4' : 'left-0.5'}`}></div>
                                        </div>
                                        <span className={`text-xs font-semibold ${currentMethod.apiEnabled ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {currentMethod.apiEnabled ? 'API Ativa' : 'API Inativa'}
                                        </span>
                                    </button>
                                </div>

                                {currentMethod.apiEnabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className={labelClass}>Endpoint da API</label>
                                            <input
                                                type="url"
                                                name="apiEndpoint"
                                                value={currentMethod.apiEndpoint || ''}
                                                onChange={handleInputChange}
                                                className={baseInputClass}
                                                placeholder="https://api.exemplo.com/v1"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL base para a API de pagamentos</p>
                                        </div>

                                        <div>
                                            <label className={labelClass}>API Key</label>
                                            <input
                                                type="password"
                                                name="apiKeyEncrypted"
                                                value={currentMethod.apiKeyEncrypted || ''}
                                                onChange={handleInputChange}
                                                className={baseInputClass}
                                                placeholder="••••••••••••••••"
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>API Secret</label>
                                            <input
                                                type="password"
                                                name="apiSecretEncrypted"
                                                value={currentMethod.apiSecretEncrypted || ''}
                                                onChange={handleInputChange}
                                                className={baseInputClass}
                                                placeholder="••••••••••••••••"
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Versão da API</label>
                                            <input
                                                type="text"
                                                name="apiVersion"
                                                value={currentMethod.apiVersion || ''}
                                                onChange={handleInputChange}
                                                className={baseInputClass}
                                                placeholder="v1, v2, 2024-01-01"
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Modo Sandbox</label>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentMethod(prev => ({ ...prev, sandboxMode: !prev.sandboxMode }))}
                                                className={`flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all ${currentMethod.sandboxMode
                                                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}
                                            >
                                                <div className={`w-10 h-5 rounded-full relative transition-colors ${currentMethod.sandboxMode ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${currentMethod.sandboxMode ? 'left-1' : 'left-6'}`}></div>
                                                </div>
                                                <span className={`text-xs font-semibold ${currentMethod.sandboxMode ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300'}`}>
                                                    {currentMethod.sandboxMode ? 'Sandbox/Teste' : 'Produção'}
                                                </span>
                                            </button>
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className={labelClass}>Webhook URL</label>
                                            <input
                                                type="url"
                                                name="webhookUrl"
                                                value={currentMethod.webhookUrl || ''}
                                                onChange={handleInputChange}
                                                className={baseInputClass}
                                                placeholder="https://seusite.com/api/webhooks/pagamento"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL para receber notificações de pagamento</p>
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className={labelClass}>Webhook Secret</label>
                                            <input
                                                type="password"
                                                name="webhookSecretEncrypted"
                                                value={currentMethod.webhookSecretEncrypted || ''}
                                                onChange={handleInputChange}
                                                className={baseInputClass}
                                                placeholder="••••••••••••••••"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chave secreta para verificação de webhooks</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Switch in Modal */}
                            <div className="col-span-1 md:col-span-2 flex flex-col justify-end">
                                <label className={labelClass}>Estado do Método</label>
                                <button
                                    type="button"
                                    onClick={handleStatusToggle}
                                    className={`flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all ${currentMethod.isActive
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-[#102215] border-gray-200 dark:border-gray-700'}`}
                                >
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${currentMethod.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${currentMethod.isActive ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                    <span className={`text-sm font-semibold ${currentMethod.isActive ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {currentMethod.isActive ? 'Ativo (Disponível para uso)' : 'Inativo (Não disponível)'}
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
                                    {modalMode === 'add' ? 'Salvar Método' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};
