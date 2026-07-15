<script setup lang="ts">
import type { StoreProduct } from '@modules/stores/types'

const props = withDefaults(
  defineProps<{
    product: StoreProduct
    storeId?: string
    index?: number
    animate?: boolean
    to?: string
  }>(),
  {
    animate: false,
  },
)

const { t, n } = useI18n()
const { addToCart, isInCart, isCartMutating } = useCart()
const { toggleWishlist, isFavourite, isWishlistMutating } = useWishlist()

const resolvedStoreId = computed(() => props.product.storeId || props.storeId || '')

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

const animationStyle = computed(() =>
  props.animate && props.index != null
    ? { animationDelay: `${100 + props.index * 45}ms` }
    : undefined,
)

const ratingStars = computed(() => {
  if (props.product.rating == null || props.product.rating <= 0) return []
  const full = Math.round(Math.min(5, Math.max(0, props.product.rating)))
  return Array.from({ length: 5 }, (_, i) => i < full)
})

const favourite = computed(() => isFavourite(props.product.id))
const inCart = computed(() => isInCart(props.product.id))
const wishlistLoading = computed(() => isWishlistMutating(props.product.id))
const cartLoading = computed(() => isCartMutating(props.product.id))

const wishlistTooltip = computed(() =>
  favourite.value
    ? t('site.commerce.wishlist.remove')
    : t('site.commerce.wishlist.add'),
)

const cartTooltip = computed(() =>
  inCart.value ? t('site.commerce.cart.inCart') : t('site.commerce.cart.add'),
)

const heartPulse = ref(false)

function customizeHeartFill(content: string) {
  return content.replaceAll('fill="none"', 'fill="currentColor"')
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
    storeId: resolvedStoreId.value,
    productId: props.product.id,
    quantity: 1,
  })
}
</script>

<template>
  <article
    class="store-product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_8px_28px_-18px_rgba(45,83,61,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-ibbil-gold/40 hover:shadow-[0_18px_40px_-20px_rgba(45,83,61,0.45)] dark:border-ibbil-green/20 dark:bg-surface-elevated"
    :class="animate ? 'store-product-card-enter' : undefined"
    :style="animationStyle"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-ibbil-green/[0.08] to-ibbil-green/[0.02]">
      <NuxtLinkLocale
        v-if="to"
        :to="to"
        class="block h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-gold focus-visible:ring-inset"
      >
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        >
        <div
          v-else
          class="flex h-full items-center justify-center"
          aria-hidden="true"
        >
          <Icon name="lucide:package" class="h-12 w-12 text-ibbil-green/25" />
        </div>
      </NuxtLinkLocale>

      <div v-else class="block h-full w-full">
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        >
        <div
          v-else
          class="flex h-full items-center justify-center"
          aria-hidden="true"
        >
          <Icon name="lucide:package" class="h-12 w-12 text-ibbil-green/25" />
        </div>
      </div>

      <span
        v-if="hasDiscount && discountPercent > 0"
        class="pointer-events-none absolute start-3 top-3 z-[1] rounded-lg bg-ibbil-gold px-2 py-1 text-xs font-bold text-ibbil-green-dark shadow-sm"
      >
        -{{ discountPercent }}%
      </span>

      <div
        class="absolute end-3 top-3 z-[1] flex flex-col gap-2 opacity-100 transition-all duration-300 sm:translate-y-1 sm:opacity-0 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
      >
        <BaseTooltip :text="wishlistTooltip">
          <button
            type="button"
            class="store-product-fab inline-flex size-9 items-center justify-center rounded-full border border-ibbil-green/10 bg-white/95 text-ibbil-green shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-ibbil-gold/40 hover:text-ibbil-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 dark:border-ibbil-green/20 dark:bg-surface-elevated/95"
            :class="favourite ? 'text-red-500 hover:text-red-500' : undefined"
         
            :disabled="wishlistLoading"
            :aria-busy="wishlistLoading"
            @click.stop="onToggleWishlist"
          >
            <BaseLoader v-if="wishlistLoading" size="xs" class="!gap-0 text-current" />
            <Icon
              v-else
              :key="favourite ? 'heart-filled' : 'heart-outline'"
              name="lucide:heart"
              mode="svg"
              class="size-4 transition-transform duration-300"
              :class="[
                favourite ? 'text-red-500' : 'text-current',
                heartPulse ? 'store-heart-pulse' : '',
              ]"
              :customize="favourite ? customizeHeartFill : false"
              aria-hidden="true"
            />
          </button>
        </BaseTooltip>


      </div>
    </div>

    <div class="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
      <p
        v-if="product.categoryName"
        class="text-xs font-semibold tracking-wide text-ibbil-gold"
      >
        {{ product.categoryName }}
      </p>

      <h3 class="text-base font-bold leading-snug text-ibbil-green sm:text-lg">
        <NuxtLinkLocale
          v-if="to"
          :to="to"
          class="transition-colors hover:text-ibbil-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-gold focus-visible:ring-offset-2"
        >
          {{ product.name }}
        </NuxtLinkLocale>
        <template v-else>
          {{ product.name }}
        </template>
      </h3>

      <p
        v-if="product.description"
        class="line-clamp-2 text-sm leading-relaxed text-foreground-muted"
      >
        {{ product.description }}
      </p>

      <div
        v-if="ratingStars.length"
        class="flex items-center gap-0.5"
        :aria-label="t('site.stores.profile.rating', { rating: product.rating })"
      >
        <Icon
          v-for="(filled, i) in ratingStars"
          :key="i"
          name="lucide:star"
          class="h-3.5 w-3.5"
          :class="filled ? 'fill-ibbil-gold text-ibbil-gold' : 'text-ibbil-green/20'"
          aria-hidden="true"
        />
      </div>

      <div class="mt-auto flex flex-col gap-3 pt-1">
        <div class="flex items-baseline gap-2">
          <span class="text-lg font-extrabold text-ibbil-green">
            {{ formattedPrice }}
            <span class="text-sm font-semibold">{{ t('site.stores.profile.currency') }}</span>
          </span>
          <span
            v-if="hasDiscount"
            class="text-sm text-foreground-muted line-through"
          >
            {{ formattedOriginal }}
          </span>
        </div>

        <BaseTooltip v-if="!inCart" :text="cartTooltip">
          <BaseButton
            variant="outline"
            size="sm"
            block
            class="!border-ibbil-green/20 !text-ibbil-green hover:!border-ibbil-gold/50 hover:!bg-ibbil-green/[0.06] dark:!border-ibbil-green/30"
            :loading="cartLoading"
            :disabled="cartLoading || !resolvedStoreId"
            :aria-label="t('site.commerce.cart.add')"
            @click.stop="onAddToCart"
          >
            <Icon name="lucide:shopping-cart" class="size-4" aria-hidden="true" />
            {{ t('site.commerce.cart.add') }}
          </BaseButton>
        </BaseTooltip>

        <div
          v-else
          role="status"
          class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ibbil-green px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors dark:bg-ibbil-green"
          :aria-label="t('site.commerce.cart.inCart')"
        >
          <Icon name="lucide:check" class="size-4" aria-hidden="true" />
          {{ t('site.commerce.cart.inCart') }}
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.store-product-card-enter {
  animation: store-product-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes store-product-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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
  .store-product-card-enter,
  .store-heart-pulse {
    animation: none;
  }

  .store-product-card-enter {
    opacity: 1;
    transform: none;
  }
}
</style>
