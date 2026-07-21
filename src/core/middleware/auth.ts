import { ROUTES } from '@shared/constants/routes'
import { useAuthStore } from '@modules/auth/stores/auth.store'

export default defineNuxtRouteMiddleware((to) => {
  // Tokens are client-only; avoid false redirects on SSR refresh.
  if (import.meta.server) return

  const authStore = useAuthStore()
  const localePath = useLocalePath()

  authStore.hydrateFromStorage()

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: localePath(ROUTES.AUTH.LOGIN),
      query: { redirect: to.fullPath },
    })
  }
})
