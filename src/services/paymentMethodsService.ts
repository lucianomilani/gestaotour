import { supabase } from './supabase';
import { PaymentMethod } from '../types';

/**
 * Payment Methods Service
 * Centralized service for managing payment methods
 */

/**
 * Fetch all active payment methods sorted by display order
 */
export const fetchActivePaymentMethods = async (): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching payment methods:', error);
        throw error;
    }

    return (data || []).map(pm => ({
        id: pm.id,
        name: pm.name,
        code: pm.code,
        description: pm.description,
        apiConfig: pm.api_config,
        isActive: pm.is_active,
        displayOrder: pm.display_order,
        icon: pm.icon,
        createdAt: pm.created_at,
        updatedAt: pm.updated_at
    }));
};

/**
 * Fetch a specific payment method by ID
 */
export const getPaymentMethodById = async (id: string): Promise<PaymentMethod | null> => {
    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching payment method:', error);
        return null;
    }

    if (!data) return null;

    return {
        id: data.id,
        name: data.name,
        code: data.code,
        description: data.description,
        apiConfig: data.api_config,
        isActive: data.is_active,
        displayOrder: data.display_order,
        icon: data.icon,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
};

/**
 * Fetch all payment methods (including inactive) - for admin purposes
 */
export const fetchAllPaymentMethods = async (): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching all payment methods:', error);
        throw error;
    }

    return (data || []).map(pm => ({
        id: pm.id,
        name: pm.name,
        code: pm.code,
        description: pm.description,
        apiConfig: pm.api_config,
        isActive: pm.is_active,
        displayOrder: pm.display_order,
        icon: pm.icon,
        createdAt: pm.created_at,
        updatedAt: pm.updated_at
    }));
};
