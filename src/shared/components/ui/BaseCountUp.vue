<script setup lang="ts">
import { useCountUp } from '@shared/composables/useCountUp'

const props = withDefaults(
  defineProps<{
    to: number
    duration?: number
    suffix?: string
    prefix?: string
  }>(),
  {
    duration: 1600,
    suffix: '',
    prefix: '',
  },
)

const root = ref<HTMLElement | null>(null)
const prefersReducedMotion = usePreferredReducedMotion()

const { display } = useCountUp(root, {
  to: () => props.to,
  duration: props.duration,
  disabled: () => prefersReducedMotion.value === 'reduce',
})

const formatted = computed(() => {
  const n = new Intl.NumberFormat(undefined).format(display.value)
  return `${props.prefix}${n}${props.suffix}`
})
</script>

<template>
  <span ref="root" class="tabular-nums">
    {{ formatted }}
  </span>
</template>
