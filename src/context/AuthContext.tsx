import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { getRolePermissions, hasPermission, canAccessPage, canDelete, canEdit, canView, Permission, Role } from '../utils/permissions';

interface AuthContextType {
    user: User | null;
    companyId: string | null;
    isSuperAdmin: boolean;
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
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // Get initial session
                const { data: { session } } = await supabase.auth.getSession();

                if (mounted) {
                    if (session) {
                        await handleSession(session);
                    } else {
                        setUser(null);
                        setCompanyId(null);
                        setIsSuperAdmin(false);
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        const handleSession = async (session: Session) => {
            try {
                const { user: userProfile, companyId: userCompanyId, isSuperAdmin: superAdminStatus } = await fetchUserProfile(session);

                if (mounted) {
                    setUser(userProfile);
                    setCompanyId(userCompanyId);
                    setIsSuperAdmin(superAdminStatus);
                }
            } catch (error) {
                console.error('Error handling session:', error);
                if (mounted) {
                    // Don't log out on error, just set minimal user state if possible
                    // or keep existing state. For now, safety fallback:
                    // setUser(null); 
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[Auth] Auth state change: ${event}`);

            if (mounted) {
                if (session) {
                    // Only fetch profile if it's a new session or explicit update
                    // This prevents excessive refreshing
                    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                        await handleSession(session);
                    }
                } else {
                    setUser(null);
                    setCompanyId(null);
                    setIsSuperAdmin(false);
                }

                // Ensure loading is false after any auth change
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (session: Session | null): Promise<{ user: User | null; companyId: string | null; isSuperAdmin: boolean }> => {
        if (!session?.user) return { user: null, companyId: null, isSuperAdmin: false };
        const { user } = session;

        // IMPORTANT: Use user_metadata as primary source, with sensible fallback
        // Never default to 'Guia' as it has limited permissions
        let role = user.user_metadata?.role || 'Administrador';  // Safe fallback for admins
        let name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        // Initialize isSuperAdmin from metadata to prevent loss during DB glitches
        let isSuperAdmin = user.user_metadata?.is_superadmin || false;
        let userCompanyId: string | null = null;

        // FAILSAFE: Hardcoded SuperAdmin emails to prevent lockout during DB issues
        const SUPER_ADMIN_EMAILS = ['tecnico@techx.pt', 'admin@gestaotour.com', 'leonel.marcelino@techxpt.com'];
        if (user.email && SUPER_ADMIN_EMAILS.includes(user.email)) {
            console.log('[Auth] User is in SuperAdmin whitelist:', user.email);
            isSuperAdmin = true;
        }

        console.log('[Auth] Fetching profile for:', user.email, '| Initial role:', role, '| SuperAdmin:', isSuperAdmin);

        try {
            // Retry logic: Try 3 times before giving up
            let staffProfile = null;
            let queryError = null;

            for (let i = 0; i < 3; i++) {
                try {
                    // Add timeout to prevent hanging queries (5 seconds)
                    const timeoutPromise = new Promise<null>((_, reject) =>
                        setTimeout(() => reject(new Error('Query timeout')), 5000)
                    );

                    // Consolidated query: Fetch EVERYTHING we need in one go
                    const queryPromise = supabase
                        .from('staff')
                        .select('role, name, is_active, company_id, is_superadmin')
                        .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
                        .maybeSingle();

                    const { data, error } = await Promise.race([
                        queryPromise,
                        timeoutPromise
                    ]) as any;

                    if (!error) {
                        staffProfile = data;
                        queryError = null;
                        break; // Success!
                    } else {
                        queryError = error;
                        console.warn(`[Auth] Attempt ${i + 1} failed:`, error.message);
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                    }
                } catch (err) {
                    queryError = err;
                    console.warn(`[Auth] Attempt ${i + 1} exception:`, err);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            // If query succeeded and profile exists
            if (!queryError && staffProfile) {
                console.log('[Auth] Staff profile found:', { role: staffProfile.role, is_superadmin: staffProfile.is_superadmin });

                // Check if user is active
                if (staffProfile.is_active === false) {
                    console.warn('[Auth] User account is inactive');
                    throw new Error('Account is inactive');
                }

                role = staffProfile.role;
                name = staffProfile.name;
                userCompanyId = staffProfile.company_id;
                isSuperAdmin = staffProfile.is_superadmin || false;

                // Sync metadata if it differs (Fire and forget to avoid blocking)
                if (user.user_metadata?.is_superadmin !== isSuperAdmin || user.user_metadata?.role !== role) {
                    console.log('[Auth] Syncing user metadata...');
                    supabase.auth.updateUser({
                        data: {
                            is_superadmin: isSuperAdmin,
                            role: role,
                            name: name
                        }
                    }).then(({ error }) => {
                        if (error) console.error('[Auth] Error syncing metadata:', error);
                    });
                }
            } else if (queryError) {
                console.warn('[Auth] Staff profile query failed after retries:', queryError, '| Using metadata/whitelist fallback');
                // Fall back to user_metadata/whitelist - DO NOT change role here
            } else {
                console.warn('[Auth] No staff profile found | Using metadata/whitelist fallback');
            }
        } catch (error: any) {
            if (error.message === 'Account is inactive') {
                // Return null to log user out if account is inactive
                return { user: null, companyId: null, isSuperAdmin: false };
            } else {
                console.error('[Auth] Error fetching user profile:', error);
            }
            // Continue with user_metadata fallback (role already set from metadata)
        }

        console.log('[Auth] Final state:', { role, companyId: userCompanyId, isSuperAdmin });

        return {
            user: {
                id: user.id,
                email: user.email || '',
                name: name,
                role: role as Role,
                avatar: user.user_metadata?.avatar_url,
                permissions: getRolePermissions(role as Role)
            },
            companyId: userCompanyId,
            isSuperAdmin
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
            companyId,
            isSuperAdmin,
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
