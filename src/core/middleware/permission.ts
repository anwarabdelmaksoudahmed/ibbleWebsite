import type { Permission } from '@core/auth/types'
import { hasPermission } from '@core/permissions/checker'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { ROUTES } from '@shared/constants/routes'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const localePath = useLocalePath()
  const requiredPermission = to.meta.permission as Permission | Permission[] | undefined

  if (!requiredPermission) return

  const userPermissions = authStore.userPermissions
  const allowed = hasPermission(userPermissions, requiredPermission)

  if (!allowed) {
    return navigateTo(localePath(ROUTES.HOME))
  }
})
