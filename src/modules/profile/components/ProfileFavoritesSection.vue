<script setup lang="ts">
import StoreProductCard from '@modules/stores/components/StoreProductCard.vue'
import { ROUTES } from '@shared/constants/routes'
import { STORES_ROUTES } from '@modules/stores/constants/routes'
import type { WishlistItem } from '@modules/wishlist/types'

const { t } = useI18n()
const localePath = useLocalePath()

const {
  search,
  items,
  totalCount,
  isLoading,
  isFetching,
  isError,
  isEmpty,
  hasActiveSearch,
  resetFilters,
  refetch,
} = useProfileFavorites()

function productTo(item: WishlistItem) {
  if (!item.categorySlug || !item.storeSlug) return undefined
  return localePath(STORES_ROUTES.PRODUCT(item.categorySlug, item.storeSlug, item.productId))
}

function goToStores() {
  return navigateTo(localePath(ROUTES.STORES.ROOT))
}
</script>

<template>
  <BaseErrorState
    v-if="isError && items.length === 0 && !hasActiveSearch"
    variant="brand"
    :title="t('site.profile.favorites.errorTitle')"
    :message="t('site.profile.favorites.errorDescription')"
    @retry="refetch"
  />

  <div v-else class="space-y-6 sm:space-y-7">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <BaseStatCard
        class="w-full sm:max-w-[13rem]"
        :label="t('site.profile.favorites.summaryLabel')"
        :value="totalCount"
        icon="lucide:heart"
        accent="gold"
        :loading="isLoading"
      />
    </div>

    <ProfileFavoritesToolbar
      v-model:search="search"
      :disabled="isLoading && items.length === 0 && !hasActiveSearch"
    />

    <div class="relative space-y-3">
      <div
        v-if="isFetching && items.length > 0"
        class="pointer-events-none absolute inset-x-0 -top-1 z-10 h-0.5 overflow-hidden rounded-full bg-ibbil-green/10"
        aria-hidden="true"
      >
        <div class="h-full w-1/3 animate-pulse bg-ibbil-gold/80" />
      </div>

      <ul
        v-if="isLoading && items.length === 0 && !hasActiveSearch"
        role="list"
        class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        aria-hidden="true"
      >
        <li
          v-for="i in 6"
          :key="i"
          class="h-72 animate-pulse rounded-2xl border border-ibbil-green/10 bg-white dark:bg-surface-elevated"
        />
      </ul>

      <BaseEmptyState
        v-else-if="isEmpty"
        variant="brand"
        icon="lucide:heart-off"
        :title="
          hasActiveSearch
            ? t('site.profile.favorites.emptySearchTitle')
            : t('site.profile.favorites.emptyTitle')
        "
        :description="
          hasActiveSearch
            ? t('site.profile.favorites.emptySearchDescription')
            : t('site.profile.favorites.emptyDescription')
        "
      >
        <div class="flex flex-wrap items-center justify-center gap-2">
          <BaseButton
            v-if="hasActiveSearch"
            variant="outline"
            size="sm"
            class="!rounded-xl"
            @click="resetFilters"
          >
            {{ t('site.profile.favorites.clearSearch') }}
          </BaseButton>
          <BaseButton
            variant="brand"
            size="sm"
            class="!rounded-xl !px-4 !py-2.5"
            @click="goToStores"
          >
            <Icon name="lucide:store" class="size-4" aria-hidden="true" />
            {{ t('site.profile.favorites.browseStores') }}
          </BaseButton>
        </div>
      </BaseEmptyState>

      <ul
        v-else
        role="list"
        class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
      >
        <li v-for="(item, index) in items" :key="item.productId">
          <StoreProductCard
            :product="item.product"
            :store-id="item.product.storeId"
            :to="productTo(item)"
            :index="index"
            animate
          />
        </li>
      </ul>
    </div>
  </div>
</template>
