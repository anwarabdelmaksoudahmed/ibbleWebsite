<script setup lang="ts">
import { cn } from '@shared/utils/cn'

export type BaseCardProps = {
  title?: string
  subtitle?: string
  padding?: boolean
  hoverable?: boolean
}

const props = withDefaults(defineProps<BaseCardProps>(), {
  padding: true,
  hoverable: false,
})
</script>

<template>
  <div
    :class="cn(
      'rounded-xl border border-border bg-surface-elevated',
      hoverable && 'transition-shadow hover:shadow-md',
    )"
  >
    <div v-if="title || $slots.header" class="border-b border-border px-6 py-4">
      <slot name="header">
        <h3 v-if="title" class="text-base font-semibold text-foreground">{{ title }}</h3>
        <p v-if="subtitle" class="mt-1 text-sm text-foreground-muted">{{ subtitle }}</p>
      </slot>
    </div>
    <div :class="padding ? 'p-6' : ''">
      <slot />
    </div>
    <div v-if="$slots.footer" class="border-t border-border px-6 py-4">
      <slot name="footer" />
    </div>
  </div>
</template>
