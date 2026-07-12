import type { Permission } from '@core/auth/types'
import { useAuth } from '@modules/auth/composables/useAuth'

export function usePermission() {
  const { hasPermission, hasRole, checkPermission, checkAnyPermission, permissions, roles } = useAuth()

  function can(permission: Permission | Permission[], mode: 'any' | 'all' = 'any'): boolean {
    return checkPermission(permission, mode)
  }

  function cannot(permission: Permission | Permission[]): boolean {
    return !can(permission)
  }

  function canAll(permissionsList: Permission[]): boolean {
    return can(permissionsList, 'all')
  }

  function isRole(role: string | string[]): boolean {
    const rolesList = Array.isArray(role) ? role : [role]
    return rolesList.some((item) => hasRole(item))
  }

  function canAny(permissionsList: Permission[]): boolean {
    return checkAnyPermission(permissionsList)
  }

  return {
    can,
    cannot,
    canAll,
    canAny,
    isRole,
    permissions,
    roles,
  }
}
