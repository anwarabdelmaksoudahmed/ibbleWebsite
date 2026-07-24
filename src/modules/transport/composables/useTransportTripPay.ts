import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { getApiErrorMessage, normalizeApiError } from '@core/api/http/errors'
import { useCheckoutWallets } from '@modules/checkout/composables/useCheckoutWallets'
import { PROFILE_ROUTES } from '@modules/profile/constants/routes'
import type { TransportPaymentMethodId } from '@modules/transport/constants/endpoints'
import { TRANSPORT_QUERY_KEYS } from '@modules/transport/constants/query-keys'
import { useTransportTripPayment } from '@modules/transport/composables/useTransportTripPayment'
import { getTransportTripsService } from '@modules/transport/services/trips.service'
import type { TransportVehicleDetails } from '@modules/transport/types'
import {
  clearTripPaymentSnapshot,
  readTripPaymentSnapshot,
  type TransportTripPaymentSnapshot,
} from '@modules/transport/utils/trip-payment-snapshot'

function pad2(value: number): string {
  return String(Math.max(0, value)).padStart(2, '0')
}

export function useTransportTripPay(tripId: MaybeRefOrGetter<string>) {
  const { t } = useI18n()
  const toast = useToast()
  const localePath = useLocalePath()
  const queryClient = useQueryClient()
  const id = computed(() => String(toValue(tripId) || '').trim())

  const { primaryWallet, isLoading: walletLoading } = useCheckoutWallets()
  const { placeTransportTripPayment } = useTransportTripPayment()

  const snapshot = ref<TransportTripPaymentSnapshot | null>(null)
  const paymentMethod = ref<TransportPaymentMethodId | ''>('')
  const pinOpen = ref(false)
  const pinServerError = ref('')
  const isPaying = ref(false)
  const vehicleOpen = ref(false)
  const vehicle = ref<TransportVehicleDetails | null>(null)
  const vehicleLoading = ref(false)
  const vehicleError = ref('')
  const expiredHandled = ref(false)

  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    snapshot.value = readTripPaymentSnapshot(id.value)
    timer = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  const amountDue = computed(() => snapshot.value?.price ?? 0)

  const walletDisabled = computed(() => {
    const wallet = primaryWallet.value
    if (!wallet) return false
    return wallet.balance < amountDue.value
  })

  const remainingMs = computed(() => {
    const expiresAt = snapshot.value?.expiresAt
    if (!expiresAt) return 0
    return Math.max(0, expiresAt - now.value)
  })

  const isExpired = computed(() => Boolean(snapshot.value) && remainingMs.value <= 0)

  const countdown = computed(() => {
    const totalSec = Math.floor(remainingMs.value / 1000)
    const hours = Math.floor(totalSec / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    return {
      hours: pad2(hours),
      minutes: pad2(minutes),
      seconds: pad2(seconds),
      label: `${hours} hr ${pad2(minutes)} min ${pad2(seconds)} sec`,
    }
  })

  const cancelMutation = useMutation({
    mutationFn: () => getTransportTripsService().cancelTrip(id.value),
  })

  watch(isExpired, (expired) => {
    if (!expired || expiredHandled.value || !id.value) return
    expiredHandled.value = true
    void cancelAndRestart({ reason: 'expired' })
  })

  const cancelCompletedTick = ref(0)

  async function cancelAndRestart(options?: { reason?: 'manual' | 'expired' }) {
    if (!id.value || cancelMutation.isPending.value) return false

    try {
      await cancelMutation.mutateAsync()
    } catch (error) {
      // Still allow restart locally if trip is already cancelled / gone.
      console.warn('[TripPay] cancel trip API failed', error)
      if (options?.reason === 'manual') {
        toast.error(getApiErrorMessage(normalizeApiError(error)))
        return false
      }
    }

    clearTripPaymentSnapshot()
    snapshot.value = null
    await queryClient.invalidateQueries({ queryKey: TRANSPORT_QUERY_KEYS.root })

    if (options?.reason === 'expired') {
      toast.info(t('site.transport.pay.expiredCancelled'))
    } else {
      toast.info(t('site.transport.pay.cancelSuccess'))
    }

    cancelCompletedTick.value += 1
    return true
  }

  async function openVehicleDetails() {
    const vehicleId = snapshot.value?.vehicleId
    if (!vehicleId) {
      toast.error(t('site.transport.pay.vehicleMissing'))
      return
    }

    vehicleOpen.value = true
    vehicleLoading.value = true
    vehicleError.value = ''
    try {
      vehicle.value = await getTransportTripsService().getVehicle(vehicleId)
    } catch (error) {
      vehicleError.value = getApiErrorMessage(normalizeApiError(error))
      vehicle.value = null
    } finally {
      vehicleLoading.value = false
    }
  }

  async function runPayment(pinCode?: string) {
    if (!paymentMethod.value || isPaying.value || isExpired.value) return

    isPaying.value = true
    pinServerError.value = ''
    try {
      const result = await placeTransportTripPayment({
        tripId: id.value,
        paymentMethod: paymentMethod.value,
        pinCode,
        summary: {
          title: t('site.transport.pay.summaryTitle'),
          total: amountDue.value,
          currency: 'SAR',
        },
      })

      if (!result.success) {
        if (paymentMethod.value === 'wallet') {
          pinServerError.value = result.message || t('errors.generic')
        } else {
          toast.error(result.message || t('errors.generic'))
        }
        return
      }

      pinOpen.value = false
      clearTripPaymentSnapshot()
      await queryClient.invalidateQueries({ queryKey: TRANSPORT_QUERY_KEYS.root })
      toast.success(result.message || t('site.transport.pay.success'))
      await navigateTo(localePath(PROFILE_ROUTES.TRANSPORTATION))
    } finally {
      isPaying.value = false
    }
  }

  async function submitPayment() {
    if (!paymentMethod.value) {
      toast.error(t('site.transport.pay.selectMethod'))
      return
    }
    if (isExpired.value) {
      toast.error(t('site.transport.pay.expired'))
      return
    }
    if (paymentMethod.value === 'wallet') {
      if (walletDisabled.value) {
        toast.error(t('site.transport.pay.walletInsufficient'))
        return
      }
      pinOpen.value = true
      return
    }
    await runPayment()
  }

  return {
    snapshot,
    amountDue,
    paymentMethod,
    primaryWallet,
    walletLoading,
    walletDisabled,
    countdown,
    isExpired,
    isPaying: computed(() => isPaying.value || cancelMutation.isPending.value),
    pinOpen,
    pinServerError,
    vehicleOpen,
    vehicle,
    vehicleLoading,
    vehicleError,
    openVehicleDetails,
    submitPayment,
    runPayment,
    cancelAndRestart,
    isCancelling: computed(() => cancelMutation.isPending.value),
    cancelCompletedTick,
    missingSnapshot: computed(() => !snapshot.value && Boolean(id.value)),
  }
}
