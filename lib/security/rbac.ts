// ── Role-Based Access Control ──
// Enforces what each role can and cannot do.

import type { UserRole } from '../types';

export type Permission =
  | 'booking:create' | 'booking:read_own' | 'booking:read_all' | 'booking:approve' | 'booking:deny'
  | 'equipment:read' | 'equipment:create' | 'equipment:update' | 'equipment:delete'
  | 'ticket:create' | 'ticket:read_own' | 'ticket:read_all' | 'ticket:update'
  | 'software:create' | 'software:read_own' | 'software:read_all' | 'software:approve'
  | 'report:create' | 'report:read_own' | 'report:read_all'
  | 'user:read_all' | 'user:create' | 'user:update' | 'user:delete'
  | 'audit:read'
  | 'analytics:read'
  | 'settings:manage';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [
    'booking:create', 'booking:read_own',
    'equipment:read',
    'ticket:create', 'ticket:read_own',
    'report:read_own',
  ],
  teacher: [
    'booking:read_own',
    'equipment:read',
    'ticket:create', 'ticket:read_own',
    'software:create', 'software:read_own',
    'report:create', 'report:read_own',
  ],
  sa: [
    'booking:read_all', 'booking:approve', 'booking:deny',
    'equipment:read', 'equipment:update',
    'ticket:read_all', 'ticket:update',
    'software:read_all',
    'report:read_all',
  ],
  admin: [
    'booking:create', 'booking:read_own', 'booking:read_all', 'booking:approve', 'booking:deny',
    'equipment:read', 'equipment:create', 'equipment:update', 'equipment:delete',
    'ticket:create', 'ticket:read_own', 'ticket:read_all', 'ticket:update',
    'software:create', 'software:read_own', 'software:read_all', 'software:approve',
    'report:create', 'report:read_own', 'report:read_all',
    'user:read_all', 'user:create', 'user:update', 'user:delete',
    'audit:read',
    'analytics:read',
    'settings:manage',
  ],
};

/** Check if a role has a specific permission */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Get all permissions for a role */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/** Check if a user can access a specific route */
export function canAccessRoute(role: UserRole | undefined, path: string): boolean {
  if (!role) return false;
  const routeMap: Record<string, UserRole[]> = {
    '/student': ['student'],
    '/teacher': ['teacher'],
    '/sa': ['sa'],
    '/admin': ['admin'],
  };
  const allowedRoles = routeMap[path];
  if (!allowedRoles) return true; // public route
  return allowedRoles.includes(role);
}

/** Validate that a user can only access their own data (IDOR prevention) */
export function canAccessUserData(currentUserId: string | undefined, targetUserId: string, role: UserRole | undefined): boolean {
  if (!currentUserId || !role) return false;
  if (role === 'admin') return true; // Admin can access all
  if (role === 'sa') return true; // SA can access operational data
  return currentUserId === targetUserId; // Others only own data
}
