import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
    const location = useLocation();
    const { user, logout, canAccessPage } = useAuth();

    const allNavItems = [
        { label: 'Dashboard', icon: 'dashboard', path: '/' },
        { label: 'Reservas', icon: 'calendar_month', path: '/bookings' },
        { label: 'Calendário', icon: 'event', path: '/calendar' },
        { label: 'Passeios', icon: 'hiking', path: '/adventures' },
        { label: 'Agências', icon: 'storefront', path: '/agencies' },
        { label: 'Equipa', icon: 'badge', path: '/staff' },
        { label: 'Análise', icon: 'bar_chart', path: '/analytics' },
    ];

    // Filter navigation items based on user permissions
    const navItems = allNavItems.filter(item => canAccessPage(item.path));

    return (
        <aside className="w-64 flex-shrink-0 bg-background-light dark:bg-[#112215] border-r border-gray-200 dark:border-surface-border flex flex-col h-screen fixed left-0 top-0 z-20 transition-all">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-10 shadow-lg border-2 border-primary/20"
                        style={{ backgroundImage: `url("${user?.avatar || 'https://via.placeholder.com/150'}")` }}
                    ></div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-tight text-gray-900 dark:text-white">Naturisnor</h1>
                        <p className="text-xs font-medium text-gray-500 dark:text-[#92c9a0]">{user?.name || 'Gestão Turística'}</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
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
                    })}
                </nav>
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
