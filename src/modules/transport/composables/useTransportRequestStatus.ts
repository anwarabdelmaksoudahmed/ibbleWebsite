import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { getApiErrorMessage, normalizeApiError } from '@core/api/http/errors'
import { PROFILE_ROUTES } from '@modules/profile/constants/routes'
import { TRANSPORT_QUERY_KEYS } from '@modules/transport/constants/query-keys'
import { getTransportTripsService } from '@modules/transport/services/trips.service'
import { useFirebaseMessaging } from '@shared/firebase/useFirebaseMessaging'
import {
  clearTripRequestSnapshot,
  readTripRequestSnapshot,
  type TransportTripRequestSnapshot,
} from '@modules/transport/utils/trip-request-snapshot'

/**
 * Waiting room after trip-request create.
 * Firebase push delivers the driver offer → PATCH /offers/:id creates the trip.
 */
export function useTransportRequestStatus(requestId: MaybeRefOrGetter<string>) {
  const { t } = useI18n()
  const toast = useToast()
  const localePath = useLocalePath()
  const queryClient = useQueryClient()
  const id = computed(() => String(toValue(requestId) || '').trim())

  const { onTransportPush, syncToken, permission } = useFirebaseMessaging()

  const snapshot = ref<TransportTripRequestSnapshot | null>(null)
  const pushOfferId = ref<string | null>(null)
  const isAccepting = ref(false)
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

  const acceptMutation = useMutation({
    mutationFn: (input: { offerId: string; tripRequestId: string; distance: number }) => {
      console.log('[Waiting] PATCH /offers/:id', input)
      return getTransportTripsService().acceptOffer(input.offerId, {
        tripRequestId: input.tripRequestId,
        status: 'accepted',
        distance: input.distance,
      })
    },
    onSuccess: async (trip) => {
      console.log('[Waiting] accept success', trip)
      clearTripRequestSnapshot()
      await queryClient.invalidateQueries({ queryKey: TRANSPORT_QUERY_KEYS.root })
      toast.success(trip.message || t('site.transport.request.acceptSuccess'))
      await navigateTo(localePath(PROFILE_ROUTES.TRANSPORTATION))
    },
    onError: (error) => {
      console.error('[Waiting] accept failed', error)
      toast.error(getApiErrorMessage(normalizeApiError(error)))
    },
  })

  async function acceptOffer(offerId: string, distanceMeters?: number) {
    const normalized = String(offerId || '').trim()
    if (!normalized || handledOfferIds.has(normalized) || isAccepting.value) {
      console.log('[Waiting] acceptOffer skipped', {
        offerId: normalized,
        alreadyHandled: handledOfferIds.has(normalized),
        isAccepting: isAccepting.value,
      })
      return
    }

    const distance =
      distanceMeters ??
      snapshot.value?.distanceMeters ??
      0

    console.log('[Waiting] acceptOffer', {
      offerId: normalized,
      tripRequestId: id.value,
      distance,
    })

    handledOfferIds.add(normalized)
    isAccepting.value = true
    pushOfferId.value = normalized
    try {
      await acceptMutation.mutateAsync({
        offerId: normalized,
        tripRequestId: id.value,
        distance,
      })
    } catch {
      handledOfferIds.delete(normalized)
    } finally {
      isAccepting.value = false
    }
  }

  async function goToTrips() {
    console.log('[Waiting] trip created push → profile trips', { requestId: id.value })
    clearTripRequestSnapshot()
    await queryClient.invalidateQueries({ queryKey: TRANSPORT_QUERY_KEYS.root })
    toast.success(t('site.transport.request.tripCreatedPush'))
    await navigateTo(localePath(PROFILE_ROUTES.TRANSPORTATION))
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

    if (payload.tripId || payload.status === 'accepted' || payload.type === 'trip_created') {
      void goToTrips()
      return
    }

    if (payload.offerId) {
      toast.info(t('site.transport.request.offerReceived'))
      void acceptOffer(payload.offerId, payload.distance)
    } else {
      console.warn('[Waiting] push without offerId', payload)
    }
  })

  onBeforeUnmount(() => {
    stopPush()
  })

  return {
    request: snapshot,
    pushOfferId,
    pushPermission: permission,
    isAccepting: computed(() => isAccepting.value || acceptMutation.isPending.value),
    acceptingOfferId: computed(() =>
      acceptMutation.isPending.value
        ? String(acceptMutation.variables.value?.offerId ?? pushOfferId.value ?? '')
        : '',
    ),
    acceptOffer,
    enableNotifications: syncToken,
  }
}
