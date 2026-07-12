import { ROUTES } from '@shared/constants/routes'
import { useAuthStore } from '@modules/auth/stores/auth.store'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  const localePath = useLocalePath()

  if (!authStore.isAuthenticated) {
    return navigateTo(localePath(ROUTES.AUTH.LOGIN))
  }
})
