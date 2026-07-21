<script setup lang="ts">
import { getCartTotal } from '@modules/cart/utils/mappers'
import type { Cart } from '@modules/cart/types'
import { CHECKOUT_ROUTES } from '@modules/checkout/constants/routes'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

const props = defineProps<{
  cart: Cart
  itemCount: number
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const storeCount = computed(() => props.cart.stores.length)
const grandTotal = computed(() => getCartTotal(props.cart))

async function onCheckoutAll() {
  const firstStoreId = props.cart.stores[0]?.storeId
  if (!firstStoreId) return
  await navigateTo(localePath(CHECKOUT_ROUTES.forStore(firstStoreId)))
}
</script>

<template>
  <aside
    class="cart-summary overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_10px_32px_-22px_rgba(45,83,61,0.35)] lg:sticky lg:top-30 dark:border-ibbil-green/20 dark:bg-surface-elevated"
    :aria-label="t('site.commerce.cart.summaryTitle')"
  >
    <div class="border-b border-ibbil-green/10 bg-gradient-to-br from-ibbil-green/[0.08] via-transparent to-ibbil-gold/[0.06] px-5 py-4">
      <h2 class="text-base font-extrabold text-ibbil-green">
        {{ t('site.commerce.cart.summaryTitle') }}
      </h2>
      <p class="mt-1 text-xs text-foreground-muted">
        {{ t('site.commerce.cart.summaryHint') }}
      </p>
    </div>

    <div class="space-y-3 px-5 py-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-foreground-muted">{{ t('site.commerce.cart.items') }}</span>
        <span class="font-bold tabular-nums text-ibbil-green">{{ itemCount }}</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-foreground-muted">{{ t('site.commerce.cart.stores') }}</span>
        <span class="font-bold tabular-nums text-ibbil-green">{{ storeCount }}</span>
      </div>

      <div class="border-t border-dashed border-ibbil-green/15 pt-3">
        <div class="flex items-end justify-between gap-3">
          <span class="text-sm font-semibold text-foreground-muted">
            {{ t('site.commerce.cart.grandTotal') }}
          </span>
          <MoneyAmount
            :amount="grandTotal"
            class="text-xl font-extrabold text-ibbil-green"
            symbol-class="text-sm font-semibold text-foreground-muted"
          />
        </div>
      </div>
    </div>

    <div class="space-y-2 border-t border-ibbil-green/10 px-5 py-4">
      <button
        type="button"
        class="group hidden w-full items-center justify-center gap-2 rounded-xl bg-ibbil-green px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-ibbil-green-dark lg:flex"
        @click="onCheckoutAll"
      >
        {{ t('site.commerce.cart.checkout') }}
        <DirectionalArrow animated class="size-4" />
      </button>

      <NuxtLinkLocale
        :to="STORES_ROUTES.ROOT"
        class="flex w-full items-center justify-center gap-2 rounded-xl border border-ibbil-green/20 px-4 py-2.5 text-sm font-medium text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06]"
      >
        {{ t('site.commerce.cart.continueShopping') }}
      </NuxtLinkLocale>
    </div>
  </aside>
</template>

<style scoped>
.cart-summary {
  animation: cart-summary-enter 0.55s ease both;
  animation-delay: 120ms;
}

@keyframes cart-summary-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cart-summary {
    animation: none;
  }
}
</style>
