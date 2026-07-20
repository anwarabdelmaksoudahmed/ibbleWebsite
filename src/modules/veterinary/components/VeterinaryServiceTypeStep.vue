<script setup lang="ts">
import {
  VETERINARY_SERVICE_TYPES,
  type VeterinaryServiceTypeId,
} from '@modules/veterinary/constants/routes'
import { cn } from '@shared/utils/cn'

defineProps<{
  selectedId: VeterinaryServiceTypeId | ''
}>()

const emit = defineEmits<{
  select: [id: VeterinaryServiceTypeId]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <header class="text-center">
      <h2 class="text-lg font-extrabold text-ibbil-green sm:text-xl">
        {{ t('site.veterinary.book.sections.serviceType') }}
      </h2>
      <p class="mt-2 text-sm text-foreground-muted">
        {{ t('site.veterinary.book.sections.serviceTypeHint') }}
      </p>
    </header>

    <div
      class="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2"
      role="radiogroup"
      :aria-label="t('site.veterinary.book.sections.serviceType')"
    >
      <button
        v-for="option in VETERINARY_SERVICE_TYPES"
        :key="option.id"
        type="button"
        role="radio"
        :aria-checked="selectedId === option.id"
        class="group flex min-h-52 flex-col items-center justify-center rounded-2xl border bg-white p-8 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green/30"
        :class="cn(
          selectedId === option.id
            ? 'border-ibbil-green bg-ibbil-green/5 shadow-sm ring-1 ring-ibbil-green/20'
            : 'border-ibbil-green/10 hover:border-ibbil-green/30 hover:shadow-sm',
        )"
        @click="emit('select', option.id)"
      >
        <span
          class="mb-5 inline-flex size-16 items-center justify-center rounded-2xl transition-colors"
          :class="
            selectedId === option.id
              ? 'bg-ibbil-green/10 text-ibbil-green'
              : 'bg-[#f0f2f1] text-foreground-muted group-hover:bg-ibbil-green/8 group-hover:text-ibbil-green'
          "
        >
          <Icon :name="option.icon" class="size-8" aria-hidden="true" />
        </span>
        <span class="text-lg font-bold text-ibbil-gold">
          {{ t(`site.veterinary.book.serviceTypes.${option.id}.title`) }}
        </span>
      </button>
    </div>
  </div>
</template>
