<script setup lang="ts">
import { CHART_COLORS } from '@shared/charts/colors'
import type { ChartSlice } from '@shared/charts/types'
import type { WalletDetails } from '@modules/checkout/types'

const props = defineProps<{
  wallet: WalletDetails | null
  loading?: boolean
}>()

const { t, n } = useI18n()

const activeView = ref<'amounts' | 'counts'>('amounts')

const viewTabs = computed(() => [
  { id: 'amounts', label: t('site.profile.charts.wallet.views.amounts') },
  { id: 'counts', label: t('site.profile.charts.wallet.views.counts') },
])

const amountSlices = computed<ChartSlice[]>(() => {
  const deposit = props.wallet?.totalDeposit ?? 0
  const withdraw = props.wallet?.totalWithdraw ?? 0
  if (deposit <= 0 && withdraw <= 0) return []

  return [
    {
      id: 'deposit',
      label: t('site.profile.wallet.summary.totalDeposit'),
      value: deposit,
      color: CHART_COLORS.green,
    },
    {
      id: 'withdraw',
      label: t('site.profile.wallet.summary.totalWithdraw'),
      value: withdraw,
      color: CHART_COLORS.gold,
    },
  ].filter((slice) => slice.value > 0)
})

const countSlices = computed<ChartSlice[]>(() => {
  const deposit = props.wallet?.depositCount ?? 0
  const withdraw = props.wallet?.withdrawCount ?? 0
  if (deposit <= 0 && withdraw <= 0) return []

  return [
    {
      id: 'depositCount',
      label: t('site.profile.wallet.summary.depositCount'),
      value: deposit,
      color: CHART_COLORS.green,
    },
    {
      id: 'withdrawCount',
      label: t('site.profile.wallet.summary.withdrawCount'),
      value: withdraw,
      color: CHART_COLORS.gold,
    },
  ].filter((slice) => slice.value > 0)
})

const activeSlices = computed(() =>
  activeView.value === 'amounts' ? amountSlices.value : countSlices.value,
)

const isEmpty = computed(
  () => !props.loading && amountSlices.value.length === 0 && countSlices.value.length === 0,
)

watch(
  [amountSlices, countSlices],
  () => {
    if (
      activeView.value === 'amounts' &&
      amountSlices.value.length === 0 &&
      countSlices.value.length > 0
    ) {
      activeView.value = 'counts'
    } else if (
      activeView.value === 'counts' &&
      countSlices.value.length === 0 &&
      amountSlices.value.length > 0
    ) {
      activeView.value = 'amounts'
    }
  },
  { immediate: true },
)

const centerTotal = computed(() => {
  if (activeView.value === 'amounts') {
    return n(activeSlices.value.reduce((sum, slice) => sum + slice.value, 0), {
      maximumFractionDigits: 0,
    })
  }
  return n(activeSlices.value.reduce((sum, slice) => sum + slice.value, 0))
})
</script>

<template>
  <BaseChartCard
    :title="t('site.profile.charts.wallet.title')"
    :description="t('site.profile.charts.wallet.description')"
    :loading="loading"
    :empty="isEmpty"
    :empty-title="t('site.profile.charts.wallet.emptyTitle')"
    :empty-description="t('site.profile.charts.wallet.emptyDescription')"
    empty-icon="lucide:wallet"
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
          :disabled="
            (tab.id === 'amounts' && amountSlices.length === 0) ||
              (tab.id === 'counts' && countSlices.length === 0)
          "
          class="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
          :class="
            activeView === tab.id
              ? 'bg-white text-ibbil-green shadow-sm dark:bg-surface-elevated'
              : 'text-foreground-muted hover:text-ibbil-green'
          "
          @click="activeView = tab.id as 'amounts' | 'counts'"
        >
          {{ tab.label }}
        </button>
      </div>
    </template>

    <div
      v-if="!loading && !isEmpty"
      class="grid gap-6 md:grid-cols-2 md:items-center"
    >
      <ClientOnly>
        <BaseDoughnutChart
          :key="activeView"
          :slices="activeSlices"
          :center-label="
            activeView === 'amounts'
              ? t('site.profile.charts.wallet.centerAmounts')
              : t('site.profile.charts.wallet.centerCounts')
          "
          :center-value="centerTotal"
          :height="260"
        />
        <template #fallback>
          <div class="flex min-h-[16.25rem] items-center justify-center">
            <div class="relative size-32">
              <div class="absolute inset-0 animate-pulse rounded-full border-[12px] border-ibbil-green/10" />
              <div class="absolute inset-4 animate-pulse rounded-full border-[8px] border-ibbil-gold/15" />
            </div>
          </div>
        </template>
      </ClientOnly>

      <ClientOnly>
        <BaseBarChart
          :key="`bar-${activeView}`"
          :slices="activeSlices"
          :height="260"
        />
        <template #fallback>
          <div class="flex min-h-[16.25rem] items-end justify-center gap-3 px-8">
            <div
              v-for="(h, i) in [72, 120]"
              :key="i"
              class="w-12 animate-pulse rounded-t-xl bg-ibbil-green/10"
              :style="{ height: `${h}px` }"
            />
          </div>
        </template>
      </ClientOnly>
    </div>
  </BaseChartCard>
</template>
