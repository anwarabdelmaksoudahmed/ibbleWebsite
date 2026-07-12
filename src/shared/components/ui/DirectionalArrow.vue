<script setup lang="ts">
import { cn } from '@shared/utils/cn'

/**
 * Directional icon that mirrors automatically for RTL/LTR.
 *
 * - `forward`: reading-direction (→ in LTR, ← in RTL)
 * - `back`: opposite direction (← in LTR, → in RTL)
 *
 * Uses a single LTR-forward glyph + `rtl:rotate-180` so call sites
 * never pick `arrow-left` vs `arrow-right` ad hoc.
 */
export type DirectionalArrowProps = {
  direction?: 'forward' | 'back'
  variant?: 'arrow' | 'chevron'
  size?: 'xs' | 'sm' | 'md'
  /** Hover nudge along the reading direction (requires a `group` ancestor). */
  animated?: boolean
  class?: string
}

const props = withDefaults(defineProps<DirectionalArrowProps>(), {
  direction: 'forward',
  variant: 'arrow',
  size: 'md',
  animated: false,
})

const iconName = computed(() =>
  props.variant === 'chevron' ? 'lucide:chevron-right' : 'lucide:arrow-right',
)

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'h-3.5 w-3.5'
    case 'sm':
      return 'h-4 w-4'
    default:
      return 'h-4 w-4'
  }
})

const classes = computed(() =>
  cn(
    sizeClass.value,
    'shrink-0',
    // Forward = arrow-right in LTR; flip in RTL.
    // Back = opposite: flipped in LTR, upright in RTL.
    props.direction === 'forward' ? 'rtl:rotate-180' : 'rotate-180 rtl:rotate-0',
    props.animated &&
      'transition-transform duration-300 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5',
    props.class,
  ),
)
</script>

<template>
  <Icon
    :name="iconName"
    :class="classes"
    aria-hidden="true"
  />
</template>
