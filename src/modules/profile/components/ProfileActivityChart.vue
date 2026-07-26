<script setup lang="ts">
import { CHART_COLORS, chartColorAt } from '@shared/charts/colors'
import type { ChartSlice } from '@shared/charts/types'
import type { ProfileStat, ProfileStatKey } from '@modules/profile/types'

const ACTIVITY_KEYS: ProfileStatKey[] = [
  'favorites',
  'insurance',
  'transportation',
  'veterinary',
]

const props = defineProps<{
  stats: ProfileStat[]
  loading?: boolean
  labelFor: (key: ProfileStatKey) => string
}>()

const { t, n } = useI18n()

const activeView = ref<'doughnut' | 'bar'>('doughnut')

const viewTabs = computed(() => [
  { id: 'doughnut', label: t('site.profile.charts.views.doughnut') },
  { id: 'bar', label: t('site.profile.charts.views.bar') },
])

const slices = computed<ChartSlice[]>(() =>
  props.stats
    .filter((stat) => ACTIVITY_KEYS.includes(stat.key) && stat.value != null && stat.value > 0)
    .map((stat, index) => ({
      id: stat.key,
      label: props.labelFor(stat.key),
      value: stat.value as number,
      color:
        stat.accent === 'gold'
          ? CHART_COLORS.gold
          : chartColorAt(index),
    })),
)

const isEmpty = computed(() => !props.loading && slices.value.length === 0)

const total = computed(() => slices.value.reduce((sum, slice) => sum + slice.value, 0))
</script>

<template>
  <BaseChartCard
    :title="t('site.profile.charts.activity.title')"
    :description="t('site.profile.charts.activity.description')"
    :loading="loading"
    :empty="isEmpty"
    :empty-title="t('site.profile.charts.activity.emptyTitle')"
    :empty-description="t('site.profile.charts.activity.emptyDescription')"
    empty-icon="lucide:chart-pie"
  >
    <template #actions>
      <div
        v-if="!loading && !isEmpty"
        class="inline-flex rounded-xl border border-ibbil-green/10 bg-ibbil-green/[0.03] p-1"
        role="tablist"
        :aria-label="t('site.profile.charts.views.label')"
      >
        <button
          v-for="tab in viewTabs"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="activeView === tab.id"
          class="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3"
          :class="
            activeView === tab.id
              ? 'bg-white text-ibbil-green shadow-sm dark:bg-surface-elevated'
              : 'text-foreground-muted hover:text-ibbil-green'
          "
          @click="activeView = tab.id as 'doughnut' | 'bar'"
        >
          {{ tab.label }}
        </button>
      </div>
    </template>

    <div
      v-if="!loading && !isEmpty"
      class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(12rem,0.8fr)] lg:items-center"
    >
      <ClientOnly>
        <BaseDoughnutChart
          v-if="activeView === 'doughnut'"
          :slices="slices"
          :center-label="t('site.profile.charts.activity.centerLabel')"
          :center-value="n(total)"
          :height="280"
          :options="{ plugins: { legend: { display: false } } }"
        />
        <BaseBarChart
          v-else
          :slices="slices"
          :height="280"
        />
        <template #fallback>
          <div class="flex min-h-[17.5rem] items-center justify-center">
            <div class="relative size-36">
              <div class="absolute inset-0 animate-pulse rounded-full border-[14px] border-ibbil-green/10" />
              <div class="absolute inset-5 animate-pulse rounded-full border-[10px] border-ibbil-gold/15" />
            </div>
          </div>
        </template>
      </ClientOnly>

      <ul class="space-y-2.5" :aria-label="t('site.profile.charts.activity.legendLabel')">
        <li
          v-for="slice in slices"
          :key="slice.id"
          class="flex items-center justify-between gap-3 rounded-xl border border-ibbil-green/8 bg-ibbil-green/[0.025] px-3.5 py-2.5"
        >
          <div class="flex min-w-0 items-center gap-2.5">
            <span
              class="size-2.5 shrink-0 rounded-full"
              :style="{ backgroundColor: slice.color }"
              aria-hidden="true"
            />
            <span class="truncate text-sm font-medium text-foreground">
              {{ slice.label }}
            </span>
          </div>
          <span class="shrink-0 text-sm font-bold text-ibbil-green tabular-nums">
            {{ n(slice.value) }}
          </span>
        </li>
      </ul>
    </div>
  </BaseChartCard>
</template>
