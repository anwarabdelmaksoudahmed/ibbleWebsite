<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()
const localePath = useLocalePath()

const {
  search,
  searchEnabled,
  company,
  status,
  page,
  items,
  totalCount,
  totalPages,
  statusOptions,
  companySelectOptions,
  isLoading,
  isFetching,
  isError,
  isEmpty,
  setPage,
  resetFilters,
  refetch,
} = useProfileInsurance()

const expandedId = ref<number | null>(null)

function toggleExpanded(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

function goToRegister() {
  return navigateTo(localePath(ROUTES.INSURANCE_REGISTER))
}
</script>

<template>
  <BaseErrorState
    v-if="isError && items.length === 0"
    variant="brand"
    :title="t('site.profile.insurance.errorTitle')"
    :message="t('site.profile.insurance.errorDescription')"
    @retry="refetch"
  />

  <div v-else class="space-y-6 sm:space-y-7">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <BaseStatCard
        class="w-full sm:max-w-[13rem]"
        :label="t('site.profile.insurance.summaryLabel')"
        :value="totalCount"
        icon="lucide:shield-check"
        accent="green"
        :loading="isLoading"
      />
    </div>

    <ProfileInsuranceToolbar
      v-model:search="search"
      v-model:company="company"
      v-model:status="status"
      :company-options="companySelectOptions"
      :status-options="statusOptions"
      :search-enabled="searchEnabled"
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
        icon="lucide:shield-off"
        :title="t('site.profile.insurance.emptyTitle')"
        :description="t('site.profile.insurance.emptyDescription')"
      >
        <div class="flex flex-wrap items-center justify-center gap-2">
          <BaseButton variant="outline" size="sm" class="!rounded-xl" @click="resetFilters">
            {{ t('site.profile.insurance.clearFilters') }}
          </BaseButton>
          <BaseButton variant="brand" size="sm" class="!rounded-xl !px-4 !py-2.5" @click="goToRegister">
            <Icon name="lucide:plus" class="size-4" aria-hidden="true" />
            {{ t('site.profile.insurance.insureNow') }}
          </BaseButton>
        </div>
      </BaseEmptyState>

      <template v-else>
        <ProfileInsuranceCard
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
