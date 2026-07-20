<script setup lang="ts">
import CheckoutWalletPinModal from '@modules/checkout/components/CheckoutWalletPinModal.vue'
import InsuranceCustomerStep from '@modules/insurance/components/InsuranceCustomerStep.vue'
import InsurancePaymentStep from '@modules/insurance/components/InsurancePaymentStep.vue'
import InsurancePricingStep from '@modules/insurance/components/InsurancePricingStep.vue'
import InsuranceShipmentStep from '@modules/insurance/components/InsuranceShipmentStep.vue'
import { INSURANCE_ROUTES } from '@modules/insurance/constants/routes'
import { useInsurancePayment } from '@modules/insurance/composables/useInsurancePayment'
import { useInsuranceRegisterWizard } from '@modules/insurance/composables/useInsuranceRegisterWizard'
import { useCheckoutWallets } from '@modules/checkout/composables/useCheckoutWallets'
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const {
  steps,
  currentStep,
  activeStep,
  customer,
  customerErrors,
  shipment,
  shipmentTripErrors,
  cargoItemsError,
  cargoDraft,
  cargoDraftErrors,
  draftStatusLabel,
  chipDraftStatus,
  isCheckingChip,
  totalCargoValue,
  isEditingCargo,
  editingCargoId,
  providers,
  providersLoading,
  providersError,
  selectedProviderId,
  selectedProvider,
  providerSelectionError,
  payment,
  paymentErrors,
  isFirstStep,
  isLastStep,
  next,
  prev,
  setNationalId,
  setIban,
  setPaymentDataAccurate,
  setPaymentTermsAccepted,
  setPaymentMethod,
  touchCustomerField,
  touchCargoDraftField,
  touchShipmentTripField,
  touchPaymentField,
  setCargoValue,
  setDistanceKm,
  selectProvider,
  loadProviders,
  saveCargoDraft,
  startNewCargo,
  editCargoItem,
  removeCargoItem,
  resetCargoDraft,
  clearPersistedDraft,
} = useInsuranceRegisterWizard()

const { placeInsurancePayment } = useInsurancePayment()
const { primaryWallet, isLoading: walletsLoading, refetch: refetchWallets } = useCheckoutWallets()

const submitting = ref(false)
const pinModalOpen = ref(false)
const pinServerError = ref('')

const breadcrumbItems = computed(() => [
  { label: t('site.nav.home'), to: localePath(ROUTES.HOME) },
  { label: t('site.nav.insurance'), to: localePath(INSURANCE_ROUTES.ROOT) },
  { label: t('site.insurance.register.breadcrumb') },
])

const nextLabel = computed(() =>
  isLastStep.value
    ? t('site.insurance.register.pay')
    : t('site.insurance.register.next'),
)

const payableTotal = computed(() => selectedProvider.value?.quote.total ?? 0)

const walletDisabled = computed(() => {
  if (walletsLoading.value || !primaryWallet.value) return true
  return primaryWallet.value.balance < payableTotal.value
})

const paymentSummary = computed(() => {
  const provider = selectedProvider.value
  if (!provider) return undefined

  return {
    title: provider.name,
    items: [
      {
        label: t('site.insurance.register.pricing.coverage'),
        amount: provider.quote.coverage,
      },
      {
        label: t('site.insurance.register.pricing.certificateFees'),
        amount: provider.quote.certificateFees,
      },
      {
        label: t('site.insurance.register.pricing.vat', { percent: provider.quote.taxPercent }),
        amount: provider.quote.vat,
      },
    ],
    total: provider.quote.total,
    currency: 'SAR',
  }
})

watch(
  () => walletDisabled.value,
  (disabled) => {
    if (disabled && payment.paymentMethod === 'wallet') {
      setPaymentMethod('card')
    }
  },
)

async function onNext() {
  if (!isLastStep.value) {
    await next()
    return
  }

  await submitPayment()
}

async function submitPayment() {
  const valid = await next()
  if (!valid) return

  if (!selectedProvider.value || payment.paymentMethod === '') return

  if (payment.paymentMethod === 'wallet') {
    if (walletDisabled.value) {
      toast.warning(t('site.insurance.register.payment.walletInsufficientBalance'))
      return
    }
    pinServerError.value = ''
    pinModalOpen.value = true
    return
  }

  await submitCardPayment()
}

async function submitCardPayment() {
  const provider = selectedProvider.value
  if (!provider || payment.paymentMethod !== 'card') return

  submitting.value = true

  try {
    const result = await placeInsurancePayment({
      customer,
      shipment,
      provider,
      iban: payment.iban,
      paymentMethod: 'card',
      camelStatusLabel: t('site.insurance.register.form.cargoStatusExists'),
      summary: paymentSummary.value,
    })

    if (result.success) {
      clearPersistedDraft()
      toast.success(result.message || t('site.insurance.register.payment.success'))
      await navigateTo(localePath(INSURANCE_ROUTES.ROOT))
      return
    }

    if (result.status !== 'cancelled') {
      toast.error(result.message || t('site.insurance.register.payment.failed'))
    }
  } catch {
    toast.error(t('site.insurance.register.payment.failed'))
  } finally {
    submitting.value = false
  }
}

async function onWalletPinSubmit(pinCode: string) {
  const provider = selectedProvider.value
  if (!provider) return

  submitting.value = true
  pinServerError.value = ''

  try {
    const result = await placeInsurancePayment({
      customer,
      shipment,
      provider,
      iban: payment.iban,
      paymentMethod: 'wallet',
      pinCode,
      camelStatusLabel: t('site.insurance.register.form.cargoStatusExists'),
      summary: paymentSummary.value,
    })

    if (result.success) {
      pinModalOpen.value = false
      clearPersistedDraft()
      toast.success(result.message || t('site.insurance.register.payment.success'))
      await refetchWallets()
      await navigateTo(localePath(INSURANCE_ROUTES.ROOT))
      return
    }

    const pinError =
      result.fieldErrors?.PIN_code?.[0]
      ?? result.fieldErrors?.pin_code?.[0]

    if (pinError) {
      pinServerError.value = pinError
      return
    }

    toast.error(result.message || t('site.insurance.register.payment.failed'))
  } catch {
    toast.error(t('site.insurance.register.payment.failed'))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="bg-[#f4f6f5] dark:bg-background">
    <div class="mx-auto max-w-7xl px-4 py-[12px] sm:px-6  lg:px-6 ">
      <BaseBreadcrumb :items="breadcrumbItems" class="mb-6" />

      <FormWizardShell
        :steps="steps"
        :current-step="currentStep"
        :next-label="nextLabel"
        :prev-label="t('site.insurance.register.prev')"
        :show-prev="!isFirstStep"
        :hide-next-arrow="isLastStep"
        :loading="submitting"
        :progress-label="t('site.insurance.register.progressLabel')"
        @next="onNext"
        @prev="prev"
      >
        <InsuranceCustomerStep
          v-if="activeStep === 'customer'"
          :model="customer"
          :errors="customerErrors"
          @field-blur="touchCustomerField"
          @update:national-id="setNationalId"
        />

        <InsuranceShipmentStep
          v-else-if="activeStep === 'shipment'"
          :model="shipment"
          :trip-errors="shipmentTripErrors"
          :cargo-draft="cargoDraft"
          :cargo-draft-errors="cargoDraftErrors"
          :cargo-items-error="cargoItemsError"
          :draft-status-label="draftStatusLabel"
          :chip-draft-status="chipDraftStatus"
          :total-cargo-value="totalCargoValue"
          :is-editing-cargo="isEditingCargo"
          :editing-cargo-id="editingCargoId"
          :is-checking-chip="isCheckingChip"
          @update:cargo-value="setCargoValue"
          @update:distance-km="setDistanceKm"
          @cargo-field-blur="touchCargoDraftField"
          @trip-field-blur="touchShipmentTripField"
          @save-cargo="saveCargoDraft"
          @add-cargo="startNewCargo"
          @edit-cargo="editCargoItem"
          @remove-cargo="removeCargoItem"
          @reset-cargo="resetCargoDraft"
        />

        <InsurancePricingStep
          v-else-if="activeStep === 'pricing'"
          :customer="customer"
          :shipment="shipment"
          :providers="providers"
          :selected-id="selectedProviderId"
          :loading="providersLoading"
          :error-message="providersError"
          :selection-error="providerSelectionError"
          :total-cargo-value="totalCargoValue"
          @select="selectProvider"
          @retry="loadProviders(true)"
        />

        <InsurancePaymentStep
          v-else-if="activeStep === 'payment'"
          :provider="selectedProvider"
          :customer="customer"
          :model="payment"
          :errors="paymentErrors"
          :wallet="primaryWallet"
          :wallet-loading="walletsLoading"
          :wallet-disabled="walletDisabled"
          @update:iban="setIban"
          @update:data-accurate="setPaymentDataAccurate"
          @update:terms-accepted="setPaymentTermsAccepted"
          @update:payment-method="setPaymentMethod"
          @field-blur="touchPaymentField"
        />
      </FormWizardShell>
    </div>

    <CheckoutWalletPinModal
      v-model:open="pinModalOpen"
      :submitting="submitting"
      :total="payableTotal"
      :server-error="pinServerError"
      @submit="onWalletPinSubmit"
    />
  </section>
</template>
