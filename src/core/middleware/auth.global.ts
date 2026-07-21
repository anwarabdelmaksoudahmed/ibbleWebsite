import { GUEST_ROUTES, PROTECTED_ROUTE_PREFIXES, ROUTES } from '@shared/constants/routes'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { tokenManager } from '@modules/auth/utils/token-manager'
import { resolveAuthRedirect } from '@shared/utils/auth-redirect'
import { pathMatchesPrefix } from '@shared/utils/locale-path'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const localePath = useLocalePath()

  // Access tokens live in localStorage — session can only be resolved on the client.
  if (import.meta.client) {
    authStore.hydrateFromStorage()

    if (authStore.isAuthenticated && tokenManager.isAccessTokenExpired()) {
      authStore.clearSession()
    }
  }

  const isGuestRoute = GUEST_ROUTES.some((route) => pathMatchesPrefix(to.path, route))
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathMatchesPrefix(to.path, prefix),
  )

  // Skip auth redirects during SSR — otherwise a refresh on /profile briefly
  // lands on /auth/login and guest middleware then dumps the user on HOME.
  if (import.meta.server) return

  if (isProtectedRoute && !authStore.isAuthenticated) {
    return navigateTo({
      path: localePath(ROUTES.AUTH.LOGIN),
      query: { redirect: to.fullPath },
    })
  }

  if (isGuestRoute && authStore.isAuthenticated) {
    return navigateTo(
      resolveAuthRedirect(to.query.redirect, localePath(ROUTES.HOME)),
    )
  }

  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.loadCurrentUser()
  }
})
