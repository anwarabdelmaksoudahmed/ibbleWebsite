<script setup lang="ts">
import type { ComponentSize, ComponentVariant } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BaseBadgeProps = {
  variant?: ComponentVariant
  size?: ComponentSize
  dot?: boolean
}

const props = withDefaults(defineProps<BaseBadgeProps>(), {
  variant: 'primary',
  size: 'sm',
  dot: false,
})

const variantClasses: Record<ComponentVariant, string> = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
  brand: 'bg-ibbil-green/10 text-ibbil-green',
  secondary: 'bg-surface-muted text-foreground-muted',
  outline: 'border border-border text-foreground',
  ghost: 'bg-transparent text-foreground-muted',
  danger: 'bg-danger/10 text-danger',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
}

const sizeClasses: Record<ComponentSize, string> = {
  xs: 'text-xs px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1',
  xl: 'text-base px-3 py-1',
}
</script>

<template>
  <span
    :class="cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      variantClasses[variant],
      sizeClasses[size],
    )"
  >
    <span v-if="dot" class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    <slot />
  </span>
</template>
