<script setup lang="ts">
import StoreHero from '@modules/stores/components/StoreHero.vue'
import StoreStats from '@modules/stores/components/StoreStats.vue'
import StoreAbout from '@modules/stores/components/StoreAbout.vue'
import StoreProductCategories from '@modules/stores/components/StoreProductCategories.vue'
import StoreProductsGrid from '@modules/stores/components/StoreProductsGrid.vue'
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'
import type { StoreProfile } from '@modules/stores/types'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

const props = defineProps<{
  store: StoreProfile
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const {
  categories,
  isLoading: categoriesLoading,
  errorMessage: categoriesError,
  refresh: refreshCategories,
} = useStoreProductCategories(() => props.store.slug)

const {
  products,
  isLoading: productsLoading,
  errorMessage: productsError,
  refresh: refreshProducts,
  categoryId,
  page,
  totalPages,
  setCategory,
  setPage,
} = useStoreProducts(() => props.store.slug)

// Single shared subscribers for this page — product cards reuse the same query keys.
useCart()
useWishlist()

const breadcrumbItems = computed(() => {
  const items: { label: string; to?: string }[] = [
    { label: t('site.nav.home'), to: localePath('/') },
    { label: t('site.nav.stores'), to: localePath(STORES_ROUTES.ROOT) },
  ]

  if (props.store.categorySlug && props.store.categoryName) {
    items.push({
      label: props.store.categoryName,
      to: localePath(STORES_ROUTES.CATEGORY(props.store.categorySlug)),
    })
  }

  items.push({ label: props.store.name })
  return items
})

const hasProducts = computed(() => products.value.length > 0)
const showProductsLoader = computed(() => productsLoading.value && !hasProducts.value)
const showProductsOverlay = computed(() => productsLoading.value && hasProducts.value)

function onCategoryUpdate(id: string) {
  setCategory(id)
}
</script>

<template>
  <section class="relative min-h-[60vh] bg-[#f4f6f5] dark:bg-surface-muted">
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.3] dark:opacity-[0.15]"
      aria-hidden="true"
      style="
        background-image: radial-gradient(rgba(45, 83, 61, 0.06) 1px, transparent 1px);
        background-size: 22px 22px;
      "
    />

    <div class="relative mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-12 lg:px-6 lg:pt-14">
      <BaseBreadcrumb :items="breadcrumbItems" />
    </div>

    <StoreHero :store="store" />

    <div class="relative mx-auto max-w-7xl space-y-6 px-4 pb-10 pt-2 sm:space-y-8 sm:px-6 sm:pb-12 sm:pt-3 lg:px-6 lg:pb-14">
      <StoreStats :store="store" />
      <StoreAbout :store="store" />

      <StoreProductCategories
        :categories="categories ?? []"
        :model-value="categoryId"
        :loading="categoriesLoading"
        @update:model-value="onCategoryUpdate"
      />

      <div
        v-if="categoriesError"
        class="rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated"
      >
        <BaseErrorState
          variant="brand"
          :title="t('site.stores.profile.categoriesErrorTitle')"
          :message="categoriesError"
          :retryable="true"
          @retry="refreshCategories()"
        />
      </div>

      <section :aria-label="t('site.stores.profile.productsTitle')">
        <div class="mb-4 flex items-end justify-between gap-3 sm:mb-5">
          <h2 class="text-lg font-extrabold tracking-tight text-ibbil-green sm:text-xl">
            {{ t('site.stores.profile.productsTitle') }}
          </h2>
        </div>

        <MarketplaceFetchLoader v-if="showProductsLoader" />

        <div
          v-else-if="productsError"
          class="rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated"
        >
          <BaseErrorState
            variant="brand"
            :title="t('site.stores.profile.productsErrorTitle')"
            :message="productsError"
            :retryable="true"
            @retry="refreshProducts()"
          />
        </div>

        <div
          v-else-if="!hasProducts"
          class="rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated"
        >
          <BaseEmptyState
            variant="brand"
            :title="t('site.stores.profile.productsEmptyTitle')"
            :description="t('site.stores.profile.productsEmptyDescription')"
            icon="lucide:package-open"
          >
            <BaseButton
              v-if="categoryId"
              variant="outline"
              class="!border-ibbil-green/20 !text-ibbil-green hover:!bg-ibbil-green/[0.06]"
              @click="setCategory('')"
            >
              <Icon name="lucide:filter-x" class="size-4" aria-hidden="true" />
              {{ t('site.stores.profile.clearCategoryFilter') }}
            </BaseButton>
          </BaseEmptyState>
        </div>

        <div v-else class="relative">
          <div
            v-if="showProductsOverlay"
            class="absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-[#f4f6f5]/70 pt-16 backdrop-blur-[1px] dark:bg-surface-muted/70"
            aria-live="polite"
          >
            <BaseLoader block size="lg" tone="brand" show-label class="!py-0" />
          </div>

          <StoreProductsGrid
            :products="products"
            :store-id="store.id"
            :loading="productsLoading"
            :animate="!showProductsOverlay"
          />

          <div v-if="totalPages > 1" class="mt-8 flex justify-center">
            <BasePagination
              :page="page"
              :total-pages="totalPages"
              :disabled="productsLoading"
              @update:page="setPage"
            />
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
