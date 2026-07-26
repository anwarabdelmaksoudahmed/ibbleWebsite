<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import { chartColors } from '@shared/charts/colors'
import { createDoughnutOptions } from '@shared/charts/defaults'
import type { ChartSlice } from '@shared/charts/types'

const props = withDefaults(
  defineProps<{
    slices: ChartSlice[]
    centerLabel?: string
    centerValue?: string | number
    height?: number
    options?: ChartOptions<'doughnut'>
  }>(),
  {
    height: 260,
  },
)

const { localeProperties, n } = useI18n()
const isRtl = computed(() => localeProperties.value.dir === 'rtl')

const { root, ChartCmp, isReady, isLoading, loadError, retry } = useLazyChart('doughnut')

const chartData = computed<ChartData<'doughnut'>>(() => {
  const colors = props.slices.map((slice, index) => slice.color ?? chartColors(props.slices.length)[index]!)

  return {
    labels: props.slices.map((slice) => slice.label),
    datasets: [
      {
        data: props.slices.map((slice) => slice.value),
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 6,
        hoverBorderWidth: 2,
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'doughnut'>>(() => {
  const defaults = createDoughnutOptions(isRtl.value)
  const extra = props.options

  return {
    ...defaults,
    ...extra,
    plugins: {
      ...defaults.plugins,
      ...extra?.plugins,
      legend: {
        ...defaults.plugins?.legend,
        ...extra?.plugins?.legend,
      },
      tooltip: {
        ...defaults.plugins?.tooltip,
        ...extra?.plugins?.tooltip,
      },
    },
  }
})

const resolvedCenterValue = computed(() => {
  if (props.centerValue != null) return props.centerValue
  const total = props.slices.reduce((sum, slice) => sum + slice.value, 0)
  return n(total)
})

const legendHidden = computed(() => props.options?.plugins?.legend?.display === false)
</script>

<template>
  <div
    ref="root"
    class="relative"
    :style="{ minHeight: `${height}px` }"
  >
    <div
      v-if="!isReady"
      class="flex items-center justify-center"
      :style="{ minHeight: `${height}px` }"
      aria-busy="true"
    >
      <div
        v-if="loadError"
        class="flex flex-col items-center gap-3 text-center"
      >
        <p class="text-sm text-foreground-muted">
          {{ $t('site.profile.charts.loadError') }}
        </p>
        <BaseButton variant="outline" size="sm" class="!rounded-xl" @click="retry">
          {{ $t('site.profile.charts.retry') }}
        </BaseButton>
      </div>
      <div
        v-else
        class="relative size-32 sm:size-36"
        :class="isLoading || !isReady ? 'opacity-100' : 'opacity-0'"
      >
        <div class="absolute inset-0 animate-pulse rounded-full border-[12px] border-ibbil-green/10" />
        <div class="absolute inset-5 animate-pulse rounded-full border-[8px] border-ibbil-gold/20" />
      </div>
    </div>

    <template v-else>
      <div class="relative" :style="{ height: `${height}px` }">
        <component
          :is="ChartCmp"
          :data="chartData"
          :options="chartOptions"
          role="img"
          :aria-label="centerLabel || undefined"
        />

        <div
          v-if="centerLabel || centerValue != null"
          class="pointer-events-none absolute inset-0 flex items-center justify-center"
          :class="legendHidden ? '' : 'pb-12'"
          aria-hidden="true"
        >
          <div class="text-center">
            <p class="text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl">
              {{ resolvedCenterValue }}
            </p>
            <p v-if="centerLabel" class="mt-0.5 text-xs font-medium text-foreground-muted">
              {{ centerLabel }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
