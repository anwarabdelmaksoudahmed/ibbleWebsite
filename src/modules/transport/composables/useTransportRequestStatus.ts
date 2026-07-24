import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { getApiErrorMessage, normalizeApiError } from '@core/api/http/errors'
import { TRANSPORT_QUERY_KEYS } from '@modules/transport/constants/query-keys'
import { TRANSPORT_ROUTES } from '@modules/transport/constants/routes'
import { getTransportTripsService } from '@modules/transport/services/trips.service'
import { useFirebaseMessaging } from '@shared/firebase/useFirebaseMessaging'
import type { TransportPushPayload } from '@shared/firebase/messaging'
import {
  clearTripRequestSnapshot,
  readTripRequestSnapshot,
  type TransportTripRequestSnapshot,
} from '@modules/transport/utils/trip-request-snapshot'
import { saveTripPaymentSnapshot } from '@modules/transport/utils/trip-payment-snapshot'
import type { AcceptedTransportTrip } from '@modules/transport/types'

export type PendingDriverOffer = {
  offerId: string
  tripRequestId?: string
  price?: string
  distance?: number
}

/**
 * Waiting room after trip-request create.
 * Firebase push delivers a driver offer → user accepts/rejects via modal.
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

  onMounted(() => {
    snapshot.value = readTripRequestSnapshot(id.value)
    console.log('[Waiting] mounted', {
      requestId: id.value,
      snapshot: snapshot.value,
      permission: permission.value,
    })
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

  async function goToPayment(trip: AcceptedTransportTrip) {
    clearTripRequestSnapshot()
    saveTripPaymentSnapshot({
      tripId: trip.id,
      vehicleId: trip.vehicleId,
      price: trip.price || snapshot.value?.price || 0,
    })
    await queryClient.invalidateQueries({ queryKey: TRANSPORT_QUERY_KEYS.root })
    toast.success(trip.message || t('site.transport.request.acceptSuccess'))
    console.log('[Waiting] navigate register payment step', { tripId: trip.id, price: trip.price })
    await navigateTo(localePath(TRANSPORT_ROUTES.REGISTER))
  }

  function showOfferModal(payload: TransportPushPayload) {
    const offerId = String(payload.offerId || '').trim()
    if (!offerId) return
    if (handledOfferIds.has(offerId) || dismissedOfferIds.has(offerId)) {
      console.log('[Waiting] offer ignored (already handled/dismissed)', offerId)
      return
    }

    // If another offer modal is open, ignore newer ones until user responds.
    if (offerModalOpen.value && pendingOffer.value?.offerId !== offerId) {
      console.log('[Waiting] offer deferred — modal already open', {
        open: pendingOffer.value?.offerId,
        incoming: offerId,
      })
      return
    }

    pendingOffer.value = {
      offerId,
      tripRequestId: payload.tripRequestId,
      price: payload.price,
      distance: payload.distance,
    }
    offerModalOpen.value = true
    toast.info(t('site.transport.request.offerReceived'))
    console.log('[Waiting] offer modal opened', pendingOffer.value)
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
        await goToPayment(trip)
        return
      }

      dismissedOfferIds.add(offer.offerId)
      toast.success(t('site.transport.request.rejectSuccess'))
      console.log('[Waiting] offer rejected', offer.offerId)
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
    // Closing without accept/reject just hides UI; offer can be reopened if push repeats.
    // Prefer explicit reject for API cleanup.
    offerModalOpen.value = false
  }

  async function goToPaymentFromPush(tripId: string) {
    console.log('[Waiting] trip created push → register payment step', { tripId })
    clearTripRequestSnapshot()
    saveTripPaymentSnapshot({
      tripId,
      vehicleId: '',
      price: snapshot.value?.price || 0,
    })
    await queryClient.invalidateQueries({ queryKey: TRANSPORT_QUERY_KEYS.root })
    toast.success(t('site.transport.request.tripCreatedPush'))
    await navigateTo(localePath(TRANSPORT_ROUTES.REGISTER))
  }

  const stopPush = onTransportPush((payload) => {
    console.log('[Waiting] push received', payload)
    const matchesRequest = !payload.tripRequestId || payload.tripRequestId === id.value
    if (!matchesRequest) {
      console.log('[Waiting] push ignored (different request)', {
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
      showOfferModal(payload)
    } else {
      console.warn('[Waiting] push without offerId', payload)
    }
  })

  onBeforeUnmount(() => {
    stopPush()
  })

  return {
    request: snapshot,
    pendingOffer,
    offerModalOpen,
    pushPermission: permission,
    isResponding: computed(() => isResponding.value || respondMutation.isPending.value),
    respondingStatus: computed(() =>
      respondMutation.isPending.value
        ? (respondMutation.variables.value?.status ?? null)
        : null,
    ),
    acceptPendingOffer,
    rejectPendingOffer,
    dismissOfferModal,
    enableNotifications: syncToken,
  }
}
