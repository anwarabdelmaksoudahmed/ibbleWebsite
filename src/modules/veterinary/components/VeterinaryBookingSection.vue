<script setup lang="ts">
import CheckoutWalletPinModal from '@modules/checkout/components/CheckoutWalletPinModal.vue'
import VeterinaryAppointmentStep from '@modules/veterinary/components/VeterinaryAppointmentStep.vue'
import VeterinaryDoctorStep from '@modules/veterinary/components/VeterinaryDoctorStep.vue'
import VeterinaryPaymentStep from '@modules/veterinary/components/VeterinaryPaymentStep.vue'
import VeterinaryServiceTypeStep from '@modules/veterinary/components/VeterinaryServiceTypeStep.vue'
import { VETERINARY_ROUTES } from '@modules/veterinary/constants/routes'
import { useVeterinaryBookingWizard } from '@modules/veterinary/composables/useVeterinaryBookingWizard'
import { useVeterinaryPayment } from '@modules/veterinary/composables/useVeterinaryPayment'
import { useCheckoutWallets } from '@modules/checkout/composables/useCheckoutWallets'
import { getDoctorPriceForService } from '@modules/veterinary/utils/doctor-mappers'
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const {
  steps,
  currentStep,
  activeStep,
  serviceType,
  selectedDoctor,
  selectedDay,
  selectedSlot,
  appointmentView,
  upcomingDays,
  availableSlots,
  searchQuery,
  cityFilter,
  sortBy,
  sortOptions,
  cityOptions,
  filteredDoctors,
  doctorsLoading,
  doctorsLoadingMore,
  doctorsError,
  doctorsHasMore,
  reservedTimesLoading,
  reservedTimesError,
  canReserveDay,
  payment,
  paymentErrors,
  requiresAddress,
  isFirstStep,
  isLastStep,
  next,
  prev,
  selectServiceType,
  selectDoctor,
  openDaySlots,
  selectSlot,
  touchPaymentField,
  setPaymentMethod,
  setPaymentField,
  loadMoreDoctors,
  refetchDoctors,
  refetchReservedTimes,
} = useVeterinaryBookingWizard()

const { placeVeterinaryPayment } = useVeterinaryPayment()
const { primaryWallet, isLoading: walletsLoading, refetch: refetchWallets } = useCheckoutWallets()

const submitting = ref(false)
const pinModalOpen = ref(false)
const pinServerError = ref('')

const breadcrumbItems = computed(() => [
  { label: t('site.nav.home'), to: localePath(ROUTES.HOME) },
  { label: t('site.nav.veterinary'), to: localePath(VETERINARY_ROUTES.ROOT) },
  { label: t('site.veterinary.book.breadcrumb') },
])

const nextLabel = computed(() =>
  isLastStep.value
    ? t('site.veterinary.book.pay')
    : t('site.veterinary.book.next'),
)

const showWizardNext = computed(() => isLastStep.value)

const payableTotal = computed(() => {
  if (!selectedDoctor.value || !serviceType.value) return 0
  return getDoctorPriceForService(selectedDoctor.value, serviceType.value)
})

const walletDisabled = computed(() => {
  if (walletsLoading.value || !primaryWallet.value) return true
  return primaryWallet.value.balance < payableTotal.value
})

const paymentSummary = computed(() => {
  if (!selectedDoctor.value || !serviceType.value) return undefined

  const serviceLabel =
    serviceType.value === 'clinic'
      ? t('site.veterinary.book.serviceTypes.clinic.title')
      : t('site.veterinary.book.serviceTypes.fieldVisit.title')

  return {
    title: selectedDoctor.value.fullName,
    items: [{ label: serviceLabel, amount: payableTotal.value }],
    total: payableTotal.value,
    currency: 'SAR',
  }
})

watch(
  () => walletDisabled.value,
  (disabled) => {
    if (disabled && payment.paymentMethod === 'wallet') {
      setPaymentMethod('')
    }
  },
)

watch(
  activeStep,
  (step) => {
    if (step === 'payment') {
      void refetchWallets()
    }
  },
  { immediate: true },
)

async function onNext() {
  if (!isLastStep.value) return
  await submitPayment()
}

async function submitPayment() {
  const valid = await next()
  if (!valid) return

  if (
    !selectedDoctor.value ||
    !serviceType.value ||
    !selectedDay.value ||
    !selectedSlot.value ||
    !payment.paymentMethod
  ) {
    return
  }

  if (payment.paymentMethod === 'wallet') {
    if (walletDisabled.value) {
      toast.warning(t('site.veterinary.book.payment.walletInsufficientBalance'))
      return
    }
    pinServerError.value = ''
    pinModalOpen.value = true
    return
  }

  await submitCardPayment()
}

async function submitCardPayment() {
  if (
    !selectedDoctor.value ||
    !serviceType.value ||
    !selectedDay.value ||
    !selectedSlot.value ||
    payment.paymentMethod !== 'card'
  ) {
    return
  }

  submitting.value = true

  try {
    const result = await placeVeterinaryPayment({
      doctor: selectedDoctor.value,
      serviceType: serviceType.value,
      day: selectedDay.value.day,
      date: selectedDay.value.date,
      slot: selectedSlot.value,
      payment,
      summary: paymentSummary.value,
    })

    if (result.success) {
      toast.success(result.message || t('site.veterinary.book.payment.success'))
      await navigateTo(localePath(VETERINARY_ROUTES.ROOT))
      return
    }

    if (result.status !== 'cancelled') {
      toast.error(result.message || t('site.veterinary.book.payment.failed'))
    }
  } catch {
    toast.error(t('site.veterinary.book.payment.failed'))
  } finally {
    submitting.value = false
  }
}

async function onWalletPinSubmit(pinCode: string) {
  if (
    !selectedDoctor.value ||
    !serviceType.value ||
    !selectedDay.value ||
    !selectedSlot.value
  ) {
    return
  }

  submitting.value = true
  pinServerError.value = ''

  try {
    const result = await placeVeterinaryPayment({
      doctor: selectedDoctor.value,
      serviceType: serviceType.value,
      day: selectedDay.value.day,
      date: selectedDay.value.date,
      slot: selectedSlot.value,
      payment,
      pinCode,
      summary: paymentSummary.value,
    })

    if (result.success) {
      pinModalOpen.value = false
      toast.success(result.message || t('site.veterinary.book.payment.success'))
      await refetchWallets()
      await navigateTo(localePath(VETERINARY_ROUTES.ROOT))
      return
    }

    const pinError =
      result.fieldErrors?.PIN_code?.[0]
      ?? result.fieldErrors?.pin_code?.[0]

    if (pinError) {
      pinServerError.value = pinError
      return
    }

    toast.error(result.message || t('site.veterinary.book.payment.failed'))
  } catch {
    toast.error(t('site.veterinary.book.payment.failed'))
  } finally {
    submitting.value = false
  }
}

function onPrev() {
  prev()
}
</script>

<template>
  <section class="bg-[#f4f6f5] dark:bg-background">
    <div class="mx-auto max-w-7xl px-4 py-[12px] sm:px-6  lg:px-6">
      <BaseBreadcrumb :items="breadcrumbItems" class="mb-6" />

      <FormWizardShell
        :steps="steps"
        :current-step="currentStep"
        :next-label="nextLabel"
        :prev-label="t('site.veterinary.book.prev')"
        :show-prev="!isFirstStep"
        :show-next="showWizardNext"
        :hide-next-arrow="isLastStep"
        :loading="submitting"
        :progress-label="t('site.veterinary.book.progressLabel')"
        @next="onNext"
        @prev="onPrev"
      >
        <VeterinaryServiceTypeStep
          v-if="activeStep === 'serviceType'"
          :selected-id="serviceType"
          @select="selectServiceType"
        />

        <VeterinaryDoctorStep
          v-else-if="activeStep === 'doctor' && serviceType"
          :doctors="filteredDoctors"
          :service-type="serviceType"
          :loading="doctorsLoading"
          :loading-more="doctorsLoadingMore"
          :has-more="doctorsHasMore"
          :error="doctorsError"
          :search-query="searchQuery"
          :city-filter="cityFilter"
          :sort-by="sortBy"
          :city-options="cityOptions"
          :sort-options="sortOptions"
          @update:search-query="searchQuery = $event"
          @update:city-filter="cityFilter = $event"
          @update:sort-by="sortBy = $event"
          @book="selectDoctor"
          @load-more="loadMoreDoctors"
          @retry="refetchDoctors"
        />

        <VeterinaryAppointmentStep
          v-else-if="activeStep === 'appointment' && selectedDoctor && serviceType"
          :doctor="selectedDoctor"
          :service-type="serviceType"
          :view="appointmentView"
          :days="upcomingDays"
          :slots="availableSlots"
          :selected-day="selectedDay"
          :loading-slots="reservedTimesLoading"
          :slots-error="reservedTimesError"
          :can-reserve-day="canReserveDay"
          @open-day="openDaySlots"
          @select-slot="selectSlot"
          @change-day="appointmentView = 'days'"
          @retry-slots="refetchReservedTimes"
        />

        <VeterinaryPaymentStep
          v-else-if="activeStep === 'payment' && selectedDoctor && serviceType"
          :doctor="selectedDoctor"
          :service-type="serviceType"
          :model="payment"
          :errors="paymentErrors"
          :requires-address="requiresAddress"
          :wallet="primaryWallet"
          :wallet-loading="walletsLoading"
          :wallet-disabled="walletDisabled"
          @update:customer-name="setPaymentField('customerName', $event)"
          @update:customer-phone="setPaymentField('customerPhone', $event)"
          @update:country-code="setPaymentField('countryCode', $event)"
          @update:address="setPaymentField('address', $event)"
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
