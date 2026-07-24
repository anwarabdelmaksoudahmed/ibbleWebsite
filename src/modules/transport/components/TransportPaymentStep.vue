<script setup lang="ts">
import type { TransportDeliveryFormValues } from '@modules/transport/schemas/register.schema'

const props = defineProps<{
  delivery: TransportDeliveryFormValues
  shipmentTypeName: string
  termsAccepted: boolean
  termsError?: string
}>()

const emit = defineEmits<{
  'update:termsAccepted': [value: boolean]
}>()

const { t, locale } = useI18n()

const formattedDate = computed(() => {
  if (!props.delivery.transportDate) return '—'
  try {
    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-SA' : 'en-SA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${props.delivery.transportDate}T00:00:00`))
  } catch {
    return props.delivery.transportDate
  }
})

const summaryItems = computed(() => [
  {
    label: t('site.transport.register.form.name'),
    value: props.delivery.name || '—',
  },
  {
    label: t('site.transport.register.form.phone'),
    value: props.delivery.phone
      ? `${props.delivery.countryCode} ${props.delivery.phone}`
      : '—',
  },
  {
    label: t('site.transport.register.form.transportDate'),
    value: formattedDate.value,
  },
  {
    label: t('site.transport.register.form.transportTime'),
    value: props.delivery.transportTime || '—',
  },
  {
    label: t('site.transport.register.form.origin'),
    value: props.delivery.origin || '—',
  },
  {
    label: t('site.transport.register.form.destination'),
    value: props.delivery.destination || '—',
  },
  {
    label: t('site.transport.register.form.distanceKm'),
    value: props.delivery.distanceKm
      ? `${props.delivery.distanceKm} ${t('maps.kmUnit')}`
      : '—',
  },
  {
    label: t('site.transport.register.sections.shipmentType'),
    value: props.shipmentTypeName || '—',
  },
])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-base font-bold text-ibbil-green sm:text-lg">
        {{ t('site.transport.register.sections.summary') }}
      </h2>
      <p class="mt-1 text-sm text-foreground-muted">
        {{ t('site.transport.register.sections.summaryHint') }}
      </p>
    </div>

    <dl class="grid gap-3 rounded-2xl border border-ibbil-green/10 bg-[#fafbfa] p-4 sm:grid-cols-2 sm:p-5">
      <div
        v-for="item in summaryItems"
        :key="item.label"
        class="min-w-0 space-y-1"
      >
        <dt class="text-xs font-semibold text-foreground-muted">
          {{ item.label }}
        </dt>
        <dd class="truncate text-sm font-medium text-ibbil-green">
          {{ item.value }}
        </dd>
      </div>
    </dl>

    <BaseCheckbox
      :model-value="termsAccepted"
      size="lg"
      root-class="w-full"
      label-class="!text-foreground leading-relaxed"
      :error="termsError"
      :label="t('site.transport.register.form.termsAccepted')"
      @update:model-value="emit('update:termsAccepted', $event)"
    />
  </div>
</template>
