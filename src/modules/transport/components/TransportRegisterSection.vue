<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import TransportDeliveryStep from '@modules/transport/components/TransportDeliveryStep.vue'
import TransportShipmentTypeStep from '@modules/transport/components/TransportShipmentTypeStep.vue'
import TransportTripPaymentSection from '@modules/transport/components/TransportTripPaymentSection.vue'
import { TRANSPORT_QUERY_KEYS } from '@modules/transport/constants/query-keys'
import { TRANSPORT_ROUTES } from '@modules/transport/constants/routes'
import { useTransportRegisterWizard } from '@modules/transport/composables/useTransportRegisterWizard'
import { useTransportVehicleTypes } from '@modules/transport/composables/useTransportVehicleTypes'
import { getTransportTripsService } from '@modules/transport/services/trips.service'
import { buildCreateTripRequestPayload } from '@modules/transport/utils/build-trip-request-payload'
import { saveTripRequestSnapshot } from '@modules/transport/utils/trip-request-snapshot'
import { readLatestTripPaymentSnapshot } from '@modules/transport/utils/trip-payment-snapshot'
import { getApiErrorMessage, normalizeApiError } from '@core/api/http/errors'
import { ROUTES } from '@shared/constants/routes'
import { useFirebaseMessaging } from '@shared/firebase/useFirebaseMessaging'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { authenticated } = useAuth()
const queryClient = useQueryClient()
const { syncToken: syncFcmToken } = useFirebaseMessaging()

const {
  steps,
  currentStep,
  activeStep,
  delivery,
  deliveryErrors,
  shipmentTypeId,
  shipmentTypeError,
  paymentTripId,
  next,
  prev,
  touchDeliveryField,
  setDistanceKm,
  setOriginPlace,
  setDestinationPlace,
  selectShipmentType,
  goToPaymentStep,
  clearPersistedDraft,
  resetToStart,
} = useTransportRegisterWizard()

const {
  vehicleTypes,
  isLoading: vehicleTypesLoading,
  errorMessage: vehicleTypesError,
  refetch: refetchVehicleTypes,
} = useTransportVehicleTypes()

const selectedVehicleType = computed(() =>
  vehicleTypes.value.find((item) => item.id === shipmentTypeId.value),
)

const allowedShipmentTypeIds = computed(() => vehicleTypes.value.map((item) => item.id))

watch(vehicleTypes, (types) => {
  if (!shipmentTypeId.value) return
  if (types.length && !types.some((item) => item.id === shipmentTypeId.value)) {
    shipmentTypeId.value = ''
  }
})

const submitting = ref(false)
const isPaymentStep = computed(() => activeStep.value === 'payment')

const breadcrumbItems = computed(() => [
  { label: t('site.nav.home'), to: localePath(ROUTES.HOME) },
  { label: t('site.nav.transport'), to: localePath(TRANSPORT_ROUTES.ROOT) },
  { label: t('site.transport.register.breadcrumb') },
])

const nextLabel = computed(() =>
  activeStep.value === 'shipmentType'
    ? t('site.transport.register.submit')
    : t('site.transport.register.next'),
)

onMounted(() => {
  const pending = readLatestTripPaymentSnapshot()
  if (pending) goToPaymentStep(pending.tripId)
})

async function onNext() {
  if (activeStep.value === 'delivery') {
    await next()
    return
  }

  if (activeStep.value === 'shipmentType') {
    await submitRequest()
  }
}

async function submitRequest() {
  const valid = await next(allowedShipmentTypeIds.value, { advance: false })
  if (!valid) return

  if (!authenticated.value) {
    toast.error(t('site.transport.register.authRequired'))
    await navigateTo({
      path: localePath(ROUTES.AUTH.LOGIN),
      query: { redirect: localePath(TRANSPORT_ROUTES.REGISTER) },
    })
    return
  }

  const vehicleType = selectedVehicleType.value
  if (!vehicleType) {
    toast.error(t('site.transport.register.validation.shipmentTypeRequired'))
    return
  }

  submitting.value = true
  try {
    console.log('[TripRequest] syncing FCM before create')
    try {
      await syncFcmToken()
    } catch (err) {
      console.warn('[TripRequest] FCM sync before create failed (continuing)', err)
    }

    const payload = buildCreateTripRequestPayload({
      delivery,
      vehicleType,
    })
    console.log('[TripRequest] create payload', payload)
    const request = await getTransportTripsService().createTripRequest(payload)
    console.log('[TripRequest] created', {
      id: request.id,
      status: request.status,
      price: request.price,
    })

    saveTripRequestSnapshot({
      id: request.id,
      status: request.status,
      dateTime: request.dateTime,
      userName: request.userName,
      phone: request.phone,
      price: request.price,
      startAddress: request.startAddress,
      endAddress: request.endAddress,
      distanceMeters: Math.round(Number(delivery.distanceKm) * 1000),
    })

    clearPersistedDraft()
    await queryClient.invalidateQueries({ queryKey: TRANSPORT_QUERY_KEYS.root })

    toast.success(t('site.transport.register.submitSuccess'))
    console.log('[TripRequest] navigate waiting', request.id)
    await navigateTo(localePath(TRANSPORT_ROUTES.REQUEST(request.id)))
  } catch (error) {
    console.error('[TripRequest] create failed', error)
    toast.error(getApiErrorMessage(normalizeApiError(error)))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="bg-[#f4f6f5] dark:bg-background">
    <div class="mx-auto max-w-7xl px-4 py-[12px] sm:px-6 lg:px-6">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <BaseBreadcrumb :items="breadcrumbItems" />
      </div>

      <FormWizardShell
        :steps="steps"
        :current-step="currentStep"
        :next-label="nextLabel"
        :prev-label="t('site.transport.register.prev')"
        :show-prev="false"
        :show-next="!isPaymentStep"
        :hide-next-arrow="activeStep === 'shipmentType'"
        :loading="submitting"
        :progress-label="t('site.transport.register.progressLabel')"
        @next="onNext"
        @prev="prev"
      >
        <TransportDeliveryStep
          v-if="activeStep === 'delivery'"
          :model="delivery"
          :errors="deliveryErrors"
          @field-blur="touchDeliveryField"
          @update:distance-km="setDistanceKm"
          @update:origin-place="setOriginPlace"
          @update:destination-place="setDestinationPlace"
        />

        <TransportShipmentTypeStep
          v-else-if="activeStep === 'shipmentType'"
          :options="vehicleTypes"
          :selected-id="shipmentTypeId"
          :loading="vehicleTypesLoading"
          :error-message="vehicleTypesError"
          :error="shipmentTypeError"
          @select="selectShipmentType"
          @retry="refetchVehicleTypes()"
        />

        <TransportTripPaymentSection
          v-else-if="activeStep === 'payment' && paymentTripId"
          :trip-id="paymentTripId"
          embedded
          @cancelled="resetToStart"
        />
      </FormWizardShell>
    </div>
  </section>
</template>
