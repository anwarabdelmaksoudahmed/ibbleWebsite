<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BaseAvatarProps = {
  src?: string
  alt?: string
  name?: string
  size?: ComponentSize
}

const props = withDefaults(defineProps<BaseAvatarProps>(), {
  size: 'md',
})

const sizeClasses: Record<ComponentSize, string> = {
  xs: 'size-6 text-xs',
  sm: 'size-8 text-sm',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
}

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
})
</script>

<template>
  <div
    :class="cn(
      'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300',
      sizeClasses[size],
    )"
    role="img"
    :aria-label="alt || name"
  >
    <NuxtImg v-if="src" :src="src" :alt="alt || name || ''" class="size-full object-cover" />
    <span v-else>{{ initials }}</span>
  </div>
</template>
