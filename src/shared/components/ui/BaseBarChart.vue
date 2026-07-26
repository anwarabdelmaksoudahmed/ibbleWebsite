<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import { CHART_COLORS, chartColors } from '@shared/charts/colors'
import { createBarOptions } from '@shared/charts/defaults'
import type { ChartSlice } from '@shared/charts/types'

const props = withDefaults(
  defineProps<{
    slices: ChartSlice[]
    height?: number
    options?: ChartOptions<'bar'>
  }>(),
  {
    height: 260,
  },
)

const { localeProperties } = useI18n()
const isRtl = computed(() => localeProperties.value.dir === 'rtl')

const { root, ChartCmp, isReady, isLoading, loadError, retry } = useLazyChart('bar')

const chartData = computed<ChartData<'bar'>>(() => {
  const colors = props.slices.map((slice, index) => slice.color ?? chartColors(props.slices.length)[index]!)

  return {
    labels: props.slices.map((slice) => slice.label),
    datasets: [
      {
        data: props.slices.map((slice) => slice.value),
        backgroundColor: colors,
        hoverBackgroundColor: colors.map((color) =>
          color === CHART_COLORS.green ? CHART_COLORS.greenSoft : CHART_COLORS.goldSoft,
        ),
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 56,
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'bar'>>(() => {
  const defaults = createBarOptions(isRtl.value)
  const extra = props.options

  return {
    ...defaults,
    ...extra,
    scales: {
      ...defaults.scales,
      ...extra?.scales,
    },
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
        class="flex h-36 w-full max-w-xs items-end justify-center gap-3 px-6"
        :class="{ 'opacity-70': isLoading }"
      >
        <div
          v-for="(h, i) in [48, 88, 64, 104]"
          :key="i"
          class="w-8 animate-pulse rounded-t-lg bg-ibbil-green/10"
          :style="{ height: `${h}px` }"
        />
      </div>
    </div>

    <div
      v-else
      :style="{ height: `${height}px` }"
    >
      <component
        :is="ChartCmp"
        :data="chartData"
        :options="chartOptions"
        role="img"
      />
    </div>
  </div>
</template>
