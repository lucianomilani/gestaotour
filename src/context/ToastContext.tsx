import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastType } from '../components/Toast';
import { ConfirmDialog, ConfirmVariant } from '../components/ConfirmDialog';

interface ToastContextType {
    showToast: (message: string, type: ToastType, duration?: number) => void;
    showConfirm: (config: {
        title: string;
        message: string;
        variant?: ConfirmVariant;
        confirmText?: string;
        cancelText?: string;
    }) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Toast state
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean; duration?: number }>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    // Confirm dialog state
    const [confirm, setConfirm] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: ConfirmVariant;
        confirmText: string;
        cancelText: string;
        resolve?: (value: boolean) => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        variant: 'danger',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
    });

    const showToast = (message: string, type: ToastType, duration?: number) => {
        setToast({ message, type, isVisible: true, duration });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const showConfirm = (config: {
        title: string;
        message: string;
        variant?: ConfirmVariant;
        confirmText?: string;
        cancelText?: string;
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirm({
                isOpen: true,
                title: config.title,
                message: config.message,
                variant: config.variant || 'danger',
                confirmText: config.confirmText || 'Confirmar',
                cancelText: config.cancelText || 'Cancelar',
                resolve,
            });
        });
    };

    const handleConfirm = () => {
        if (confirm.resolve) {
            confirm.resolve(true);
        }
        setConfirm(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (confirm.resolve) {
            confirm.resolve(false);
        }
        setConfirm(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={toast.duration}
            />
            <ConfirmDialog
                isOpen={confirm.isOpen}
                title={confirm.title}
                message={confirm.message}
                variant={confirm.variant}
                confirmText={confirm.confirmText}
                cancelText={confirm.cancelText}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
