import { computed } from 'vue'
import type { LoginCredentials, Permission } from '@modules/auth/types'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import {
  hasAllPermissions,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
  isAuthenticated as resolveAuthenticationState,
  isSessionExpired,
} from '@modules/auth/utils/authorization'

export function useAuth() {
  const authStore = useAuthStore()

  const user = computed(() => authStore.currentUser)
  const roles = computed(() => authStore.roles)
  const permissions = computed(() => authStore.permissions)
  const isLoading = computed(() => authStore.isLoading)
  const authenticated = computed(() => authStore.isAuthenticated)

  async function login(credentials: LoginCredentials) {
    return authStore.login(credentials)
  }

  async function logout() {
    return authStore.logout()
  }

  async function refreshSession() {
    return authStore.refreshSession()
  }

  async function loadCurrentUser() {
    return authStore.loadCurrentUser()
  }

  function isAuthenticated(): boolean {
    return resolveAuthenticationState()
  }

  function hasRoleFn(role: string, appName?: string): boolean {
    return hasRole(role, appName)
  }

  function hasPermissionFn(permission: Permission): boolean {
    return hasPermission(permission)
  }

  function checkPermission(required: Permission | Permission[], mode: 'any' | 'all' = 'any'): boolean {
    const requiredList = Array.isArray(required) ? required : [required]
    if (requiredList.length === 0) return true
    return mode === 'all' ? hasAllPermissions(requiredList) : hasAnyPermission(requiredList)
  }

  function checkRole(requiredRoles: string | string[]): boolean {
    const rolesList = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return hasAnyRole(rolesList)
  }

  function checkAnyPermission(required: Permission[]): boolean {
    return hasAnyPermission(required)
  }

  return {
    user,
    roles,
    permissions,
    authenticated,
    isLoading,
    isSessionExpired,
    login,
    logout,
    refreshSession,
    loadCurrentUser,
    isAuthenticated,
    hasRole: hasRoleFn,
    hasPermission: hasPermissionFn,
    checkPermission,
    checkRole,
    checkAnyPermission,
  }
}
