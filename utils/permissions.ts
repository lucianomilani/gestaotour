// Role-based permissions system

export type Role = 'Administrador' | 'Gestor' | 'Guia' | 'Condutor';

export type Permission =
    | 'view_dashboard'
    | 'view_bookings'
    | 'edit_bookings'
    | 'delete_bookings'
    | 'view_calendar'
    | 'view_adventures'
    | 'edit_adventures'
    | 'delete_adventures'
    | 'view_agencies'
    | 'edit_agencies'
    | 'delete_agencies'
    | 'view_staff'
    | 'edit_staff'
    | 'delete_staff'
    | 'view_analytics'
    | 'delete_any';

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY: Record<Role, number> = {
    'Administrador': 4,
    'Gestor': 3,
    'Guia': 2,
    'Condutor': 1
};

// Permission matrix
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    'Administrador': [
        'view_dashboard',
        'view_bookings',
        'edit_bookings',
        'delete_bookings',
        'view_calendar',
        'view_adventures',
        'edit_adventures',
        'delete_adventures',
        'view_agencies',
        'edit_agencies',
        'delete_agencies',
        'view_staff',
        'edit_staff',
        'delete_staff',
        'view_analytics',
        'delete_any'
    ],
    'Gestor': [
        'view_dashboard',
        'view_bookings',
        'edit_bookings',
        'view_calendar',
        'view_adventures',
        'edit_adventures',
        'view_agencies',
        'edit_agencies',
        'view_staff',
        'view_analytics'
    ],
    'Guia': [
        'view_bookings',
        'view_calendar'
    ],
    'Condutor': [
        'view_bookings',
        'view_calendar'
    ]
};

// Page access mapping
export const PAGE_PERMISSIONS: Record<string, Permission> = {
    '/': 'view_dashboard',
    '/bookings': 'view_bookings',
    '/calendar': 'view_calendar',
    '/adventures': 'view_adventures',
    '/agencies': 'view_agencies',
    '/staff': 'view_staff',
    '/analytics': 'view_analytics'
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role can access a specific page
 */
export function canAccessPage(role: Role, path: string): boolean {
    const permission = PAGE_PERMISSIONS[path];
    if (!permission) return true; // Allow access to unmapped pages
    return hasPermission(role, permission);
}

/**
 * Check if a role can delete records
 */
export function canDelete(role: Role, resource?: string): boolean {
    if (hasPermission(role, 'delete_any')) return true;
    if (resource) {
        return hasPermission(role, `delete_${resource}` as Permission);
    }
    return false;
}

/**
 * Check if a role can edit a resource
 */
export function canEdit(role: Role, resource: string): boolean {
    return hasPermission(role, `edit_${resource}` as Permission);
}

/**
 * Check if a role can view a resource
 */
export function canView(role: Role, resource: string): boolean {
    return hasPermission(role, `view_${resource}` as Permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if role A has higher or equal privileges than role B
 */
export function hasHigherOrEqualRole(roleA: Role, roleB: Role): boolean {
    return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
}

/**
 * Get the default redirect path for a role
 */
export function getDefaultPath(role: Role): string {
    if (hasPermission(role, 'view_dashboard')) return '/';
    if (hasPermission(role, 'view_bookings')) return '/bookings';
    return '/calendar';
}
