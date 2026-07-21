<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()
const localePath = useLocalePath()

const {
  search,
  status,
  page,
  items,
  totalCount,
  totalPages,
  statusOptions,
  isLoading,
  isFetching,
  isError,
  isEmpty,
  setPage,
  resetFilters,
  refetch,
} = useProfileMarketplace()

const expandedId = ref<string | null>(null)

function toggleExpanded(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function goToStores() {
  return navigateTo(localePath(ROUTES.STORES.ROOT))
}
</script>

<template>
  <BaseErrorState
    v-if="isError && items.length === 0"
    variant="brand"
    :title="t('site.profile.marketplace.errorTitle')"
    :message="t('site.profile.marketplace.errorDescription')"
    @retry="refetch"
  />

  <div v-else class="space-y-6 sm:space-y-7">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <BaseStatCard
        class="w-full sm:max-w-[13rem]"
        :label="t('site.profile.marketplace.summaryLabel')"
        :value="totalCount"
        icon="lucide:shopping-bag"
        accent="green"
        :loading="isLoading"
      />
    </div>

    <ProfileMarketplaceToolbar
      v-model:search="search"
      v-model:status="status"
      :status-options="statusOptions"
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
          class="h-36 animate-pulse rounded-2xl border border-ibbil-green/10 bg-white dark:bg-surface-elevated"
        />
      </template>

      <BaseEmptyState
        v-else-if="isEmpty"
        variant="brand"
        icon="lucide:shopping-bag"
        :title="t('site.profile.marketplace.emptyTitle')"
        :description="t('site.profile.marketplace.emptyDescription')"
      >
        <div class="flex flex-wrap items-center justify-center gap-2">
          <BaseButton variant="outline" size="sm" class="!rounded-xl" @click="resetFilters">
            {{ t('site.profile.marketplace.clearFilters') }}
          </BaseButton>
          <BaseButton variant="brand" size="sm" class="!rounded-xl !px-4 !py-2.5" @click="goToStores">
            <Icon name="lucide:store" class="size-4" aria-hidden="true" />
            {{ t('site.profile.marketplace.browseStores') }}
          </BaseButton>
        </div>
      </BaseEmptyState>

      <template v-else>
        <ProfileOrderCard
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
