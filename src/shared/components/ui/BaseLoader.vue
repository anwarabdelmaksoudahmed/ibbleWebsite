<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BaseLoaderProps = {
  size?: ComponentSize
  /** Accessible + optional visible label */
  label?: string
  /** Show label next to / under the spinner */
  showLabel?: boolean
  /** Centered block for section / page loading */
  block?: boolean
  /** Brand-colored spinner for public site surfaces */
  tone?: 'default' | 'brand'
}

const props = withDefaults(defineProps<BaseLoaderProps>(), {
  size: 'md',
  label: undefined,
  showLabel: false,
  block: false,
  tone: 'default',
})

const { t } = useI18n()

const resolvedLabel = computed(() => props.label ?? t('common.loading'))

const sizeClasses: Record<ComponentSize, string> = {
  xs: 'size-3 border',
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-2',
  xl: 'size-10 border-[3px]',
}
</script>

<template>
  <div
    role="status"
    :aria-label="resolvedLabel"
    :class="cn(
      'inline-flex items-center gap-2.5',
      block && 'flex w-full flex-col justify-center py-16',
      tone === 'brand' ? 'text-ibbil-green' : 'text-foreground-muted',
    )"
  >
    <div
      :class="cn(
        'animate-spin rounded-full border-current border-t-transparent',
        sizeClasses[size],
      )"
      aria-hidden="true"
    />
    <span v-if="showLabel || block" class="text-sm font-medium">
      {{ resolvedLabel }}
    </span>
    <span v-else class="sr-only">{{ resolvedLabel }}</span>
  </div>
</template>
