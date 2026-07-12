import type { Permission, UserRole } from '@core/auth/types'

export const ROLES: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  user: 'User',
  guest: 'Guest',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'dashboard.view',
    'products.view', 'products.create', 'products.update', 'products.delete',
    'orders.view', 'orders.create', 'orders.update', 'orders.delete',
    'customers.view', 'customers.create', 'customers.update', 'customers.delete',
    'settings.view', 'settings.update',
    'users.manage',
  ],
  admin: [
    'dashboard.view',
    'products.view', 'products.create', 'products.update', 'products.delete',
    'orders.view', 'orders.create', 'orders.update', 'orders.delete',
    'customers.view', 'customers.create', 'customers.update', 'customers.delete',
    'settings.view', 'settings.update',
    'users.manage',
  ],
  manager: [
    'dashboard.view',
    'products.view', 'products.create', 'products.update',
    'orders.view', 'orders.create', 'orders.update',
    'customers.view', 'customers.create', 'customers.update',
    'settings.view',
  ],
  user: [
    'dashboard.view',
    'products.view',
    'orders.view',
    'customers.view',
  ],
  guest: [],
}
