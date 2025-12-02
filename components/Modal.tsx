import React, { useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    title,
    message,
    type = 'info',
    onClose,
    onConfirm,
    confirmText = 'OK',
    cancelText = 'Cancelar'
}) => {
    const [show, setShow] = useState(isOpen);

    useEffect(() => {
        setShow(isOpen);
    }, [isOpen]);

    if (!show) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'info';
        }
    };

    const getColorClass = () => {
        switch (type) {
            case 'success': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
            case 'error': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
            case 'warning': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
            case 'info': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-[#1a1d21] rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${getColorClass()}`}>
                        <span className="material-symbols-outlined text-2xl">{getIcon()}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        {onConfirm && (
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (onConfirm) onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all transform hover:scale-[1.02] ${type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' :
                                    type === 'warning' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' :
                                        'bg-primary hover:bg-primary-dark shadow-primary/20 text-background-dark'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
