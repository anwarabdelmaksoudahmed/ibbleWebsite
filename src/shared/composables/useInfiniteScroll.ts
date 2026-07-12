import { useIntersectionObserver } from '@vueuse/core'

export function useInfiniteScroll(callback: () => void | Promise<void>, options?: { distance?: number }) {
  const target = ref<HTMLElement | null>(null)
  const isLoading = ref(false)
  const isEnabled = ref(true)

  const { stop } = useIntersectionObserver(
    target,
    async ([entry]) => {
      if (!entry?.isIntersecting || isLoading.value || !isEnabled.value) return

      isLoading.value = true
      try {
        await callback()
      } finally {
        isLoading.value = false
      }
    },
    { rootMargin: `${options?.distance ?? 100}px` },
  )

  function disable() {
    isEnabled.value = false
  }

  function enable() {
    isEnabled.value = true
  }

  onUnmounted(() => stop())

  return {
    target,
    isLoading,
    disable,
    enable,
  }
}
