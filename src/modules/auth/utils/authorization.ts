import type { Permission, Role } from '@modules/auth/types'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { tokenManager } from '@modules/auth/utils/token-manager'

export function isAuthenticated(): boolean {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) return false
  if (!tokenManager.getAccessToken()) return false
  if (tokenManager.isAccessTokenExpired()) return false
  return true
}

export function hasRole(role: string, appName?: string): boolean {
  const authStore = useAuthStore()
  return authStore.roles.some((item: Role) => {
    if (appName) return item.name === role && item.appName === appName
    return item.name === role
  })
}

export function hasAnyRole(roles: string[]): boolean {
  return roles.some((role) => hasRole(role))
}

export function hasPermission(permission: Permission): boolean {
  const authStore = useAuthStore()
  return authStore.permissions.includes(permission)
}

export function hasAnyPermission(permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(permission))
}

export function hasAllPermissions(permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(permission))
}

export function isSessionExpired(): boolean {
  return tokenManager.isAccessTokenExpired()
}

export function isRefreshTokenExpired(): boolean {
  return tokenManager.isRefreshTokenExpired()
}
