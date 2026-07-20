<script setup lang="ts">
import TransportDeliveryStep from '@modules/transport/components/TransportDeliveryStep.vue'
import TransportPaymentStep from '@modules/transport/components/TransportPaymentStep.vue'
import TransportShipmentTypeStep from '@modules/transport/components/TransportShipmentTypeStep.vue'
import { TRANSPORT_ROUTES } from '@modules/transport/constants/routes'
import { useTransportRegisterWizard } from '@modules/transport/composables/useTransportRegisterWizard'
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
  isFirstStep,
  isLastStep,
  next,
  prev,
  touchDeliveryField,
  setDistanceKm,
  selectShipmentType,
  setTermsAccepted,
  clearPersistedDraft,
} = useTransportRegisterWizard()

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
    await next()
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

function onBack() {
  if (isFirstStep.value) {
    return navigateTo(localePath(TRANSPORT_ROUTES.ROOT))
  }
  prev()
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
          :selected-id="shipmentTypeId"
          :error="shipmentTypeError"
          @select="selectShipmentType"
        />

        <TransportPaymentStep
          v-else-if="activeStep === 'payment'"
          :delivery="delivery"
          :shipment-type-id="shipmentTypeId"
          :terms-accepted="termsAccepted"
          :terms-error="termsError"
          @update:terms-accepted="setTermsAccepted"
        />
      </FormWizardShell>
    </div>
  </section>
</template>
