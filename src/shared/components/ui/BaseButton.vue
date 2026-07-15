<script setup lang="ts">
import type { ComponentSize, ComponentVariant } from '@shared/types/ui'
import { SIZE_CLASSES, VARIANT_CLASSES } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BaseButtonProps = {
  variant?: ComponentVariant
  size?: ComponentSize
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  /** Extra classes merged onto the button (preferred over inline styles) */
  class?: string
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-2 font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    props.variant !== 'brand' && 'rounded-lg disabled:pointer-events-none disabled:opacity-50',
    props.variant !== 'brand' && SIZE_CLASSES[props.size],
    VARIANT_CLASSES[props.variant],
    props.block && 'w-full',
    props.class,
  ),
)

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="handleClick"
  >
    <BaseLoader v-if="loading" size="sm" class="text-current" />
    <slot />
  </button>
</template>
