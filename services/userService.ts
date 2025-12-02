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
 * Create a new auth user via Edge Function
 * Requires admin privileges
 */
export async function createAuthUser(params: CreateUserParams): Promise<CreateUserResponse> {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                },
                body: JSON.stringify(params)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            // Parse specific error messages
            let errorMessage = data.error || 'Failed to create user';

            if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
                errorMessage = 'Este email já está registado no sistema.';
            } else if (errorMessage.includes('Password')) {
                errorMessage = 'A senha fornecida não cumpre os requisitos mínimos.';
            } else if (errorMessage.includes('Forbidden') || errorMessage.includes('Admin')) {
                errorMessage = 'Sem permissões de administrador para criar utilizadores.';
            } else if (errorMessage.includes('Unauthorized')) {
                errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
            }

            return {
                success: false,
                error: errorMessage
            };
        }

        return data;
    } catch (error: any) {
        let errorMessage = 'Erro de rede ao criar utilizador.';

        if (error.message?.includes('Failed to fetch')) {
            errorMessage = 'Não foi possível conectar ao servidor. Verifique a Edge Function.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}
