import { getAuthService } from '@modules/auth/services/auth.service'
import { getTransportTripsService } from '@modules/transport/services/trips.service'
import {
  getFirebaseMessagingToken,
  parseTransportPushData,
  parseTransportPushPayload,
  readCachedFcmToken,
  subscribeFirebaseForegroundMessages,
  writeCachedFcmToken,
  type TransportPushPayload,
} from '@shared/firebase/messaging'

/** Prevent concurrent syncToken() from register + waiting-page mounts during navigation. */
let syncTokenInFlight: Promise<void> | null = null
let lastRegisteredToken: string | null = null

/**
 * Creates an FCM web token and registers it with both backends used by the legacy site:
 * - PATCH {AUTH}/v1/fcm-tokens { fcm_token }
 * - PATCH {TRANSPORTATION}/users/fcm-token { fcm_token }
 */
export function useFirebaseMessaging() {
  const { authenticated } = useAuth()
  const authSessionReady = useAuthSessionReady()

  const token = ref<string | null>(null)
  const permission = ref<NotificationPermission>(
    import.meta.client && 'Notification' in window ? Notification.permission : 'default',
  )
  const lastPayload = ref<TransportPushPayload | null>(null)

  const listeners = new Set<(payload: TransportPushPayload) => void>()

  function emit(payload: TransportPushPayload) {
    lastPayload.value = payload
    listeners.forEach((listener) => listener(payload))
  }

  function onTransportPush(listener: (payload: TransportPushPayload) => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  async function syncToken() {
    if (!import.meta.client || !authSessionReady.value || !authenticated.value) {
      console.log('[FCM] syncToken skipped', {
        client: import.meta.client,
        authSessionReady: authSessionReady.value,
        authenticated: authenticated.value,
      })
      return
    }

    if (syncTokenInFlight) {
      console.log('[FCM] syncToken joining in-flight sync')
      return syncTokenInFlight
    }

    syncTokenInFlight = (async () => {
      console.log('[FCM] syncToken start', {
        authenticated: authenticated.value,
        authSessionReady: authSessionReady.value,
        permission: 'Notification' in window ? Notification.permission : 'n/a',
      })

      try {
        // Prefer cache first to avoid IndexedDB races during route transitions.
        let nextToken = readCachedFcmToken()
        if (nextToken) {
          console.log('[FCM] using cached token before refresh', {
            length: nextToken.length,
            preview: nextToken.slice(0, 16),
          })
          // Soft refresh — never block sync on a second getToken during navigation.
          void getFirebaseMessagingToken().catch((err) => {
            console.warn('[FCM] background token refresh failed', err)
          })
        } else {
          // Small delay after navigation/unmount so Firebase IDB can finish closing.
          await new Promise((resolve) => setTimeout(resolve, 150))
          nextToken = await getFirebaseMessagingToken()
        }

        permission.value =
          'Notification' in window ? Notification.permission : permission.value
        if (!nextToken) {
          console.warn('[FCM] no token returned', { permission: permission.value })
          return
        }

        token.value = nextToken
        console.log('[FCM] token ready', {
          length: nextToken.length,
          preview: nextToken.slice(0, 16),
          alreadyRegistered: lastRegisteredToken === nextToken,
          permission: permission.value,
        })
        if (lastRegisteredToken === nextToken) return

        // Auth SSO is best-effort; transportation must succeed so drivers can push offers.
        void getAuthService()
          .updateFcmToken(nextToken)
          .then(() => console.log('[FCM] auth PATCH /v1/fcm-tokens OK'))
          .catch((err) => console.warn('[FCM] auth PATCH /v1/fcm-tokens failed', err))

        await getTransportTripsService().registerFcmToken(nextToken)
        console.log('[FCM] transport PATCH /users/fcm-token OK')
        writeCachedFcmToken(nextToken)
        lastRegisteredToken = nextToken
      } catch (err) {
        console.error('[FCM] syncToken failed', err)
      }
    })().finally(() => {
      syncTokenInFlight = null
    })

    return syncTokenInFlight
  }

  let stopForeground: (() => void) | undefined

  function onServiceWorkerMessage(event: MessageEvent) {
    const raw = event.data
    if (!raw || typeof raw !== 'object') return
    if (raw.type !== 'IBBLE_TRANSPORT_PUSH') return
    console.log('[FCM] SW → page message', raw.data)
    emit(parseTransportPushData(raw.data ?? {}))
  }

  onMounted(async () => {
    if (!import.meta.client) return

    navigator.serviceWorker?.addEventListener('message', onServiceWorkerMessage)

    await syncToken()
    stopForeground = await subscribeFirebaseForegroundMessages((message) => {
      console.log('[FCM] foreground message', message)
      emit(parseTransportPushPayload(message))
    })
  })

  onBeforeUnmount(() => {
    stopForeground?.()
    navigator.serviceWorker?.removeEventListener('message', onServiceWorkerMessage)
  })

  watch(
    [authenticated, authSessionReady],
    ([isAuth, ready]) => {
      if (isAuth && ready) void syncToken()
    },
  )

  return {
    token,
    permission,
    lastPayload,
    syncToken,
    onTransportPush,
  }
}
