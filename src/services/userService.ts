/// <reference types="vite/client" />
import { supabase } from './supabase';

export interface CreateUserParams {
    email: string;
    password: string;
    name: string;
    role: string;
}

export interface CreateUserResponse {
    success: boolean;
    user?: {
        id: string;
        email: string;
    };
    error?: string;
}

/**
 * Create a new auth user via Database RPC (Self-hosted compatible)
 * Requires admin privileges
 */
/**
 * Create a new auth user using Hybrid Strategy (Client SignUp + Admin Fix)
 * This bypasses SQL insertion issues by using the official SignUp API
 */
export async function createAuthUser(params: CreateUserParams): Promise<CreateUserResponse> {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            throw new Error('Not authenticated');
        }

        // 1. Create a temporary client to sign up the new user
        // We need this to avoid logging out the current admin user
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        // Dynamic import to avoid issues if createClient isn't imported
        const { createClient } = await import('@supabase/supabase-js');
        const tempClient = createClient(supabaseUrl, supabaseAnonKey);

        // 2. Sign up the new user (this creates valid auth.users record)
        const { data: signUpData, error: signUpError } = await tempClient.auth.signUp({
            email: params.email,
            password: params.password,
            options: {
                data: {
                    name: params.name,
                    role: params.role
                }
            }
        });

        if (signUpError) {
            console.error('SignUp Error:', signUpError);
            let errorMessage = signUpError.message;
            if (errorMessage.includes('already registered')) {
                errorMessage = 'Este email já está registado no sistema.';
            }
            return { success: false, error: errorMessage };
        }

        if (!signUpData.user) {
            return { success: false, error: 'Falha ao criar utilizador (sem dados retornados).' };
        }

        const newUserId = signUpData.user.id;

        // 3. Call RPC to "bless" the user (confirm email, set admin role in staff)
        // We use the MAIN authenticated client (admin) for this
        const { error: rpcError } = await supabase.rpc('admin_fix_new_user', {
            target_user_id: newUserId,
            new_role: params.role
        });

        if (rpcError) {
            console.error('RPC Fix Error:', rpcError);
            // Even if RPC fails, user is created. We might want to warn.
            return {
                success: true,
                user: { id: newUserId, email: params.email },
                error: 'Usuário criado, mas houve erro ao definir permissões finais. Verifique no painel.'
            };
        }

        return {
            success: true,
            user: {
                id: newUserId,
                email: params.email
            }
        };
    } catch (error: any) {
        console.error('Create User Exception:', error);
        return {
            success: false,
            error: error.message || 'Erro inesperado ao criar utilizador.'
        };
    }
}
export interface UpdateUserParams {
    userId: string;
    password?: string;
    email?: string;
    userMetadata?: any;
}

/**
 * Update an auth user via Database RPC (Self-hosted compatible)
 * Requires admin privileges
 */
export async function updateAuthUser(params: UpdateUserParams): Promise<CreateUserResponse> {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            throw new Error('Not authenticated');
        }

        // Use RPC call instead of Edge Function
        const { error } = await supabase.rpc('admin_update_password', {
            target_user_id: params.userId,
            new_password: params.password
        });

        if (error) {
            console.error('RPC Error:', error);
            return {
                success: false,
                error: error.message || 'Erro ao atualizar senha.'
            };
        }

        return {
            success: true
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Erro inesperado ao atualizar utilizador.'
        };
    }
}
