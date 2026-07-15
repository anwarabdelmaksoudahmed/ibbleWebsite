<script setup lang="ts">
import StoreCard from '@modules/stores/components/StoreCard.vue'
import StoresToolbar from '@modules/stores/components/StoresToolbar.vue'
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'
import type { MarketplaceCardVariant } from '@shared/types/marketplace-card'
import type { SelectOption } from '@shared/components/ui/BaseSelect.vue'
import type { StoreCategory } from '@modules/stores/types'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

const props = defineProps<{
  category: StoreCategory
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const view = ref<MarketplaceCardVariant>('list')

const {
  stores,
  isLoading,
  errorMessage,
  refresh,
  country,
  city,
  order,
  page,
  totalPages,
  applyFilters,
  setPage,
} = useCategoryStores(() => props.category.slug)

const sortOptions = computed<SelectOption[]>(() => [
  { label: t('site.stores.filters.sortDesc'), value: 'DESC' },
  { label: t('site.stores.filters.sortAsc'), value: 'ASC' },
])

const breadcrumbItems = computed(() => [
  { label: t('site.nav.home'), to: localePath('/') },
  { label: t('site.nav.stores'), to: localePath(STORES_ROUTES.ROOT) },
  { label: props.category.name },
])

const hasStores = computed(() => stores.value.length > 0)
/** First fetch / filter with no rows yet — full loader until API responds */
const showFetchLoader = computed(() => isLoading.value && !hasStores.value)
/** Refetch while previous rows are still on screen */
const showRefreshOverlay = computed(() => isLoading.value && hasStores.value)

function onSortUpdate(value: string) {
  order.value = value === 'ASC' ? 'ASC' : 'DESC'
}

function clearFiltersAndSearch() {
  country.value = ''
  city.value = ''
  order.value = 'DESC'
  applyFilters()
}
</script>

<template>
  <section class="relative min-h-[60vh] overflow-hidden bg-[#f4f6f5]">
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.3]"
      aria-hidden="true"
      style="
        background-image: radial-gradient(rgba(45, 83, 61, 0.06) 1px, transparent 1px);
        background-size: 22px 22px;
      "
    />

    <div class="relative mx-auto max-w-7xl px-4 py-[12px] ">
      <BaseBreadcrumb :items="breadcrumbItems" class="mb-6" />

    

      <StoresToolbar
        v-model:view="view"
        v-model:country="country"
        v-model:city="city"
        :sort="order"
        :sort-options="sortOptions"
        class="mb-6"
        @update:sort="onSortUpdate"
        @search="applyFilters()"
      />

      <MarketplaceFetchLoader v-if="showFetchLoader" />

      <div v-else-if="errorMessage" class="rounded-2xl border border-ibbil-green/10 bg-white">
        <BaseErrorState
          variant="brand"
          :title="t('site.stores.storesErrorTitle')"
          :message="errorMessage"
          :retryable="true"
          @retry="refresh()"
        >
          <NuxtLinkLocale
            :to="STORES_ROUTES.ROOT"
            class="inline-flex items-center gap-1.5 rounded-lg border border-ibbil-green/20 bg-white px-4 py-2 text-sm font-medium text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06]"
          >
            {{ t('site.stores.backToCategories') }}
          </NuxtLinkLocale>
        </BaseErrorState>
      </div>

      <div
        v-else-if="!hasStores"
        class="rounded-2xl border border-ibbil-green/10 bg-white"
      >
        <BaseEmptyState
          variant="brand"
          :title="t('site.stores.storesEmptyTitle')"
          :description="t('site.stores.storesEmptyDescription')"
          icon="lucide:store"
        >
          <div class="flex flex-wrap items-center justify-center gap-2">
            <BaseButton
              variant="outline"
              class="!border-ibbil-green/20 !text-ibbil-green hover:!bg-ibbil-green/[0.06]"
              @click="clearFiltersAndSearch"
            >
              <Icon name="lucide:filter-x" class="size-4" aria-hidden="true" />
              {{ t('site.stores.clearFilters') }}
            </BaseButton>
            <NuxtLinkLocale
              :to="STORES_ROUTES.ROOT"
              class="inline-flex items-center gap-1.5 rounded-lg bg-ibbil-green px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-ibbil-green-dark"
            >
              {{ t('site.stores.backToCategories') }}
            </NuxtLinkLocale>
          </div>
        </BaseEmptyState>
      </div>

      <div v-else class="relative">
        <div
          v-if="showRefreshOverlay"
          class="absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-[#f4f6f5]/70 pt-20 backdrop-blur-[1px]"
          aria-live="polite"
        >
          <BaseLoader block size="lg" tone="brand" show-label class="!py-0" />
        </div>

        <ul
          role="list"
          :class="[
            view === 'grid'
              ? 'grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5'
              : 'flex flex-col gap-3 sm:gap-4',
            showRefreshOverlay ? 'pointer-events-none opacity-60' : undefined,
          ]"
        >
          <li v-for="(store, index) in stores" :key="store.id">
            <StoreCard
              :store="store"
              :category-slug="category.slug"
              :variant="view"
              :index="index"
              :animate="!showRefreshOverlay"
            />
          </li>
        </ul>

        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <BasePagination
            :page="page"
            :total-pages="totalPages"
            :disabled="isLoading"
            @update:page="setPage"
          />
        </div>
      </div>    </div>
  </section>
</template>
