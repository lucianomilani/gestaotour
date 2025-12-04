import React from 'react';
import { Outlet } from 'react-router-dom';

export const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050b07] font-sans text-gray-900 dark:text-white transition-colors duration-300">
            {/* Simple Header */}
            <header className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-surface-border sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary text-2xl">kayaking</span>
                        </div>
                        <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                            Naturis<span className="text-primary">Nor</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-gray-200 dark:border-surface-border mt-auto bg-white dark:bg-surface-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} NaturisNor. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
};
