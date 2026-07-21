<script setup lang="ts">
const { t } = useI18n()

const {
  wallet,
  search,
  status,
  paymentSource,
  page,
  items,
  totalCount,
  totalPages,
  statusOptions,
  paymentSourceOptions,
  isWalletLoading,
  isLoading,
  isFetching,
  isError,
  isEmpty,
  setPage,
  resetFilters,
  refetch,
} = useProfileWallet()

const expandedId = ref<string | null>(null)

function toggleExpanded(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <BaseErrorState
    v-if="isError && items.length === 0 && !wallet"
    variant="brand"
    :title="t('site.profile.wallet.errorTitle')"
    :message="t('site.profile.wallet.errorDescription')"
    @retry="refetch"
  />

  <div v-else class="space-y-6 sm:space-y-7">
    <ProfileWalletSummaryCard :wallet="wallet" :loading="isWalletLoading" />

    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <h2 class="text-base font-bold text-ibbil-green sm:text-lg">
        {{ t('site.profile.wallet.transactionsTitle') }}
      </h2>
      <p class="text-sm text-foreground-muted">
        {{ t('site.profile.wallet.transactionsCount', { count: totalCount }) }}
      </p>
    </div>

    <ProfileWalletToolbar
      v-model:search="search"
      v-model:status="status"
      v-model:payment-source="paymentSource"
      :status-options="statusOptions"
      :payment-source-options="paymentSourceOptions"
      :disabled="isLoading && items.length === 0"
    />

    <div class="relative space-y-3">
      <div
        v-if="isFetching && items.length > 0"
        class="pointer-events-none absolute inset-x-0 -top-1 z-10 h-0.5 overflow-hidden rounded-full bg-ibbil-green/10"
        aria-hidden="true"
      >
        <div class="h-full w-1/3 animate-pulse bg-ibbil-gold/80" />
      </div>

      <template v-if="isLoading && items.length === 0">
        <div
          v-for="i in 3"
          :key="i"
          class="h-28 animate-pulse rounded-2xl border border-ibbil-green/10 bg-white dark:bg-surface-elevated"
        />
      </template>

      <BaseEmptyState
        v-else-if="isEmpty"
        variant="brand"
        icon="lucide:receipt"
        :title="t('site.profile.wallet.emptyTitle')"
        :description="t('site.profile.wallet.emptyDescription')"
      >
        <BaseButton variant="outline" size="sm" class="!rounded-xl" @click="resetFilters">
          {{ t('site.profile.wallet.clearFilters') }}
        </BaseButton>
      </BaseEmptyState>

      <template v-else>
        <ProfileWalletTransactionCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :expanded="expandedId === item.id"
          @toggle="toggleExpanded(item.id)"
        />
      </template>
    </div>

    <div
      v-if="totalPages > 1"
      class="flex justify-center pt-1"
    >
      <BasePagination
        :page="page"
        :total-pages="totalPages"
        :disabled="isFetching"
        @update:page="setPage"
      />
    </div>
  </div>
</template>
