<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BaseLoaderProps = {
  size?: ComponentSize
  label?: string
}

const props = withDefaults(defineProps<BaseLoaderProps>(), {
  size: 'md',
  label: 'Loading',
})

const sizeClasses: Record<ComponentSize, string> = {
  xs: 'size-3 border',
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-2',
  xl: 'size-10 border-[3px]',
}
</script>

<template>
  <div role="status" :aria-label="label" class="inline-flex">
    <div
      :class="cn(
        'animate-spin rounded-full border-current border-t-transparent',
        sizeClasses[size],
      )"
    />
    <span class="sr-only">{{ label }}</span>
  </div>
</template>
