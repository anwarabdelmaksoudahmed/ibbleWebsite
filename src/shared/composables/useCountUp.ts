import { useIntersectionObserver, useTransition, TransitionPresets } from '@vueuse/core'

export type UseCountUpOptions = {
  /** Target number to count to */
  to: MaybeRefOrGetter<number>
  /** Animation duration in ms */
  duration?: number
  /** Start when element enters viewport */
  once?: boolean
  /** Intersection threshold (0–1) */
  threshold?: number
  /** Disabled / reduced-motion: jump to final value */
  disabled?: MaybeRefOrGetter<boolean>
}

/**
 * Animates a number from 0 → target when `target` enters the viewport.
 * Respects prefers-reduced-motion via the `disabled` option.
 */
export function useCountUp(
  target: Ref<HTMLElement | null | undefined>,
  options: UseCountUpOptions,
) {
  const {
    to,
    duration = 1600,
    once = true,
    threshold = 0.35,
    disabled = false,
  } = options

  const source = ref(0)
  const started = ref(false)

  const output = useTransition(source, {
    duration,
    transition: TransitionPresets.easeOutExpo,
    disabled: computed(() => toValue(disabled)),
  })

  const display = computed(() => Math.round(output.value))

  function start() {
    if (started.value && once) return
    started.value = true

    if (toValue(disabled)) {
      source.value = toValue(to)
      return
    }

    source.value = 0
    requestAnimationFrame(() => {
      source.value = toValue(to)
    })
  }

  const { stop } = useIntersectionObserver(
    target,
    ([entry]) => {
      if (!entry?.isIntersecting) return
      start()
      if (once) stop()
    },
    { threshold },
  )

  watch(
    () => toValue(to),
    (value) => {
      if (!started.value) return
      source.value = value
    },
  )

  return {
    display,
    started,
    start,
  }
}
