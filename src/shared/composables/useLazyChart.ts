import type { Component } from 'vue'
import type { LazyChartKind } from '@shared/charts/types'

/**
 * Defers Chart.js + vue-chartjs until the host enters the viewport.
 * Keeps the chart bundle out of the critical path.
 */
export function useLazyChart(kind: LazyChartKind) {
  const root = ref<HTMLElement | null>(null)
  const ChartCmp = shallowRef<Component | null>(null)
  const isVisible = ref(false)
  const isReady = ref(false)
  const isLoading = ref(false)
  const loadError = ref(false)

  let loadingPromise: Promise<void> | null = null

  async function loadChart() {
    if (isReady.value || loadingPromise) return loadingPromise

    isLoading.value = true
    loadError.value = false

    loadingPromise = (async () => {
      try {
        if (kind === 'doughnut') {
          const [{ ensureDoughnutChartRegistered }, { Doughnut }] = await Promise.all([
            import('@shared/charts/register-doughnut'),
            import('vue-chartjs'),
          ])
          ensureDoughnutChartRegistered()
          ChartCmp.value = markRaw(Doughnut)
        } else {
          const [{ ensureBarChartRegistered }, { Bar }] = await Promise.all([
            import('@shared/charts/register-bar'),
            import('vue-chartjs'),
          ])
          ensureBarChartRegistered()
          ChartCmp.value = markRaw(Bar)
        }
        isReady.value = true
      } catch {
        loadError.value = true
        loadingPromise = null
      } finally {
        isLoading.value = false
      }
    })()

    return loadingPromise
  }

  const { stop } = useIntersectionObserver(
    root,
    ([entry]) => {
      if (!entry?.isIntersecting || isVisible.value) return
      isVisible.value = true
      stop()
      void loadChart()
    },
    {
      rootMargin: '160px 0px',
      threshold: 0.01,
    },
  )

  onBeforeUnmount(() => {
    stop()
  })

  return {
    root,
    ChartCmp,
    isVisible,
    isReady,
    isLoading,
    loadError,
    retry: loadChart,
  }
}
