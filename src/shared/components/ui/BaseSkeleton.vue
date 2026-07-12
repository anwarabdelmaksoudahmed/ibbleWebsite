<script setup lang="ts">
import { cn } from '@shared/utils/cn'

export type BaseSkeletonProps = {
  width?: string
  height?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  lines?: number
}

const props = withDefaults(defineProps<BaseSkeletonProps>(), {
  width: '100%',
  height: '1rem',
  rounded: 'md',
  lines: 1,
})

const roundedClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}
</script>

<template>
  <div v-if="lines > 1" class="space-y-2" aria-hidden="true">
    <div
      v-for="i in lines"
      :key="i"
      :class="cn('animate-pulse bg-surface-muted', roundedClasses[rounded])"
      :style="{ width: i === lines ? '75%' : width, height }"
    />
  </div>
  <div
    v-else
    :class="cn('animate-pulse bg-surface-muted', roundedClasses[rounded])"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>
