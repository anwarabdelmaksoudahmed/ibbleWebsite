import { GUEST_ROUTES, PROTECTED_ROUTE_PREFIXES, ROUTES } from '@shared/constants/routes'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { tokenManager } from '@modules/auth/utils/token-manager'
import { pathMatchesPrefix } from '@shared/utils/locale-path'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const localePath = useLocalePath()

  if (!authStore.isAuthenticated) {
    authStore.hydrateFromStorage()
  }

  if (authStore.isAuthenticated && tokenManager.isAccessTokenExpired()) {
    authStore.clearSession()
  }

  const isGuestRoute = GUEST_ROUTES.some((route) => pathMatchesPrefix(to.path, route))
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) => pathMatchesPrefix(to.path, prefix))

  if (isProtectedRoute && !authStore.isAuthenticated) {
    return navigateTo({
      path: localePath(ROUTES.AUTH.LOGIN),
      query: { redirect: to.fullPath },
    })
  }

  if (isGuestRoute && authStore.isAuthenticated) {
    return navigateTo(localePath(ROUTES.HOME))
  }

  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.loadCurrentUser()
  }
})
