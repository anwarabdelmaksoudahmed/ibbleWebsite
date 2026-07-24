<script setup lang="ts">
import TransportDeliveryStep from '@modules/transport/components/TransportDeliveryStep.vue'
import TransportPaymentStep from '@modules/transport/components/TransportPaymentStep.vue'
import TransportShipmentTypeStep from '@modules/transport/components/TransportShipmentTypeStep.vue'
import { TRANSPORT_ROUTES } from '@modules/transport/constants/routes'
import { useTransportRegisterWizard } from '@modules/transport/composables/useTransportRegisterWizard'
import { useTransportVehicleTypes } from '@modules/transport/composables/useTransportVehicleTypes'
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const {
  steps,
  currentStep,
  activeStep,
  delivery,
  deliveryErrors,
  shipmentTypeId,
  shipmentTypeError,
  termsAccepted,
  termsError,
  isLastStep,
  next,
  prev,
  touchDeliveryField,
  setDistanceKm,
  selectShipmentType,
  setTermsAccepted,
  clearPersistedDraft,
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

const shipmentTypeName = computed(() => selectedVehicleType.value?.name ?? '')

const allowedShipmentTypeIds = computed(() => vehicleTypes.value.map((item) => item.id))

watch(vehicleTypes, (types) => {
  if (!shipmentTypeId.value) return
  if (types.length && !types.some((item) => item.id === shipmentTypeId.value)) {
    shipmentTypeId.value = ''
  }
})

const submitting = ref(false)

const breadcrumbItems = computed(() => [
  { label: t('site.nav.home'), to: localePath(ROUTES.HOME) },
  { label: t('site.nav.transport'), to: localePath(TRANSPORT_ROUTES.ROOT) },
  { label: t('site.transport.register.breadcrumb') },
])

const nextLabel = computed(() =>
  isLastStep.value
    ? t('site.transport.register.submit')
    : t('site.transport.register.next'),
)

async function onNext() {
  if (!isLastStep.value) {
    await next(
      activeStep.value === 'shipmentType' ? allowedShipmentTypeIds.value : undefined,
    )
    return
  }

  await submitRequest()
}

async function submitRequest() {
  const valid = await next()
  if (!valid) return

  submitting.value = true
  try {
    clearPersistedDraft()
    toast.success(t('site.transport.register.submitSuccess'))
    await navigateTo(localePath(TRANSPORT_ROUTES.ROOT))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="bg-[#f4f6f5] dark:bg-background">
    <div class="mx-auto max-w-7xl px-4 py-[12px] sm:px-6  lg:px-6">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <BaseBreadcrumb :items="breadcrumbItems" />
      </div>

      <FormWizardShell
        :steps="steps"
        :current-step="currentStep"
        :next-label="nextLabel"
        :prev-label="t('site.transport.register.prev')"
        :show-prev="false"
        :hide-next-arrow="isLastStep"
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

        <TransportPaymentStep
          v-else-if="activeStep === 'payment'"
          :delivery="delivery"
          :shipment-type-name="shipmentTypeName"
          :terms-accepted="termsAccepted"
          :terms-error="termsError"
          @update:terms-accepted="setTermsAccepted"
        />
      </FormWizardShell>
    </div>
  </section>
</template>
