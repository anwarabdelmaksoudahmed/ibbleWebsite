<script setup lang="ts">
import CartLineItem from '@modules/cart/components/CartLineItem.vue'
import { getStoreSubtotal } from '@modules/cart/utils/mappers'
import type { CartStoreGroup } from '@modules/cart/types'
import { CHECKOUT_ROUTES } from '@modules/checkout/constants/routes'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

const props = defineProps<{
  store: CartStoreGroup
  index?: number
}>()

const { t, n } = useI18n()
const localePath = useLocalePath()

const productCount = computed(() =>
  props.store.products.reduce((sum, p) => sum + p.quantity, 0),
)

const subtotal = computed(() => getStoreSubtotal(props.store))

async function onCheckout() {
  await navigateTo(localePath(CHECKOUT_ROUTES.forStore(props.store.storeId)))
}
</script>

<template>
  <section
    class="cart-store-group overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_10px_32px_-22px_rgba(45,83,61,0.35)] dark:border-ibbil-green/20 dark:bg-surface-elevated"
    :style="index != null ? { animationDelay: `${index * 70}ms` } : undefined"
    :aria-label="store.storeName"
  >
    <header
      class="flex flex-wrap items-center justify-between gap-3 border-b border-ibbil-green/10 bg-gradient-to-l from-ibbil-green/[0.06] to-transparent px-4 py-3.5 sm:px-5"
    >
      <div class="flex min-w-0 items-center gap-3">
        <div
          class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ibbil-green/10 bg-white dark:bg-surface-muted"
        >
          <img
            v-if="store.storeLogo"
            :src="store.storeLogo"
            :alt="store.storeName"
            class="h-full w-full object-cover"
            loading="lazy"
          >
          <Icon
            v-else
            name="lucide:store"
            class="size-5 text-ibbil-green/40"
            aria-hidden="true"
          />
        </div>
        <div class="min-w-0">
          <h2 class="truncate text-base font-extrabold text-ibbil-green sm:text-lg">
            {{ store.storeName }}
          </h2>
        </div>
      </div>

      <span
        class="inline-flex items-center rounded-lg bg-ibbil-green/10 px-2.5 py-1 text-xs font-bold text-ibbil-green"
      >
        {{ t('site.commerce.cart.productCount', { count: productCount }) }}
      </span>
    </header>

    <div class="px-4 sm:px-5">
      <CartLineItem
        v-for="(product, productIndex) in store.products"
        :key="product.lineId || product.id"
        :product="product"
        :store-id="store.storeId"
        :index="productIndex"
      />
    </div>

    <footer
      class="flex flex-col gap-3 border-t border-ibbil-green/10 bg-[#fafbfa] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:bg-surface-muted/40"
    >
      <p class="text-sm text-foreground-muted">
        {{ t('site.commerce.cart.storeSubtotal') }}
        <span class="ms-1.5 text-base font-extrabold tabular-nums text-ibbil-green">
          {{ n(subtotal) }}
          <span class="text-xs font-semibold text-foreground-muted">
            {{ t('site.stores.profile.currency') }}
          </span>
        </span>
      </p>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <NuxtLinkLocale
          :to="STORES_ROUTES.ROOT"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-ibbil-green/20 bg-white px-4 py-2.5 text-sm font-medium text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06]"
        >
          <Icon name="lucide:store" class="size-4" aria-hidden="true" />
          {{ t('site.commerce.cart.continueShopping') }}
        </NuxtLinkLocale>

        <button
          type="button"
          class="group inline-flex items-center justify-center gap-2 rounded-lg bg-ibbil-green px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ibbil-green-dark"
          @click="onCheckout"
        >
          {{ t('site.commerce.cart.checkout') }}
          <DirectionalArrow animated class="size-4" />
        </button>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.cart-store-group {
  animation: cart-store-enter 0.5s ease both;
}

@keyframes cart-store-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cart-store-group {
    animation: none;
  }
}
</style>
