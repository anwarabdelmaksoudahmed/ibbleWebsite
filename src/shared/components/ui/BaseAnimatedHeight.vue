<script setup lang="ts">
/**
 * Smoothly animates its own height whenever the slotted content grows or
 * shrinks (conditional sections, swapped forms, validation messages, …).
 * Respects `prefers-reduced-motion`. Height is `auto` during SSR / first
 * paint, so there is no layout shift before hydration.
 */
const props = withDefaults(
  defineProps<{
    /** Height transition duration in ms. */
    duration?: number
  }>(),
  { duration: 350 },
)

const wrapperRef = ref<HTMLElement | null>(null)
const innerRef = ref<HTMLElement | null>(null)
const transitionEnabled = ref(false)

let observer: ResizeObserver | null = null

const wrapperStyle = computed(() =>
  transitionEnabled.value
    ? { transition: `height ${props.duration}ms cubic-bezier(0.33, 1, 0.68, 1)` }
    : undefined,
)

onMounted(() => {
  const wrapper = wrapperRef.value
  const inner = innerRef.value
  if (!wrapper || !inner) return

  wrapper.style.height = `${inner.offsetHeight}px`

  observer = new ResizeObserver(() => {
    wrapper.style.height = `${inner.offsetHeight}px`
  })
  observer.observe(inner)

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion) {
    // Enable the transition only after the initial height is painted,
    // so content never animates in from 0 on mount.
    requestAnimationFrame(() => {
      transitionEnabled.value = true
    })
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <!-- -m-1 / p-1 keep focus rings visible despite overflow-hidden clipping. -->
  <div ref="wrapperRef" class="-m-1 overflow-hidden" :style="wrapperStyle">
    <div ref="innerRef" class="p-1">
      <slot />
    </div>
  </div>
</template>
