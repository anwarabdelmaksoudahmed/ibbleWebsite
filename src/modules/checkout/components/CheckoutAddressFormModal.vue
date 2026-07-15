<script setup lang="ts">
import { DEFAULT_COUNTRY_CODE } from '@shared/constants/country-codes'
import type { AddressFormInput, CheckoutCity, CheckoutCountry, CustomerAddress } from '@modules/checkout/types'
import {
  addressToFormInput,
  createEmptyAddressForm,
} from '@modules/checkout/utils/mappers'

const props = defineProps<{
  open: boolean
  address?: CustomerAddress | null
  countries: CheckoutCountry[]
  cities: CheckoutCity[]
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [input: AddressFormInput]
}>()

const { t } = useI18n()

const form = reactive<AddressFormInput>(createEmptyAddressForm())
const errors = reactive<Partial<Record<keyof AddressFormInput, string>>>({})

const isEdit = computed(() => Boolean(props.address?.id))

const title = computed(() =>
  isEdit.value
    ? t('site.commerce.checkout.editAddressTitle')
    : t('site.commerce.checkout.addAddressTitle'),
)

const cityOptions = computed(() =>
  props.cities
    .filter((city) => !form.countryId || city.countryId === form.countryId)
    .map((city) => ({ label: city.name, value: city.id })),
)

const countryOptions = computed(() =>
  props.countries.map((country) => ({ label: country.name, value: country.id })),
)

watch(
  () => [props.open, props.address] as const,
  ([open]) => {
    if (!open) return
    errors.name = undefined
    errors.phone = undefined
    errors.address = undefined
    errors.countryId = undefined
    errors.cityId = undefined
    if (props.address) {
      Object.assign(form, addressToFormInput(props.address))
    } else {
      Object.assign(form, createEmptyAddressForm())
      if (props.countries[0]) form.countryId = props.countries[0].id
      form.countryCode = DEFAULT_COUNTRY_CODE.apiCode
    }
  },
)

watch(
  () => form.countryId,
  (countryId, prev) => {
    if (!prev || countryId === prev) return
    const stillValid = props.cities.some(
      (city) => city.id === form.cityId && city.countryId === countryId,
    )
    if (!stillValid) form.cityId = ''
  },
)

function close() {
  emit('update:open', false)
}

function validate(): boolean {
  errors.name = form.name.trim() ? undefined : t('site.commerce.checkout.validation.name')
  errors.phone = form.phone.trim() ? undefined : t('site.commerce.checkout.validation.phone')
  errors.address = form.address.trim() ? undefined : t('site.commerce.checkout.validation.address')
  errors.countryId = form.countryId ? undefined : t('site.commerce.checkout.validation.country')
  errors.cityId = form.cityId ? undefined : t('site.commerce.checkout.validation.city')
  return !Object.values(errors).some(Boolean)
}

function onSubmit() {
  if (!validate()) return
  emit('submit', { ...form })
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="title"
    size="lg"
    @update:open="emit('update:open', $event)"
  >
    <form class="space-y-4" @submit.prevent="onSubmit">
      <BaseInput
        v-model="form.name"
        :label="t('site.commerce.checkout.form.name')"
        :placeholder="t('site.commerce.checkout.form.namePlaceholder')"
        :error="errors.name"
        required
      />

      <BaseInput
        v-model="form.email"
        type="email"
        :label="t('site.commerce.checkout.form.email')"
        :placeholder="t('site.commerce.checkout.form.emailPlaceholder')"
      />

      <BasePhoneInput
        id="checkout-phone"
        v-model:phone="form.phone"
        v-model:country-code="form.countryCode"
        :label="t('site.commerce.checkout.form.phone')"
        :placeholder="t('site.commerce.checkout.form.phonePlaceholder')"
        :error="errors.phone"
        :country-aria-label="t('site.commerce.checkout.form.countryCode')"
        required
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <BaseSelect
          v-model="form.countryId"
          :label="t('site.commerce.checkout.form.country')"
          :placeholder="t('site.commerce.checkout.form.countryPlaceholder')"
          :options="countryOptions"
          :error="errors.countryId"
          searchable
          required
        />
        <BaseSelect
          v-model="form.cityId"
          :label="t('site.commerce.checkout.form.city')"
          :placeholder="t('site.commerce.checkout.form.cityPlaceholder')"
          :options="cityOptions"
          :error="errors.cityId"
          :disabled="!form.countryId"
          searchable
          required
        />
      </div>

      <BaseTextarea
        v-model="form.address"
        :label="t('site.commerce.checkout.form.address')"
        :placeholder="t('site.commerce.checkout.form.addressPlaceholder')"
        :error="errors.address"
        :rows="3"
        required
      />

      <BaseInput
        v-model="form.zipCode"
        :label="t('site.commerce.checkout.form.zip')"
        :placeholder="t('site.commerce.checkout.form.zipPlaceholder')"
      />

      <BaseCheckbox
        v-model="form.isDefault"
        :label="t('site.commerce.checkout.form.isDefault')"
      />
    </form>

    <template #footer>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <BaseButton
          variant="ghost"
          :disabled="saving"
          @click="close"
        >
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton
          class="!bg-ibbil-green !text-white hover:!bg-ibbil-green-dark"
          :loading="saving"
          @click="onSubmit"
        >
          {{ isEdit ? t('site.commerce.checkout.saveAddress') : t('site.commerce.checkout.addAddress') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
