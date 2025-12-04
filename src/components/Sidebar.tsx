import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export const Sidebar = () => {
    const location = useLocation();
    const { user, logout, canAccessPage, isSuperAdmin } = useAuth();
    const [companySettings, setCompanySettings] = React.useState<{ name: string; logoUrl: string } | null>(null);

    React.useEffect(() => {
        const fetchCompanySettings = async () => {
            try {
                const { data } = await supabase
                    .from('company_settings')
                    .select('name, logo_url')
                    .single();

                if (data) {
                    setCompanySettings({
                        name: data.name,
                        logoUrl: data.logo_url
                    });
                }
            } catch (error) {
                console.error('Error fetching company settings:', error);
            }
        };

        fetchCompanySettings();
    }, []);

    const mainNavItems = [
        { label: 'Dashboard', icon: 'dashboard', path: '/' },
        { label: 'Reservas', icon: 'calendar_month', path: '/bookings' },
        { label: 'Calendário', icon: 'event', path: '/calendar' },
        { label: 'Passeios', icon: 'hiking', path: '/adventures' },
        { label: 'Análise', icon: 'bar_chart', path: '/analytics' },
    ];

    const definitionNavItems = [
        { label: 'Agências', icon: 'storefront', path: '/agencies' },
        { label: 'Equipa', icon: 'badge', path: '/staff' },
        { label: 'Pagamentos', icon: 'payments', path: '/payment-methods' },
    ];

    // Filter navigation items based on user permissions
    const filteredMainItems = mainNavItems.filter(item => canAccessPage(item.path));
    const filteredDefinitionItems = definitionNavItems.filter(item => canAccessPage(item.path));

    const renderNavItem = (item: { label: string; icon: string; path: string }) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
            <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive
                        ? 'bg-primary text-background-dark font-semibold shadow-md shadow-primary/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'}
                `}
            >
                <span className={`material-symbols-outlined ${isActive ? 'material-symbols-filled' : ''}`}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
            </NavLink>
        );
    };

    return (
        <aside className="w-64 flex-shrink-0 bg-background-light dark:bg-[#112215] border-r border-gray-200 dark:border-surface-border flex flex-col h-screen fixed left-0 top-0 z-20 transition-all">
            <div className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-8 flex-shrink-0">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-10 shadow-lg border-2 border-primary/20 bg-white dark:bg-white/10"
                        style={{ backgroundImage: `url("${companySettings?.logoUrl || user?.avatar || 'https://via.placeholder.com/150'}")` }}
                    ></div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-tight text-gray-900 dark:text-white">GestãoTour</h1>
                        <p className="text-xs font-medium text-gray-500 dark:text-[#92c9a0] truncate max-w-[140px]">
                            {companySettings?.name || 'Carregando...'}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-8">
                    {/* Main Block */}
                    <nav className="flex flex-col gap-2">
                        {filteredMainItems.map(renderNavItem)}
                    </nav>

                    {/* Definitions Block */}
                    {filteredDefinitionItems.length > 0 && (
                        <div className="space-y-2">
                            <div className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                Definições
                            </div>
                            <nav className="flex flex-col gap-2">
                                {filteredDefinitionItems.map(renderNavItem)}
                            </nav>
                        </div>
                    )}

                    {/* Settings Block - Always Visible */}
                    <div className="space-y-2">
                        <div className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            Sistema
                        </div>
                        <nav className="flex flex-col gap-2">
                            {renderNavItem({ label: 'Configurações', icon: 'settings', path: '/company-settings' })}
                        </nav>
                    </div>

                    {/* SuperAdmin Block */}
                    {isSuperAdmin && (
                        <div className="space-y-2">
                            <div className="px-3 text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wider">
                                SuperAdmin
                            </div>
                            <nav className="flex flex-col gap-2">
                                {renderNavItem({ label: 'Empresas', icon: 'apartment', path: '/companies' })}
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto p-6 flex flex-col gap-2">
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined">help</span>
                    <span className="text-sm font-medium">Ajuda</span>
                </button>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm font-medium">Sair</span>
                </button>
            </div>
        </aside>
    );
};
