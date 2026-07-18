import { ROUTES } from '@shared/constants/routes'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { resolveAuthRedirect } from '@shared/utils/auth-redirect'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const localePath = useLocalePath()

  if (import.meta.client) {
    authStore.hydrateFromStorage()
  }

  if (authStore.isAuthenticated) {
    return navigateTo(
      resolveAuthRedirect(to.query.redirect, localePath(ROUTES.HOME)),
    )
  }
})
