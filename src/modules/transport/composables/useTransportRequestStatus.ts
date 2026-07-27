import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { getApiErrorMessage, normalizeApiError } from '@core/api/http/errors'
import { TRANSPORT_QUERY_KEYS } from '@modules/transport/constants/query-keys'
import { TRANSPORT_ROUTES } from '@modules/transport/constants/routes'
import { getTransportTripsService } from '@modules/transport/services/trips.service'
import { useTransportUserSse } from '@modules/transport/composables/useTransportUserSse'
import { useFirebaseMessaging } from '@shared/firebase/useFirebaseMessaging'
import type { TransportPushPayload } from '@shared/firebase/messaging'
import {
  clearTripRequestSnapshot,
  readTripRequestSnapshot,
  type TransportTripRequestSnapshot,
} from '@modules/transport/utils/trip-request-snapshot'
import { saveTripPaymentSnapshot } from '@modules/transport/utils/trip-payment-snapshot'
import type { TransportSseOfferPayload } from '@modules/transport/utils/sse-event-mappers'
import type { AcceptedTransportTrip } from '@modules/transport/types'

export type PendingDriverOffer = {
  offerId: string
  tripRequestId?: string
  price?: string
  distance?: number
  driverName?: string
  vehiclePlate?: string
  vehicleModel?: string
  vehicleYear?: string
  /** Where this offer was first observed (for console tracing). */
  source?: 'sse' | 'fcm'
}

type OfferChannel = 'sse' | 'fcm'

/**
 * Waiting room after trip-request create.
 *
 * Offer sources (deduped by offerId):
 * 1. Transport SSE  → GET /sse/user/:id/stream  (primary while page is open)
 * 2. Firebase FCM   → fallback when tab backgrounded / notifications enabled
 */
export function useTransportRequestStatus(requestId: MaybeRefOrGetter<string>) {
  const { t } = useI18n()
  const toast = useToast()
  const localePath = useLocalePath()
  const queryClient = useQueryClient()
  const id = computed(() => String(toValue(requestId) || '').trim())

  const { onTransportPush, syncToken, permission } = useFirebaseMessaging()

  const snapshot = ref<TransportTripRequestSnapshot | null>(null)
  const pendingOffer = ref<PendingDriverOffer | null>(null)
  const offerModalOpen = ref(false)
  const isResponding = ref(false)
  const dismissedOfferIds = new Set<string>()
  const handledOfferIds = new Set<string>()
  /** Prevent double UI when the same offer arrives on SSE + FCM. */
  const seenOfferIds = new Set<string>()

  const {
    connectionStatus: sseStatus,
    streamUrl: sseUrl,
    start: startSse,
    stop: stopSse,
  } = useTransportUserSse(() => ({
    onOffer: (payload) => handleIncomingOffer(payload, 'sse'),
    onDriverRejection: (payload) => {
      console.log('[Waiting] SSE driver rejection', payload)
      toast.warning(
        payload.message ||
          payload.reason ||
          t('site.transport.request.driverRejectedToast'),
      )
    },
    onUnknownEvent: (input) => {
      console.warn('[Waiting] SSE unknown event', input)
    },
  }))

  onMounted(() => {
    snapshot.value = readTripRequestSnapshot(id.value)
    console.log('[Waiting] mounted', {
      requestId: id.value,
      snapshot: snapshot.value,
      permission: permission.value,
      sseUrl: sseUrl.value,
    })
    startSse()
    void syncToken()
  })

  const respondMutation = useMutation({
    mutationFn: (input: {
      offerId: string
      tripRequestId: string
      distance: number
      status: 'accepted' | 'rejected'
    }) => {
      console.log('[Waiting] PATCH /offers/:id', input)
      return getTransportTripsService().acceptOffer(input.offerId, {
        tripRequestId: input.tripRequestId,
        status: input.status,
        distance: input.distance,
      })
    },
    onError: (error) => {
      console.error('[Waiting] offer response failed', error)
      toast.error(getApiErrorMessage(normalizeApiError(error)))
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => {
      console.log('[Waiting] PATCH /trip-requests/:id/cancel', { requestId: id.value, reason })
      return getTransportTripsService().cancelTripRequest(id.value, { reason })
    },
    onError: (error) => {
      console.error('[Waiting] cancel request failed', error)
      toast.error(getApiErrorMessage(normalizeApiError(error)))
    },
  })

  async function goToPayment(trip: AcceptedTransportTrip) {
    clearTripRequestSnapshot()
    saveTripPaymentSnapshot({
      tripId: trip.id,
      tripRequestId: id.value,
      vehicleId: trip.vehicleId,
      price: trip.price || snapshot.value?.price || 0,
    })
    await queryClient.invalidateQueries({ queryKey: TRANSPORT_QUERY_KEYS.root })
    toast.success(trip.message || t('site.transport.request.acceptSuccess'))
    console.log('[Waiting] navigate register payment step', { tripId: trip.id, price: trip.price })
    await navigateTo(localePath(TRANSPORT_ROUTES.REGISTER))
  }

  function toPendingOffer(
    payload: TransportPushPayload | TransportSseOfferPayload,
    source: OfferChannel,
  ): PendingDriverOffer | null {
    const offerId = String(payload.offerId || '').trim()
    if (!offerId) return null

    const sse = payload as TransportSseOfferPayload
    return {
      offerId,
      tripRequestId: payload.tripRequestId,
      price: payload.price,
      distance: payload.distance,
      driverName: sse.driverName || payload.driverName,
      vehiclePlate: sse.vehiclePlate,
      vehicleModel: sse.vehicleModel,
      vehicleYear: sse.vehicleYear,
      source,
    }
  }

  function handleIncomingOffer(
    payload: TransportPushPayload | TransportSseOfferPayload,
    source: OfferChannel,
  ) {
    console.log('[Waiting] incoming offer', { source, payload })

    const matchesRequest = !payload.tripRequestId || payload.tripRequestId === id.value
    if (!matchesRequest) {
      console.log('[Waiting] offer ignored (different request)', {
        source,
        payloadTripRequestId: payload.tripRequestId,
        currentRequestId: id.value,
      })
      return
    }

    const offer = toPendingOffer(payload, source)
    if (!offer) {
      console.warn('[Waiting] offer missing offerId', { source, payload })
      return
    }

    if (handledOfferIds.has(offer.offerId) || dismissedOfferIds.has(offer.offerId)) {
      console.log('[Waiting] offer ignored (already handled/dismissed)', {
        source,
        offerId: offer.offerId,
      })
      return
    }

    if (seenOfferIds.has(offer.offerId)) {
      console.log('[Waiting] offer ignored (duplicate channel)', {
        source,
        offerId: offer.offerId,
        alreadyOpen: pendingOffer.value?.offerId === offer.offerId,
      })
      // Enrich open modal if SSE arrives with richer driver/vehicle after a thin FCM push.
      if (pendingOffer.value?.offerId === offer.offerId) {
        pendingOffer.value = {
          ...pendingOffer.value,
          driverName: offer.driverName || pendingOffer.value.driverName,
          vehiclePlate: offer.vehiclePlate || pendingOffer.value.vehiclePlate,
          vehicleModel: offer.vehicleModel || pendingOffer.value.vehicleModel,
          vehicleYear: offer.vehicleYear || pendingOffer.value.vehicleYear,
          price: offer.price || pendingOffer.value.price,
        }
        console.log('[Waiting] enriched pending offer from', source, pendingOffer.value)
      }
      return
    }

    if (offerModalOpen.value && pendingOffer.value?.offerId !== offer.offerId) {
      console.log('[Waiting] offer deferred — modal already open', {
        source,
        open: pendingOffer.value?.offerId,
        incoming: offer.offerId,
      })
      return
    }

    seenOfferIds.add(offer.offerId)
    pendingOffer.value = offer
    offerModalOpen.value = true
    toast.info(t('site.transport.request.offerReceived'))
    console.log('[Waiting] offer modal opened', { source, offer: pendingOffer.value })
  }

  async function respondToOffer(status: 'accepted' | 'rejected') {
    const offer = pendingOffer.value
    if (!offer?.offerId || isResponding.value) return

    const distance =
      offer.distance ??
      snapshot.value?.distanceMeters ??
      0

    isResponding.value = true
    try {
      const trip = await respondMutation.mutateAsync({
        offerId: offer.offerId,
        tripRequestId: id.value,
        distance,
        status,
      })

      handledOfferIds.add(offer.offerId)
      offerModalOpen.value = false
      pendingOffer.value = null

      if (status === 'accepted') {
        stopSse()
        await goToPayment(trip)
        return
      }

      dismissedOfferIds.add(offer.offerId)
      toast.success(t('site.transport.request.rejectSuccess'))
      console.log('[Waiting] offer rejected by user', { offerId: offer.offerId, source: offer.source })
    } catch {
      // keep modal open for retry
    } finally {
      isResponding.value = false
    }
  }

  async function acceptPendingOffer() {
    await respondToOffer('accepted')
  }

  async function rejectPendingOffer() {
    await respondToOffer('rejected')
  }

  function dismissOfferModal() {
    offerModalOpen.value = false
  }

  async function cancelRequest(reason: string): Promise<boolean> {
    const trimmed = reason.trim()
    if (!id.value || !trimmed || cancelMutation.isPending.value || isResponding.value) {
      return false
    }

    try {
      await cancelMutation.mutateAsync(trimmed)
    } catch {
      return false
    }

    stopSse()
    clearTripRequestSnapshot()
    snapshot.value = null
    pendingOffer.value = null
    offerModalOpen.value = false
    await queryClient.invalidateQueries({ queryKey: TRANSPORT_QUERY_KEYS.root })
    toast.success(t('site.transport.request.cancelSuccess'))
    await navigateTo(localePath(TRANSPORT_ROUTES.ROOT), { replace: true })
    return true
  }

  async function goToPaymentFromPush(tripId: string) {
    console.log('[Waiting] trip created push → register payment step', { tripId })
    clearTripRequestSnapshot()
    saveTripPaymentSnapshot({
      tripId,
      tripRequestId: id.value,
      vehicleId: '',
      price: snapshot.value?.price || 0,
    })
    await queryClient.invalidateQueries({ queryKey: TRANSPORT_QUERY_KEYS.root })
    toast.success(t('site.transport.request.tripCreatedPush'))
    stopSse()
    await navigateTo(localePath(TRANSPORT_ROUTES.REGISTER))
  }

  const stopPush = onTransportPush((payload) => {
    console.log('[Waiting] FCM push received', payload)
    const matchesRequest = !payload.tripRequestId || payload.tripRequestId === id.value
    if (!matchesRequest) {
      console.log('[Waiting] FCM ignored (different request)', {
        payloadTripRequestId: payload.tripRequestId,
        currentRequestId: id.value,
      })
      return
    }

    if (payload.tripId) {
      void goToPaymentFromPush(payload.tripId)
      return
    }

    if (payload.status === 'accepted' || payload.type === 'trip_created') {
      return
    }

    if (payload.offerId) {
      handleIncomingOffer(payload, 'fcm')
    } else {
      console.warn('[Waiting] FCM push without offerId', payload)
    }
  })

  onBeforeUnmount(() => {
    console.log('[Waiting] unmount — stop SSE + FCM listener')
    stopPush()
    stopSse()
  })

  return {
    request: snapshot,
    pendingOffer,
    offerModalOpen,
    pushPermission: permission,
    sseStatus,
    isResponding: computed(() => isResponding.value || respondMutation.isPending.value),
    respondingStatus: computed(() =>
      respondMutation.isPending.value
        ? (respondMutation.variables.value?.status ?? null)
        : null,
    ),
    isCancelling: computed(() => cancelMutation.isPending.value),
    acceptPendingOffer,
    rejectPendingOffer,
    dismissOfferModal,
    cancelRequest,
    enableNotifications: syncToken,
  }
}
