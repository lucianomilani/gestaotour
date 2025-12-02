import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { getRolePermissions, hasPermission, canAccessPage, canDelete, canEdit, canView, Permission, Role } from '../utils/permissions';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
    hasPermission: (permission: Permission) => boolean;
    canAccessPage: (path: string) => boolean;
    canDelete: (resource?: string) => boolean;
    canEdit: (resource: string) => boolean;
    canView: (resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (mounted) {
                    const user = await fetchUserProfile(session);
                    setUser(user);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                if (mounted) {
                    setUser(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                if (mounted) {
                    const user = await fetchUserProfile(session);
                    setUser(user);
                }
            } catch (error) {
                console.error('Error on auth state change:', error);
                if (mounted) {
                    setUser(null);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (session: Session | null): Promise<User | null> => {
        if (!session?.user) return null;
        const { user } = session;

        // IMPORTANT: Use user_metadata as primary source, with sensible fallback
        // Never default to 'Guia' as it has limited permissions
        let role = user.user_metadata?.role || 'Administrador';  // Safe fallback for admins
        let name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

        console.log('[Auth] Fetching profile for:', user.email, '| Initial role from metadata:', user.user_metadata?.role);

        try {
            // Add timeout to prevent hanging queries (5 seconds)
            const timeoutPromise = new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error('Query timeout')), 5000)
            );

            const queryPromise = supabase
                .from('staff')
                .select('role, name, is_active')
                .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
                .maybeSingle();

            const { data: staffProfile, error } = await Promise.race([
                queryPromise,
                timeoutPromise
            ]) as any;

            // If query succeeded and profile exists
            if (!error && staffProfile) {
                console.log('[Auth] Staff profile found:', { role: staffProfile.role, is_active: staffProfile.is_active });

                // Check if user is active
                if (staffProfile.is_active === false) {
                    console.warn('[Auth] User account is inactive');
                    throw new Error('Account is inactive');
                }

                role = staffProfile.role;
                name = staffProfile.name;
            } else if (error) {
                console.warn('[Auth] Staff profile query error:', error.message, '| Using metadata fallback');
                // Fall back to user_metadata - DO NOT change role here
            } else {
                console.warn('[Auth] No staff profile found | Using metadata fallback');
            }
        } catch (error: any) {
            if (error.message === 'Query timeout') {
                console.error('[Auth] Database query timeout - using user_metadata fallback');
            } else if (error.message === 'Account is inactive') {
                // Return null to log user out if account is inactive
                return null;
            } else {
                console.error('[Auth] Error fetching user profile:', error);
            }
            // Continue with user_metadata fallback (role already set from metadata)
        }

        console.log('[Auth] Final role assigned:', role);

        return {
            id: user.id,
            email: user.email || '',
            name: name,
            role: role as Role,
            avatar: user.user_metadata?.avatar_url,
            permissions: getRolePermissions(role as Role)
        };
    };

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    // Permission helper functions
    const checkPermission = (permission: Permission): boolean => {
        if (!user) return false;
        return hasPermission(user.role, permission);
    };

    const checkPageAccess = (path: string): boolean => {
        if (!user) return false;
        return canAccessPage(user.role, path);
    };

    const checkDelete = (resource?: string): boolean => {
        if (!user) return false;
        return canDelete(user.role, resource);
    };

    const checkEdit = (resource: string): boolean => {
        if (!user) return false;
        return canEdit(user.role, resource);
    };

    const checkView = (resource: string): boolean => {
        if (!user) return false;
        return canView(user.role, resource);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
            loading,
            hasPermission: checkPermission,
            canAccessPage: checkPageAccess,
            canDelete: checkDelete,
            canEdit: checkEdit,
            canView: checkView
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
