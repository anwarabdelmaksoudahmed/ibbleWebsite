<script setup lang="ts">
import {
  TRANSPORT_SHIPMENT_TYPES,
  type TransportShipmentTypeId,
} from '@modules/transport/constants/routes'
import { cn } from '@shared/utils/cn'

defineProps<{
  selectedId: TransportShipmentTypeId | ''
  error?: string
}>()

const emit = defineEmits<{
  select: [id: TransportShipmentTypeId]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-base font-bold text-ibbil-green sm:text-lg">
        {{ t('site.transport.register.sections.shipmentType') }}
      </h2>
      <p class="mt-1 text-sm text-foreground-muted">
        {{ t('site.transport.register.sections.shipmentTypeHint') }}
      </p>
    </div>

    <div
      class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      role="radiogroup"
      :aria-label="t('site.transport.register.sections.shipmentType')"
      :aria-invalid="!!error || undefined"
      :data-validation-error="error ? '' : undefined"
    >
      <button
        v-for="option in TRANSPORT_SHIPMENT_TYPES"
        :key="option.id"
        type="button"
        role="radio"
        :aria-checked="selectedId === option.id"
        class="group rounded-2xl border p-4 text-start transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green/30"
        :class="cn(
          selectedId === option.id
            ? 'border-ibbil-green bg-ibbil-green/5 shadow-sm ring-1 ring-ibbil-green/20'
            : 'border-ibbil-green/10 bg-[#fafbfa] hover:border-ibbil-green/30 hover:bg-white',
        )"
        @click="emit('select', option.id)"
      >
        <span
          class="mb-3 inline-flex size-11 items-center justify-center rounded-xl transition-colors"
          :class="
            selectedId === option.id
              ? 'bg-ibbil-green text-white'
              : 'bg-ibbil-green/8 text-ibbil-green group-hover:bg-ibbil-green/12'
          "
        >
          <Icon :name="option.icon" class="size-5" aria-hidden="true" />
        </span>
        <span class="block text-sm font-bold text-ibbil-green">
          {{ t(`site.transport.register.shipmentTypes.${option.id}.title`) }}
        </span>
        <span class="mt-1 block text-xs leading-relaxed text-foreground-muted">
          {{ t(`site.transport.register.shipmentTypes.${option.id}.description`) }}
        </span>
      </button>
    </div>

    <p v-if="error" class="text-xs text-danger" role="alert">
      {{ error }}
    </p>
  </div>
</template>
