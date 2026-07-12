<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BaseImageProps = {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  objectFit?: 'cover' | 'contain' | 'fill'
  loading?: boolean
  fallback?: string
  size?: ComponentSize
}

const props = withDefaults(defineProps<BaseImageProps>(), {
  rounded: 'md',
  objectFit: 'cover',
  loading: false,
  size: 'md',
})

const roundedClasses = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

const hasError = ref(false)
</script>

<template>
  <div class="relative inline-block overflow-hidden" :class="roundedClasses[rounded]">
    <BaseSkeleton v-if="loading" width="100%" height="100%" :rounded="rounded === 'none' ? 'sm' : rounded" />
    <NuxtImg
      v-else-if="!hasError"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :class="cn('block', roundedClasses[rounded], `object-${objectFit}`)"
      loading="lazy"
      @error="hasError = true"
    />
    <div
      v-else
      class="flex items-center justify-center bg-surface-muted text-foreground-muted"
      :class="roundedClasses[rounded]"
    >
      <Icon name="lucide:image-off" class="size-8" />
    </div>
  </div>
</template>
