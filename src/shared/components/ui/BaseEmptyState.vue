<script setup lang="ts">
import { cn } from '@shared/utils/cn'

export type BaseEmptyStateProps = {
  title?: string
  description?: string
  icon?: string
  /** `brand` matches public marketplace surfaces */
  variant?: 'default' | 'brand'
}

withDefaults(defineProps<BaseEmptyStateProps>(), {
  title: undefined,
  description: undefined,
  icon: 'lucide:inbox',
  variant: 'default',
})

const { t } = useI18n()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center px-4 py-14 text-center sm:py-16"
    role="status"
  >
    <div
      :class="cn(
        'mb-4 flex items-center justify-center rounded-full p-4',
        variant === 'brand'
          ? 'bg-ibbil-green/[0.08] text-ibbil-green'
          : 'bg-surface-muted text-foreground-muted',
      )"
    >
      <Icon :name="icon" class="size-8" aria-hidden="true" />
    </div>

    <h3
      :class="cn(
        'text-base font-semibold sm:text-lg',
        variant === 'brand' ? 'text-ibbil-green' : 'text-foreground',
      )"
    >
      {{ title ?? t('common.noResults') }}
    </h3>

    <p class="mt-2 max-w-md text-sm leading-relaxed text-foreground-muted">
      {{ description ?? t('common.emptyDescription') }}
    </p>

    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </div>
</template>
