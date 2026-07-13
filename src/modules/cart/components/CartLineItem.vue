<script setup lang="ts">
import CartQuantityControl from '@modules/cart/components/CartQuantityControl.vue'
import { getLineTotal } from '@modules/cart/utils/mappers'
import type { CartProduct } from '@modules/cart/types'

const props = defineProps<{
  product: CartProduct
  storeId: string
  index?: number
}>()

const { t, n } = useI18n()
const dialog = useDialog()
const {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  isCartMutating,
  getQuantity,
} = useCart()
const { toggleWishlist, isFavourite, isWishlistMutating } = useWishlist()

const mutating = computed(() => isCartMutating(props.product.id))
const favourite = computed(() => isFavourite(props.product.id))
const wishlistLoading = computed(() => isWishlistMutating(props.product.id))

const unitPrice = computed(() => props.product.finalPrice ?? props.product.price)
const hasDiscount = computed(() => {
  if (props.product.price == null || props.product.finalPrice == null) return false
  return props.product.finalPrice < props.product.price
})

const liveProduct = computed<CartProduct>(() => ({
  ...props.product,
  quantity: getQuantity(props.product.id) || props.product.quantity,
}))

const lineTotal = computed(() => getLineTotal(liveProduct.value))

const wishlistTooltip = computed(() =>
  favourite.value ? t('site.commerce.wishlist.remove') : t('site.commerce.wishlist.add'),
)

async function onIncrease() {
  if (mutating.value) return
  await increaseQuantity({ storeId: props.storeId, productId: props.product.id })
}

async function onDecrease() {
  if (mutating.value) return
  await decreaseQuantity({ storeId: props.storeId, productId: props.product.id })
}

async function onRemove() {
  if (mutating.value) return
  const confirmed = await dialog.confirm({
    title: t('site.commerce.cart.removeConfirmTitle'),
    message: t('site.commerce.cart.removeConfirmMessage'),
    confirmText: t('site.commerce.cart.remove'),
    cancelText: t('common.cancel'),
    variant: 'danger',
  })
  if (!confirmed) return
  await removeFromCart({ storeId: props.storeId, productId: props.product.id })
}

async function onToggleWishlist() {
  await toggleWishlist(props.product.id)
}
</script>

<template>
  <article
    class="cart-line-item flex flex-col gap-4 border-b border-ibbil-green/10 py-5 last:border-b-0 sm:flex-row sm:items-center sm:gap-5"
    :style="index != null ? { animationDelay: `${80 + index * 40}ms` } : undefined"
  >
    <div class="flex min-w-0 flex-1 gap-3.5">
      <div
        class="relative size-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-ibbil-green/[0.08] to-ibbil-green/[0.02] sm:size-24"
      >
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          class="h-full w-full object-cover"
          loading="lazy"
        >
        <div
          v-else
          class="flex h-full items-center justify-center"
          aria-hidden="true"
        >
          <Icon name="lucide:package" class="size-8 text-ibbil-green/25" />
        </div>
      </div>

      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-bold leading-snug text-ibbil-green sm:text-base">
          {{ product.name }}
        </h3>

        <div class="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            v-if="unitPrice != null"
            class="text-sm font-extrabold tabular-nums text-ibbil-green"
          >
            {{ n(unitPrice) }}
            <span class="text-xs font-semibold text-foreground-muted">
              {{ t('site.stores.profile.currency') }}
            </span>
          </span>
          <span
            v-if="hasDiscount && product.price != null"
            class="text-xs tabular-nums text-foreground-muted line-through"
          >
            {{ n(product.price) }}
          </span>
          <span class="text-xs text-foreground-muted">
            {{ t('site.commerce.cart.perUnit') }}
          </span>
        </div>

        <div class="mt-3 flex items-center gap-2 sm:hidden">
          <CartQuantityControl
            :quantity="liveProduct.quantity"
            :loading="mutating"
            @increase="onIncrease"
            @decrease="onDecrease"
          />
          <span class="ms-auto text-sm font-extrabold tabular-nums text-ibbil-green">
            {{ n(lineTotal) }}
            <span class="text-xs font-semibold text-foreground-muted">
              {{ t('site.stores.profile.currency') }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <div class="hidden shrink-0 items-center gap-5 sm:flex">
      <CartQuantityControl
        :quantity="liveProduct.quantity"
        :loading="mutating"
        @increase="onIncrease"
        @decrease="onDecrease"
      />

      <div class="min-w-[7rem] text-end">
        <p class="text-sm font-extrabold tabular-nums text-ibbil-green">
          {{ n(lineTotal) }}
          <span class="text-xs font-semibold text-foreground-muted">
            {{ t('site.stores.profile.currency') }}
          </span>
        </p>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-1.5 self-end sm:self-center">
      <BaseTooltip :text="wishlistTooltip">
        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-xl border border-ibbil-green/10 text-ibbil-green transition-colors hover:border-ibbil-gold/40 hover:bg-ibbil-gold/10 hover:text-ibbil-gold disabled:opacity-50"
          :disabled="wishlistLoading"
          :aria-label="wishlistTooltip"
          :aria-pressed="favourite"
          @click="onToggleWishlist"
        >
          <Icon
            name="lucide:heart"
            class="size-4"
            :class="favourite ? 'fill-current text-red-500' : 'fill-none'"
            aria-hidden="true"
          />
        </button>
      </BaseTooltip>

      <BaseTooltip :text="t('site.commerce.cart.remove')">
        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-xl border border-danger/15 text-danger/80 transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
          :disabled="mutating"
          :aria-label="t('site.commerce.cart.remove')"
          @click="onRemove"
        >
          <Icon name="lucide:trash-2" class="size-4" aria-hidden="true" />
        </button>
      </BaseTooltip>
    </div>
  </article>
</template>

<style scoped>
.cart-line-item {
  animation: cart-line-enter 0.45s ease both;
}

@keyframes cart-line-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cart-line-item {
    animation: none;
  }
}
</style>
