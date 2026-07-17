<script setup lang="ts">
import type { InsuranceCustomerFormValues } from '@modules/insurance/schemas/customer.schema'

defineProps<{
  model: InsuranceCustomerFormValues
  errors: Partial<Record<keyof InsuranceCustomerFormValues, string>>
}>()

const emit = defineEmits<{
  'update:nationalId': [value: string | number]
  'field-blur': [field: keyof InsuranceCustomerFormValues]
}>()

const { t } = useI18n()
</script>

<template>
  <form class="space-y-5" novalidate @submit.prevent>
    <div class="grid gap-4 sm:grid-cols-2">
      <BaseInput
        :model-value="model.nationalId"
        inputmode="numeric"
        autocomplete="off"
        :label="t('site.insurance.register.form.nationalId')"
        :placeholder="t('site.insurance.register.form.nationalIdPlaceholder')"
        :error="errors.nationalId"
        required
        @update:model-value="emit('update:nationalId', $event)"
        @blur="emit('field-blur', 'nationalId')"
      />

      <BaseInput
        v-model="model.name"
        autocomplete="name"
        :label="t('site.insurance.register.form.name')"
        :placeholder="t('site.insurance.register.form.namePlaceholder')"
        :error="errors.name"
        required
        @blur="emit('field-blur', 'name')"
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <BasePhoneInput
        id="insurance-register-phone"
        v-model:phone="model.phone"
        v-model:country-code="model.countryCode"
        :label="t('site.insurance.register.form.phone')"
        :placeholder="t('site.insurance.register.form.phonePlaceholder')"
        :error="errors.phone"
        :country-aria-label="t('site.insurance.register.form.countryCode')"
        required
        @blur="emit('field-blur', 'phone')"
      />

      <BaseInput
        v-model="model.email"
        type="email"
        autocomplete="email"
        :label="t('site.insurance.register.form.email')"
        :placeholder="t('site.insurance.register.form.emailPlaceholder')"
        :error="errors.email"
        required
        @blur="emit('field-blur', 'email')"
      />
    </div>

    <BaseInput
      v-model="model.address"
      autocomplete="street-address"
      :label="t('site.insurance.register.form.address')"
      :placeholder="t('site.insurance.register.form.addressPlaceholder')"
      :error="errors.address"
      required
      @blur="emit('field-blur', 'address')"
    />
  </form>
</template>
