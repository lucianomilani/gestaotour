import React, { useEffect } from 'react';

export type ConfirmVariant = 'danger' | 'success' | 'warning' | 'info';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    variant?: ConfirmVariant;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    variant = 'danger',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel
}) => {
    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onCancel();
            } else if (e.key === 'Enter' && e.ctrlKey) {
                onConfirm();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onConfirm, onCancel]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getConfig = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: 'warning',
                    iconBg: 'bg-gradient-to-br from-red-400 to-rose-600',
                    iconColor: 'text-white',
                    confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                    confirmText: 'text-white'
                };
            case 'success':
                return {
                    icon: 'check_circle',
                    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-600',
                    iconColor: 'text-white',
                    confirmBg: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
                    confirmText: 'text-white'
                };
            case 'warning':
                return {
                    icon: 'error',
                    iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-600',
                    iconColor: 'text-white',
                    confirmBg: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
                    confirmText: 'text-white'
                };
            case 'info':
                return {
                    icon: 'info',
                    iconBg: 'bg gradient-to-br from-blue-400 to-indigo-600',
                    iconColor: 'text-white',
                    confirmBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
                    confirmText: 'text-white'
                };
        }
    };

    const config = getConfig();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onCancel}
        >
            {/* Overlay with blur */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="
                    relative w-full max-w-md
                    bg-white dark:bg-gray-800
                    rounded-2xl shadow-2xl
                    border border-gray-200 dark:border-gray-700
                    transform transition-all duration-300
                    animate-scale-in
                "
                onClick={(e) => e.stopPropagation()}
            >
                {/* Content */}
                <div className="p-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className={`w-16 h-16 rounded-2xl ${config.iconBg} flex items-center justify-center shadow-lg`}>
                            <span className={`material-symbols-outlined text-3xl ${config.iconColor}`}>
                                {config.icon}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-center text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="
                                flex-1 px-4 py-2.5 
                                bg-gray-100 hover:bg-gray-200 
                                dark:bg-gray-700 dark:hover:bg-gray-600
                                text-gray-700 dark:text-gray-200
                                font-semibold text-sm
                                rounded-xl
                                transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                                dark:focus:ring-offset-gray-800
                            "
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`
                                flex-1 px-4 py-2.5
                                ${config.confirmBg}
                                ${config.confirmText}
                                font-semibold text-sm
                                rounded-xl
                                transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-offset-2
                                dark:focus:ring-offset-gray-800
                                shadow-lg
                            `}
                        >
                            {confirmText}
                        </button>
                    </div>

                    {/* Keyboard hint */}
                    <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
                        Pressione <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">ESC</kbd> para cancelar
                    </p>
                </div>
            </div>
        </div>
    );
};
