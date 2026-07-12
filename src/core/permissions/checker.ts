import type { Permission, UserRole } from '@core/auth/types'
import { ROLE_PERMISSIONS } from '@shared/constants/roles'

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export function hasPermission(
  userPermissions: Permission[],
  required: Permission | Permission[],
  mode: 'any' | 'all' = 'any',
): boolean {
  const requiredList = Array.isArray(required) ? required : [required]
  if (requiredList.length === 0) return true

  if (mode === 'all') {
    return requiredList.every((p) => userPermissions.includes(p))
  }

  return requiredList.some((p) => userPermissions.includes(p))
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  return roles.includes(userRole)
}
