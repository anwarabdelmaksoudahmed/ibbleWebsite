<script setup lang="ts">
import type {
  TransportDeliveryField,
  TransportDeliveryFormValues,
} from '@modules/transport/schemas/register.schema'
import TripRoutePicker from '@shared/maps/components/TripRoutePicker.vue'

defineProps<{
  model: TransportDeliveryFormValues
  errors: Partial<Record<TransportDeliveryField, string>>
}>()

const emit = defineEmits<{
  'update:distanceKm': [value: string | number]
  'field-blur': [field: TransportDeliveryField]
}>()

const { t } = useI18n()

const today = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})
</script>

<template>
  <form class="space-y-2" novalidate @submit.prevent>
    <TripRoutePicker
      layout="split"
      :show-swap="false"
      distance-readonly
      :origin="model.origin"
      :destination="model.destination"
      :distance-km="model.distanceKm"
      :origin-error="errors.origin"
      :destination-error="errors.destination"
      :distance-error="errors.distanceKm"
      :origin-label="t('site.transport.register.form.origin')"
      :destination-label="t('site.transport.register.form.destination')"
      :distance-label="t('site.transport.register.form.distanceKm')"
      :origin-placeholder="t('site.transport.register.form.originPlaceholder')"
      :destination-placeholder="t('site.transport.register.form.destinationPlaceholder')"
      :distance-placeholder="t('site.transport.register.form.distancePlaceholder')"
      :origin-hint="t('site.transport.register.hints.origin')"
      :destination-hint="t('site.transport.register.hints.destination')"
      :auto-distance-hint="t('site.transport.register.hints.autoDistance')"
      @update:origin="model.origin = $event"
      @update:destination="model.destination = $event"
      @update:distance-km="emit('update:distanceKm', $event)"
      @origin-blur="emit('field-blur', 'origin')"
      @destination-blur="emit('field-blur', 'destination')"
      @distance-blur="emit('field-blur', 'distanceKm')"
    >
      <template #before>
        <div class="space-y-4">
          <BaseInput
            v-model="model.name"
            autocomplete="name"
            :label="t('site.transport.register.form.name')"
            :placeholder="t('site.transport.register.form.namePlaceholder')"
            :error="errors.name"
            required
            @blur="emit('field-blur', 'name')"
          />

          <BasePhoneInput
            id="transport-register-phone"
            v-model:phone="model.phone"
            v-model:country-code="model.countryCode"
            :label="t('site.transport.register.form.phone')"
            :placeholder="t('site.transport.register.form.phonePlaceholder')"
            :error="errors.phone"
            :country-aria-label="t('site.transport.register.form.countryCode')"
            required
            @blur="emit('field-blur', 'phone')"
          />

          <div class="grid gap-4 sm:grid-cols-2">
            <BaseDatePicker
              v-model="model.transportDate"
              :min="today"
              :label="t('site.transport.register.form.transportDate')"
              :placeholder="t('site.transport.register.form.transportDatePlaceholder')"
              :error="errors.transportDate"
              required
              @blur="emit('field-blur', 'transportDate')"
            />

            <BaseTimePicker
              v-model="model.transportTime"
              :label="t('site.transport.register.form.transportTime')"
              :placeholder="t('site.transport.register.form.transportTimePlaceholder')"
              :error="errors.transportTime"
              required
              @blur="emit('field-blur', 'transportTime')"
            />
          </div>
        </div>
      </template>
    </TripRoutePicker>
  </form>
</template>
