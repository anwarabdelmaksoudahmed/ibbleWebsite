import { useAuthStore } from '@modules/auth/stores/auth.store'
import { tokenManager } from '@modules/auth/utils/token-manager'
import { ROUTES } from '@shared/constants/routes'

const SESSION_CHECK_INTERVAL_MS = 60_000

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const authStore = useAuthStore()
  const localePath = useLocalePath()
  const authSessionReady = useAuthSessionReady()

  authStore.hydrateFromStorage()
  authSessionReady.value = true

  window.setInterval(() => {
    if (!authStore.isAuthenticated) return

    if (tokenManager.isAccessTokenExpired()) {
      authStore.clearSession()
      void navigateTo(localePath(ROUTES.AUTH.LOGIN))
    }
  }, SESSION_CHECK_INTERVAL_MS)

  window.addEventListener('storage', (event: StorageEvent) => {
    if (!event.key?.startsWith('ibble_')) return
    authStore.hydrateFromStorage()
  })
})
