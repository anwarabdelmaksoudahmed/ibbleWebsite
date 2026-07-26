import type { MaybeRefOrGetter } from 'vue'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { TRANSPORT_ENDPOINTS } from '@modules/transport/constants/endpoints'
import {
  isDriverRejectionSseEvent,
  isNewOfferSseEvent,
  parseTransportSseData,
  type TransportSseOfferPayload,
} from '@modules/transport/utils/sse-event-mappers'
import { connectAuthenticatedSse } from '@shared/sse/create-authenticated-sse'
import type { SseConnectionStatus } from '@shared/sse/types'

function joinUrl(base: string, path: string): string {
  const normalizedBase = base.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

export type TransportUserSseHandlers = {
  onOffer: (payload: TransportSseOfferPayload) => void
  onDriverRejection?: (payload: TransportSseOfferPayload) => void
  onUnknownEvent?: (input: { eventName: string; raw: unknown }) => void
}

/**
 * Live transport SSE: GET /sse/user/:userId/stream
 * Used on the waiting room so offers arrive even when FCM is blocked.
 */
export function useTransportUserSse(handlers: MaybeRefOrGetter<TransportUserSseHandlers>) {
  const authStore = useAuthStore()
  const runtimeConfig = useRuntimeConfig()
  const connectionStatus = ref<SseConnectionStatus>('idle')
  const lastError = ref<string | null>(null)
  const lastEventAt = ref<number | null>(null)

  let disconnect: (() => void) | null = null

  const userId = computed(() => String(authStore.currentUser?.id || '').trim())
  const streamUrl = computed(() => {
    if (!userId.value) return null
    const base = String(runtimeConfig.public.transportationApiBaseUrl || '').trim()
    if (!base) {
      console.error('[TransportSSE] missing NUXT_PUBLIC_TRANSPORTATION_API_BASE_URL')
      return null
    }
    return joinUrl(base, TRANSPORT_ENDPOINTS.USER_SSE_STREAM(userId.value))
  })

  function resolveHandlers(): TransportUserSseHandlers {
    return toValue(handlers)
  }

  function start() {
    if (!import.meta.client) return
    stop()

    const url = streamUrl.value
    if (!url) {
      console.warn('[TransportSSE] start skipped — no URL/userId', {
        userId: userId.value,
      })
      connectionStatus.value = 'error'
      lastError.value = 'missing_url_or_user'
      return
    }

    console.log('[TransportSSE] start', {
      userId: userId.value,
      url,
      hasAccessToken: Boolean(authStore.accessToken),
    })

    disconnect = connectAuthenticatedSse({
      url,
      logPrefix: '[TransportSSE]',
      getAccessToken: () => authStore.accessToken || null,
      onStatusChange: (status) => {
        connectionStatus.value = status
      },
      onError: (error) => {
        lastError.value = error instanceof Error ? error.message : String(error)
      },
      onMessage: (message) => {
        lastEventAt.value = Date.now()
        console.log('[TransportSSE] raw SSE message', message)

        // Prefer JSON envelope `event`; fall back to SSE `event:` field.
        const parsed = parseTransportSseData(message.data)
        const eventName =
          parsed.eventName !== 'message' && parsed.eventName !== 'unknown'
            ? parsed.eventName
            : message.event || parsed.eventName

        console.log('[TransportSSE] routed event', {
          eventName,
          sseEventField: message.event,
          hasPayload: Boolean(parsed.payload),
          offerId: parsed.payload?.offerId,
          tripRequestId: parsed.payload?.tripRequestId,
        })

        const active = resolveHandlers()

        if (isDriverRejectionSseEvent(eventName, parsed.payload) && parsed.payload) {
          console.log('[TransportSSE] → driver rejection handler', parsed.payload)
          active.onDriverRejection?.(parsed.payload)
          return
        }

        if (isNewOfferSseEvent(eventName, parsed.payload) && parsed.payload) {
          console.log('[TransportSSE] → new offer handler', parsed.payload)
          active.onOffer(parsed.payload)
          return
        }

        console.warn('[TransportSSE] unhandled event', {
          eventName,
          raw: parsed.raw,
        })
        active.onUnknownEvent?.({ eventName, raw: parsed.raw })
      },
    })
  }

  function stop() {
    if (!disconnect) return
    console.log('[TransportSSE] stop')
    disconnect()
    disconnect = null
    if (connectionStatus.value !== 'idle') {
      connectionStatus.value = 'closed'
    }
  }

  function restart() {
    console.log('[TransportSSE] restart')
    start()
  }

  watch(
    userId,
    (next, prev) => {
      if (next && next !== prev && disconnect) {
        console.log('[TransportSSE] userId changed — reconnect', { prev, next })
        start()
      }
    },
  )

  onBeforeUnmount(() => {
    stop()
  })

  return {
    connectionStatus: readonly(connectionStatus),
    lastError: readonly(lastError),
    lastEventAt: readonly(lastEventAt),
    streamUrl,
    userId,
    start,
    stop,
    restart,
  }
}
