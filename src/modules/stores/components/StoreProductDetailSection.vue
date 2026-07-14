<script setup lang="ts">
import StoreHero from '@modules/stores/components/StoreHero.vue'
import StoreProductsGrid from '@modules/stores/components/StoreProductsGrid.vue'
import CartQuantityControl from '@modules/cart/components/CartQuantityControl.vue'
import type { StoreProductDetail, StoreProfile } from '@modules/stores/types'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

const props = defineProps<{
  store: StoreProfile
  product: StoreProductDetail
}>()

const { t, n } = useI18n()
const localePath = useLocalePath()

const { addToCart, isInCart, isCartMutating } = useCart()
const { toggleWishlist, isFavourite, isWishlistMutating } = useWishlist()

const quantity = ref(1)
const descriptionExpanded = ref(false)

const storePath = computed(() =>
  localePath(STORES_ROUTES.STORE(props.store.categorySlug, props.store.slug)),
)

const {
  products: storeProducts,
  isLoading: storeProductsLoading,
} = useStoreProducts(() => props.store.slug)

const relatedProducts = computed(() => {
  if (props.product.relatedProducts.length > 0) {
    return props.product.relatedProducts.slice(0, 4)
  }

  return storeProducts.value
    .filter((item) => item.id !== props.product.id)
    .slice(0, 4)
})

const showRelatedProducts = computed(
  () => relatedProducts.value.length > 0 || storeProductsLoading.value,
)

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

  items.push({
    label: props.store.name,
    to: localePath(storePath.value),
  })
  items.push({ label: props.product.name })

  return items
})

const hasDiscount = computed(() => props.product.finalPrice < props.product.price)

const formattedPrice = computed(() => n(props.product.finalPrice))

const formattedOriginal = computed(() => n(props.product.price))

const discountPercent = computed(() => {
  if (!hasDiscount.value || props.product.price <= 0) return 0
  const amount =
    props.product.discount > 0
      ? props.product.discount
      : props.product.price - props.product.finalPrice
  return Math.round((amount / props.product.price) * 100)
})

const ratingStars = computed(() => {
  if (props.product.rating == null || props.product.rating <= 0) return []
  const full = Math.round(Math.min(5, Math.max(0, props.product.rating)))
  return Array.from({ length: 5 }, (_, i) => i < full)
})

const favourite = computed(() => isFavourite(props.product.id))
const inCart = computed(() => isInCart(props.product.id))
const wishlistLoading = computed(() => isWishlistMutating(props.product.id))
const cartLoading = computed(() => isCartMutating(props.product.id))

const maxQuantity = computed(() => Math.max(1, props.product.quantity || 1))

const canIncrease = computed(() => quantity.value < maxQuantity.value)

const descriptionLong = computed(() => props.product.description.length > 160)

const wishlistLabel = computed(() =>
  favourite.value
    ? t('site.commerce.wishlist.remove')
    : t('site.commerce.wishlist.add'),
)

const heartPulse = ref(false)

function toggleDescription() {
  descriptionExpanded.value = !descriptionExpanded.value
}

function onIncreaseQuantity() {
  if (canIncrease.value) quantity.value += 1
}

function onDecreaseQuantity() {
  if (quantity.value > 1) quantity.value -= 1
}

async function onToggleWishlist() {
  const wasFavourite = favourite.value
  await toggleWishlist(props.product.id)
  if (!wasFavourite) {
    heartPulse.value = true
    window.setTimeout(() => {
      heartPulse.value = false
    }, 450)
  }
}

async function onAddToCart() {
  if (inCart.value || cartLoading.value) return
  await addToCart({
    storeId: props.product.storeId || props.store.id,
    productId: props.product.id,
    quantity: quantity.value,
  })
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

    <StoreHero :store="store" />

    <div class="relative mx-auto max-w-7xl space-y-6 px-4 sm:space-y-8 sm:px-6">
      <BaseBreadcrumb :items="breadcrumbItems" />

      <div class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_8px_28px_-18px_rgba(45,83,61,0.3)] dark:border-ibbil-green/20 dark:bg-surface-elevated">
       
        <div class="grid gap-6 p-4 sm:gap-8 sm:p-6 lg:grid-cols-2 lg:items-start">
          <BaseImageGallery
            :images="product.images.length ? product.images : [product.image].filter(Boolean)"
            :alt="product.name"
          />

          <div class="flex flex-col gap-4 sm:gap-5">
            <p
              v-if="product.categoryName"
              class="text-xs font-semibold tracking-wide text-ibbil-gold"
            >
              {{ product.categoryName }}
            </p>

            <h1 class="text-2xl font-extrabold leading-tight text-ibbil-green sm:text-3xl">
              {{ product.name }}
            </h1>

            <div v-if="product.description" class="space-y-1">
              <p
                class="text-sm leading-relaxed text-foreground-muted sm:text-base"
                :class="descriptionExpanded ? undefined : 'line-clamp-3'"
              >
                {{ product.description }}
              </p>
              <button
                v-if="descriptionLong"
                type="button"
                class="text-sm font-semibold text-ibbil-green underline-offset-2 hover:underline"
                @click="toggleDescription"
              >
                {{
                  descriptionExpanded
                    ? t('site.stores.productDetail.showLess')
                    : t('site.stores.productDetail.showMore')
                }}
              </button>
            </div>

            <div
              v-if="ratingStars.length"
              class="flex items-center gap-2"
              :aria-label="t('site.stores.profile.rating', { rating: product.rating })"
            >
              <span class="inline-flex items-center gap-0.5" aria-hidden="true">
                <Icon
                  v-for="(filled, i) in ratingStars"
                  :key="i"
                  name="lucide:star"
                  class="size-4"
                  :class="filled ? 'fill-ibbil-gold text-ibbil-gold' : 'text-ibbil-green/20'"
                />
              </span>
            </div>

            <div class="space-y-1 rounded-xl bg-ibbil-green/[0.04] px-4 py-3 dark:bg-ibbil-green/[0.08]">
              <p class="text-xs font-medium text-foreground-muted">
                {{ t('site.stores.productDetail.currentPrice') }}
              </p>
              <div class="flex flex-wrap items-baseline gap-2">
                <span class="text-2xl font-extrabold text-ibbil-green sm:text-3xl">
                  {{ formattedPrice }}
                  <span class="text-base font-semibold">{{ t('site.stores.profile.currency') }}</span>
                </span>
                <span
                  v-if="hasDiscount"
                  class="text-sm text-foreground-muted line-through"
                >
                  {{ formattedOriginal }}
                </span>
                <span
                  v-if="hasDiscount && discountPercent > 0"
                  class="rounded-md bg-ibbil-gold px-2 py-0.5 text-xs font-bold text-ibbil-green-dark"
                >
                  -{{ discountPercent }}%
                </span>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <CartQuantityControl
                v-if="!inCart"
                :quantity="quantity"
                :disabled="inCart"
                @increase="onIncreaseQuantity"
                @decrease="onDecreaseQuantity"
              />
              <p
                v-if="!inCart && product.quantity > 0"
                class="text-xs text-foreground-muted"
              >
                {{ t('site.stores.productDetail.inStock', { count: n(product.quantity) }) }}
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <BaseButton
                v-if="!inCart"
                variant="primary"
                size="lg"
                class="flex-1 !bg-ibbil-green hover:!bg-ibbil-green-dark"
                :loading="cartLoading"
                :disabled="cartLoading || !product.storeId"
                @click="onAddToCart"
              >
                <Icon name="lucide:shopping-cart" class="size-5" aria-hidden="true" />
                {{ t('site.commerce.cart.add') }}
              </BaseButton>

              <div
                v-else
                role="status"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ibbil-green px-4 py-3 text-sm font-semibold text-white"
              >
                <Icon name="lucide:check" class="size-5" aria-hidden="true" />
                {{ t('site.commerce.cart.inCart') }}
              </div>

              <BaseButton
                variant="outline"
                size="lg"
                class="flex-1 !border-ibbil-green/25 !text-ibbil-green hover:!border-ibbil-gold/50 hover:!bg-ibbil-green/[0.06]"
                :loading="wishlistLoading"
                :disabled="wishlistLoading"
                @click="onToggleWishlist"
              >
                <Icon
                  name="lucide:heart"
                  class="size-5 transition-transform duration-300"
                  :class="[
                    favourite ? 'fill-red-500 text-red-500' : 'fill-none',
                    heartPulse ? 'store-heart-pulse' : '',
                  ]"
                  aria-hidden="true"
                />
                {{ wishlistLabel }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <section
        v-if="product.content"
        class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white p-5 shadow-[0_8px_28px_-18px_rgba(45,83,61,0.25)] dark:border-ibbil-green/20 dark:bg-surface-elevated sm:p-6"
        :aria-label="t('site.stores.productDetail.specifications')"
      >
        <h2 class="mb-4 text-lg font-extrabold text-ibbil-green sm:text-xl">
          {{ t('site.stores.productDetail.specifications') }}
        </h2>
        <div class="prose prose-sm max-w-none text-foreground-muted sm:prose-base">
          <p class="whitespace-pre-line leading-relaxed">
            {{ product.content }}
          </p>
        </div>
      </section>

      <section
        v-if="showRelatedProducts"
        :aria-label="t('site.stores.productDetail.relatedProducts')"
      >
        <div class="mb-4 flex items-end justify-between gap-3 sm:mb-5">
          <h2 class="text-lg font-extrabold tracking-tight text-ibbil-green sm:text-xl">
            {{ t('site.stores.productDetail.relatedProducts') }}
          </h2>
        </div>

        <MarketplaceFetchLoader v-if="storeProductsLoading && !relatedProducts.length" />

        <StoreProductsGrid
          v-else-if="relatedProducts.length"
          :products="relatedProducts"
          :store-id="store.id"
          :category-slug="store.categorySlug"
          :store-slug="store.slug"
        />
      </section>
    </div>
  </section>
</template>

<style scoped>
.store-heart-pulse {
  animation: store-heart-pulse 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes store-heart-pulse {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.35);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .store-heart-pulse {
    animation: none;
  }
}
</style>
