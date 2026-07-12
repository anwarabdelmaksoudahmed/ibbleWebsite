import type { Permission } from '@core/auth/types'

export const PERMISSIONS: Record<Permission, string> = {
  'dashboard.view': 'View Dashboard',
  'products.view': 'View Products',
  'products.create': 'Create Products',
  'products.update': 'Update Products',
  'products.delete': 'Delete Products',
  'orders.view': 'View Orders',
  'orders.create': 'Create Orders',
  'orders.update': 'Update Orders',
  'orders.delete': 'Delete Orders',
  'customers.view': 'View Customers',
  'customers.create': 'Create Customers',
  'customers.update': 'Update Customers',
  'customers.delete': 'Delete Customers',
  'settings.view': 'View Settings',
  'settings.update': 'Update Settings',
  'users.manage': 'Manage Users',
}
