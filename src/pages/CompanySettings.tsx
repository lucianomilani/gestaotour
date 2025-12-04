import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { CompanySettings as CompanySettingsType } from '../types';
import { useToast } from '../context/ToastContext';

export const CompanySettings: React.FC = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [settings, setSettings] = useState<CompanySettingsType>({
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

    // Fetch company settings
    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('company_settings')
                .select('*')
                .limit(1)
                .single();

            if (error) throw error;

            if (data) {
                setSettings({
                    id: data.id,
                    code: data.code,
                    name: data.name,
                    nif: data.nif,
                    email: data.email,
                    phone: data.phone,
                    contact: data.contact,
                    iban: data.iban,
                    address: data.address,
                    postalCode: data.postal_code,
                    website: data.website,
                    logoUrl: data.logo_url,
                    description: data.description,
                    isActive: data.is_active,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at
                });
            }
        } catch (error: any) {
            console.error('Error fetching company settings:', error);
            showToast('Erro ao carregar configurações da empresa', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const { error } = await supabase
                .from('company_settings')
                .update({
                    code: settings.code,
                    name: settings.name,
                    nif: settings.nif,
                    email: settings.email,
                    phone: settings.phone,
                    contact: settings.contact,
                    iban: settings.iban || null,
                    address: settings.address,
                    postal_code: settings.postalCode,
                    website: settings.website || null,
                    logo_url: settings.logoUrl || null,
                    description: settings.description || null,
                    is_active: settings.isActive
                })
                .eq('id', settings.id);

            if (error) throw error;

            showToast('Configurações salvas com sucesso!', 'success');
            setIsEditMode(false);
            fetchSettings();
        } catch (error: any) {
            console.error('Error saving settings:', error);
            showToast(`Erro ao salvar configurações: ${error.message}`, 'error');
        }
    };

    const handleCancel = () => {
        setIsEditMode(false);
        fetchSettings();
    };

    const inputClass = "w-full appearance-none px-3 py-2.5 bg-gray-50 dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm";
    const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Configurações da Empresa</h1>
                    <p className="text-gray-600 dark:text-[#92c9a0] text-base font-normal mt-1">Gerir informações e identidade visual da empresa.</p>
                </div>
                <div className="flex gap-3">
                    {!isEditMode ? (
                        <button
                            onClick={() => setIsEditMode(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background-dark font-bold text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-lg">edit</span>
                            Editar
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background-dark font-bold text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                            >
                                <span className="material-symbols-outlined text-lg">save</span>
                                Salvar
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Basic Information Card */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Informações Básicas</h2>
                            <span className="material-symbols-outlined text-gray-400">business</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Nome da Empresa</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={settings.name}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Nome da empresa"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{settings.name}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>Código</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        name="code"
                                        value={settings.code}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="COMPANY001"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{settings.code}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>NIF</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        name="nif"
                                        value={settings.nif}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="000000000"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{settings.nif}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Contato</h2>
                            <span className="material-symbols-outlined text-gray-400">contact_mail</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Email</label>
                                {isEditMode ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={settings.email}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="contato@empresa.com"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{settings.email}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>Telefone</label>
                                {isEditMode ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={settings.phone}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="+351 000 000 000"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{settings.phone}</p>
                                )}
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Pessoa de Contato</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        name="contact"
                                        value={settings.contact}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Nome do responsável"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{settings.contact}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Endereço</h2>
                            <span className="material-symbols-outlined text-gray-400">location_on</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Morada</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        name="address"
                                        value={settings.address}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Rua Principal, nº 123"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{settings.address}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>Código Postal</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={settings.postalCode}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="0000-000"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{settings.postalCode}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>Website</label>
                                {isEditMode ? (
                                    <input
                                        type="url"
                                        name="website"
                                        value={settings.website || ''}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="https://www.empresa.com"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{settings.website || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financial Card */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dados Financeiros</h2>
                            <span className="material-symbols-outlined text-gray-400">account_balance</span>
                        </div>
                        <div className="p-6">
                            <div>
                                <label className={labelClass}>IBAN</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        name="iban"
                                        value={settings.iban || ''}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="PT50 0000 0000 0000 0000 0000 0"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white font-mono">{settings.iban || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3) */}
                <div className="lg:col-span-1 flex flex-col gap-6">

                    {/* Logo Card */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Logotipo</h2>
                            <span className="material-symbols-outlined text-gray-400">image</span>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            {settings.logoUrl && (
                                <div className="w-full aspect-video bg-gray-100 dark:bg-black/20 rounded-lg flex items-center justify-center overflow-hidden">
                                    <img
                                        src={settings.logoUrl}
                                        alt="Company Logo"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            )}
                            {isEditMode && (
                                <div>
                                    <label className={labelClass}>URL do Logotipo</label>
                                    <input
                                        type="url"
                                        name="logoUrl"
                                        value={settings.logoUrl || ''}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="https://exemplo.com/logo.png"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Cole a URL da imagem do logotipo
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Descrição</h2>
                            <span className="material-symbols-outlined text-gray-400">description</span>
                        </div>
                        <div className="p-6">
                            <label className={labelClass}>Sobre a Empresa</label>
                            {isEditMode ? (
                                <textarea
                                    name="description"
                                    value={settings.description || ''}
                                    onChange={handleInputChange}
                                    className={inputClass}
                                    rows={6}
                                    placeholder="Descrição da empresa..."
                                />
                            ) : (
                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {settings.description || '-'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
