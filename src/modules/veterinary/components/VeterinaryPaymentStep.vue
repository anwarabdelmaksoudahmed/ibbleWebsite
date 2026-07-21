<script setup lang="ts">
import InsurancePaymentMethods from '@modules/insurance/components/InsurancePaymentMethods.vue'
import VeterinaryDoctorSummary from '@modules/veterinary/components/VeterinaryDoctorSummary.vue'
import type { VeterinaryServiceTypeId } from '@modules/veterinary/constants/routes'
import type { VeterinaryPaymentField, VeterinaryPaymentFormValues } from '@modules/veterinary/schemas/booking.schema'
import type { VeterinaryDoctor } from '@modules/veterinary/types'
import type { UserWallet } from '@modules/checkout/types'

const emit = defineEmits<{
  'update:customerName': [value: string]
  'update:customerPhone': [value: string]
  'update:countryCode': [value: string]
  'update:address': [value: string]
  'update:paymentMethod': [value: 'card' | 'wallet']
  'field-blur': [field: VeterinaryPaymentField]
}>()

const props = defineProps<{
  doctor: VeterinaryDoctor
  serviceType: VeterinaryServiceTypeId
  model: VeterinaryPaymentFormValues
  errors: Partial<Record<VeterinaryPaymentField, string>>
  requiresAddress: boolean
  wallet?: UserWallet | null
  walletLoading?: boolean
  walletDisabled?: boolean
}>()

const phoneModel = computed({
  get: () => props.model.customerPhone,
  set: (value: string) => emit('update:customerPhone', value),
})

const countryCodeModel = computed({
  get: () => props.model.countryCode,
  set: (value: string) => emit('update:countryCode', value),
})

const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h2 class="text-lg font-extrabold text-ibbil-green sm:text-xl">
        {{ t('site.veterinary.book.payment.title') }}
      </h2>
      <p class="text-sm text-foreground-muted">
        {{ t('site.veterinary.book.payment.subtitle') }}
      </p>
    </header>

    <VeterinaryDoctorSummary :doctor="doctor" :service-type="serviceType" compact />

    <form class="space-y-4" novalidate @submit.prevent>
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput
          :model-value="model.customerName"
          :label="t('site.veterinary.book.payment.customerName')"
          :placeholder="t('site.veterinary.book.payment.customerNamePlaceholder')"
          :error="errors.customerName"
          required
          @update:model-value="emit('update:customerName', String($event))"
          @blur="emit('field-blur', 'customerName')"
        />

      <BasePhoneInput
        v-model:phone="phoneModel"
        v-model:country-code="countryCodeModel"
        :label="t('site.veterinary.book.payment.customerPhone')"
        :placeholder="t('site.veterinary.book.payment.customerPhonePlaceholder')"
        :error="errors.customerPhone"
        required
        @blur="emit('field-blur', 'customerPhone')"
      />
      </div>

      <BaseInput
        v-if="requiresAddress"
        :model-value="model.address"
        :label="t('site.veterinary.book.payment.address')"
        :placeholder="t('site.veterinary.book.payment.addressPlaceholder')"
        :error="errors.address"
        required
        @update:model-value="emit('update:address', String($event))"
        @blur="emit('field-blur', 'address')"
      />

      <InsurancePaymentMethods
        :model-value="model.paymentMethod"
        :error="errors.paymentMethod"
        :wallet="wallet"
        :wallet-loading="walletLoading"
        :wallet-disabled="walletDisabled"
        @update:model-value="emit('update:paymentMethod', $event)"
      />
    </form>
  </div>
</template>
