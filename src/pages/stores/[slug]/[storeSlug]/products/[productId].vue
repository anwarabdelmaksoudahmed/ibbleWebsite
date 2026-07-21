<script setup lang="ts">
import StoreProductDetailSection from '@modules/stores/components/StoreProductDetailSection.vue'
import StoreProductDetailSkeleton from '@modules/stores/components/StoreProductDetailSkeleton.vue'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

definePageMeta({ layout: 'site' })

const { t } = useI18n()
const route = useRoute()

const storeSlug = computed(() => {
  const raw = route.params.storeSlug
  const value = Array.isArray(raw) ? raw[0] : raw
  return value ? decodeURIComponent(String(value)) : ''
})

const categorySlug = computed(() => {
  const raw = route.params.slug
  const value = Array.isArray(raw) ? raw[0] : raw
  return value ? decodeURIComponent(String(value)) : ''
})

const productId = computed(() => {
  const raw = route.params.productId
  const value = Array.isArray(raw) ? raw[0] : raw
  return value ? decodeURIComponent(String(value)) : ''
})

const {
  store,
  isLoading: storeLoading,
  errorMessage: storeError,
  isNotFound: storeNotFound,
  refresh: refreshStore,
} = useStoreProfile(storeSlug)

const {
  product,
  isLoading: productLoading,
  errorMessage: productError,
  isNotFound: productNotFound,
  refresh: refreshProduct,
} = useStoreProductDetail(productId)

const isPageLoading = computed(
  () => storeLoading.value || productLoading.value,
)

const storeProductMismatch = computed(() => {
  if (!store.value || !product.value) return false
  return product.value.storeId && store.value.id && product.value.storeId !== store.value.id
})

const isNotFound = computed(
  () =>
    !isPageLoading.value &&
    (storeNotFound.value ||
      productNotFound.value ||
      storeProductMismatch.value ||
      (!store.value && !storeError.value) ||
      (!product.value && !productError.value)),
)

const storeBackPath = computed(() => {
  const slug = store.value?.categorySlug || categorySlug.value
  const resolvedStoreSlug = store.value?.slug || storeSlug.value
  return slug && resolvedStoreSlug
    ? STORES_ROUTES.STORE(slug, resolvedStoreSlug)
    : STORES_ROUTES.ROOT
})

useSeoMeta({
  title: () =>
    product.value
      ? t('site.stores.productDetail.seoTitle', {
          name: product.value.name,
          store: store.value?.name ?? '',
        })
      : t('site.stores.seoTitle'),
  description: () =>
    product.value?.description ||
    product.value?.content ||
    t('site.stores.productDetail.seoDescription'),
  ogTitle: () =>
    product.value
      ? t('site.stores.productDetail.seoTitle', {
          name: product.value.name,
          store: store.value?.name ?? '',
        })
      : t('site.stores.seoTitle'),
  ogDescription: () =>
    product.value?.description ||
    product.value?.content ||
    t('site.stores.productDetail.seoDescription'),
  ogImage: () => product.value?.image || store.value?.logo || undefined,
})

useHead(() => {
  if (!product.value || !store.value) return {}

  return {
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.value.name,
          description: product.value.description || product.value.content,
          image: product.value.images.length ? product.value.images : product.value.image,
          sku: product.value.sku || undefined,
          offers: {
            '@type': 'Offer',
            price: product.value.finalPrice,
            priceCurrency: 'SAR',
            availability:
              product.value.quantity > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          },
          brand: {
            '@type': 'Brand',
            name: store.value.name,
          },
        }),
      },
    ],
  }
})

useCart()
useWishlist()
</script>

<template>
  <div>
    <div
      v-if="isPageLoading"
      class="min-h-[60vh] bg-[#f4f6f5] px-4 py-10 dark:bg-surface-muted sm:px-6 sm:py-12"
    >
      <div class="mx-auto max-w-7xl">
        <StoreProductDetailSkeleton />
      </div>
    </div>

    <div
      v-else-if="isNotFound"
      class="min-h-[50vh] bg-[#f4f6f5] px-4 py-16 dark:bg-surface-muted"
    >
      <div class="mx-auto max-w-lg rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated">
        <BaseErrorState
          variant="brand"
          :title="t('site.stores.productDetail.errorTitle')"
          :message="storeError || productError || t('site.stores.productDetail.errorTitle')"
          :retryable="true"
          @retry="storeError ? refreshStore() : refreshProduct()"
        >
          <NuxtLinkLocale
            :to="storeBackPath"
            class="inline-flex items-center gap-1.5 rounded-lg border border-ibbil-green/20 bg-white px-4 py-2 text-sm font-medium text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06] dark:bg-surface-elevated"
          >
            {{ t('site.stores.productDetail.backToStore') }}
          </NuxtLinkLocale>
        </BaseErrorState>
      </div>
    </div>

    <div
      v-else-if="(storeError && !store) || (productError && !product)"
      class="min-h-[50vh] bg-[#f4f6f5] px-4 py-16 dark:bg-surface-muted"
    >
      <div class="mx-auto max-w-lg rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated">
        <BaseErrorState
          variant="brand"
          :title="t('site.stores.productDetail.errorTitle')"
          :message="storeError || productError || ''"
          :retryable="true"
          @retry="storeError ? refreshStore() : refreshProduct()"
        >
          <NuxtLinkLocale
            :to="storeBackPath"
            class="inline-flex items-center gap-1.5 rounded-lg border border-ibbil-green/20 bg-white px-4 py-2 text-sm font-medium text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06] dark:bg-surface-elevated"
          >
            {{ t('site.stores.productDetail.backToStore') }}
          </NuxtLinkLocale>
        </BaseErrorState>
      </div>
    </div>

    <StoreProductDetailSection
      v-else-if="store && product"
      :key="product.id"
      :store="store"
      :product="product"
    />
  </div>
</template>
