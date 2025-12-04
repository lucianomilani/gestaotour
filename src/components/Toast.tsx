import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, duration = 4000 }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (isVisible) {
            // Progress bar animation
            const interval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev - (100 / (duration / 100));
                    if (newProgress <= 0) {
                        clearInterval(interval);
                        onClose();
                        return 0;
                    }
                    return newProgress;
                });
            }, 100);

            return () => clearInterval(interval);
        } else {
            setProgress(100);
        }
    }, [isVisible, onClose, duration]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'cancel';
            case 'warning': return 'warning';
            case 'info': return 'info';
        }
    };

    const getConfig = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-white/90 dark:bg-gray-800/90',
                    border: 'border-green-200 dark:border-green-800',
                    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-600',
                    iconColor: 'text-white',
                    textColor: 'text-gray-900 dark:text-white',
                    progressBg: 'bg-green-500',
                    shadow: 'shadow-lg shadow-green-500/20'
                };
            case 'error':
                return {
                    bg: 'bg-white/90 dark:bg-gray-800/90',
                    border: 'border-red-200 dark:border-red-800',
                    iconBg: 'bg-gradient-to-br from-red-400 to-rose-600',
                    iconColor: 'text-white',
                    textColor: 'text-gray-900 dark:text-white',
                    progressBg: 'bg-red-500',
                    shadow: 'shadow-lg shadow-red-500/20'
                };
            case 'warning':
                return {
                    bg: 'bg-white/90 dark:bg-gray-800/90',
                    border: 'border-orange-200 dark:border-orange-800',
                    iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-600',
                    iconColor: 'text-white',
                    textColor: 'text-gray-900 dark:text-white',
                    progressBg: 'bg-orange-500',
                    shadow: 'shadow-lg shadow-orange-500/20'
                };
            case 'info':
                return {
                    bg: 'bg-white/90 dark:bg-gray-800/90',
                    border: 'border-blue-200 dark:border-blue-800',
                    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-600',
                    iconColor: 'text-white',
                    textColor: 'text-gray-900 dark:text-white',
                    progressBg: 'bg-blue-500',
                    shadow: 'shadow-lg shadow-blue-500/20'
                };
        }
    };

    const config = getConfig();

    return (
        <div
            className={`
                fixed top-6 right-6 z-50 
                flex items-start gap-3 
                min-w-[320px] max-w-md
                p-4 pr-3
                rounded-2xl border
                backdrop-blur-xl
                ${config.bg}
                ${config.border}
                ${config.shadow}
                transform transition-all duration-500 ease-out
                ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
                animate-slide-in-right
            `}
        >
            {/* Icon with gradient background */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center shadow-md`}>
                <span className={`material-symbols-outlined text-xl ${config.iconColor}`}>
                    {getIcon()}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
                <p className={`font-semibold text-sm leading-relaxed ${config.textColor}`}>
                    {message}
                </p>
            </div>

            {/* Close button */}
            <button
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors group"
            >
                <span className="material-symbols-outlined text-lg text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    close
                </span>
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-2xl overflow-hidden">
                <div
                    className={`h-full ${config.progressBg} transition-all duration-100 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
