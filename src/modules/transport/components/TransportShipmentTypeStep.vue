<script setup lang="ts">
import type { TransportVehicleType } from '@modules/transport/types'
import { cn } from '@shared/utils/cn'

defineProps<{
  options: TransportVehicleType[]
  selectedId: string
  loading?: boolean
  errorMessage?: string
  error?: string
}>()

const emit = defineEmits<{
  select: [id: string]
  retry: []
}>()

const { t, locale, n } = useI18n()

const failedImages = ref(new Set<string>())

function showImage(option: TransportVehicleType): boolean {
  return Boolean(option.image) && !failedImages.value.has(option.id)
}

function onImageError(id: string) {
  const next = new Set(failedImages.value)
  next.add(id)
  failedImages.value = next
}

function formatPrice(value: number): string {
  if (!value) return ''
  try {
    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return String(value)
  }
}

function optionMeta(option: TransportVehicleType): string {
  const parts: string[] = []
  if (option.capacity > 0) {
    parts.push(
      t('site.transport.register.shipmentTypes.capacity', {
        count: n(option.capacity),
      }),
    )
  }
  const price = formatPrice(option.kilometerPrice)
  if (price) {
    parts.push(
      t('site.transport.register.shipmentTypes.pricePerKm', { price }),
    )
  }
  return parts.join(' · ')
}
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

    <BaseLoader
      v-if="loading"
      block
      tone="brand"
      show-label
      :label="t('site.transport.register.shipmentTypes.loading')"
    />

    <div
      v-else-if="errorMessage"
      class="rounded-2xl border border-ibbil-green/10 bg-white dark:bg-surface-elevated"
    >
      <BaseErrorState
        variant="brand"
        :title="t('site.transport.register.shipmentTypes.errorTitle')"
        :message="errorMessage"
        @retry="emit('retry')"
      />
    </div>

    <BaseEmptyState
      v-else-if="!options.length"
      variant="brand"
      icon="lucide:truck"
      :title="t('site.transport.register.shipmentTypes.emptyTitle')"
      :description="t('site.transport.register.shipmentTypes.emptyDescription')"
    />

    <div
      v-else
      class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      role="radiogroup"
      :aria-label="t('site.transport.register.sections.shipmentType')"
      :aria-invalid="!!error || undefined"
      :data-validation-error="error ? '' : undefined"
    >
      <button
        v-for="option in options"
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
          class="mb-3 inline-flex size-11 items-center justify-center overflow-hidden rounded-xl transition-colors"
          :class="
            selectedId === option.id
              ? 'bg-ibbil-green text-white'
              : 'bg-ibbil-green/8 text-ibbil-green group-hover:bg-ibbil-green/12'
          "
        >
          <img
            v-if="showImage(option)"
            :src="option.image"
            :alt="option.name"
            class="size-full object-cover"
            loading="lazy"
            decoding="async"
            @error="onImageError(option.id)"
          >
          <Icon
            v-else
            name="lucide:truck"
            class="size-5"
            aria-hidden="true"
          />
        </span>
        <span class="block text-sm font-bold text-ibbil-green">
          {{ option.name }}
        </span>
        <span
          v-if="optionMeta(option)"
          class="mt-1 block text-xs leading-relaxed text-foreground-muted"
        >
          {{ optionMeta(option) }}
        </span>
      </button>
    </div>

    <p v-if="error" class="text-xs text-danger" role="alert">
      {{ error }}
    </p>
  </div>
</template>
