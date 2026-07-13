<script setup lang="ts">
import { getLineTotal, getStoreSubtotal } from '@modules/cart/utils/mappers'
import type { CartStoreGroup } from '@modules/cart/types'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

const props = defineProps<{
  store: CartStoreGroup
  submitting?: boolean
  canSubmit?: boolean
}>()

const emit = defineEmits<{
  placeOrder: []
  remove: [productId: string]
}>()

const { t, n } = useI18n()
const { removeFromCart, isCartMutating } = useCart()
const dialog = useDialog()

const subtotal = computed(() => getStoreSubtotal(props.store))
const shipping = computed(() => 0)
const vat = computed(() => 0)
const total = computed(() => subtotal.value + shipping.value + vat.value)

async function onRemove(productId: string) {
  const confirmed = await dialog.confirm({
    title: t('site.commerce.cart.removeConfirmTitle'),
    message: t('site.commerce.cart.removeConfirmMessage'),
    confirmText: t('site.commerce.cart.remove'),
    cancelText: t('common.cancel'),
    variant: 'danger',
  })
  if (!confirmed) return
  await removeFromCart({ storeId: props.store.storeId, productId })
  emit('remove', productId)
}

function unitPrice(product: CartStoreGroup['products'][number]) {
  return product.finalPrice ?? product.price ?? 0
}
</script>

<template>
  <aside
    class="checkout-summary sticky top-24 overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_10px_32px_-22px_rgba(45,83,61,0.35)] dark:border-ibbil-green/20 dark:bg-surface-elevated"
    :aria-label="t('site.commerce.checkout.summaryTitle')"
  >
    <div class="border-b border-ibbil-green/10 bg-gradient-to-br from-ibbil-green/[0.08] via-transparent to-ibbil-gold/[0.06] px-5 py-4">
      <h2 class="text-base font-extrabold text-ibbil-green">
        {{ t('site.commerce.checkout.summaryTitle') }}
      </h2>
    </div>

    <div class="flex items-center gap-3 border-b border-ibbil-green/10 px-5 py-4">
      <div
        class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ibbil-green/10 bg-white dark:bg-surface-muted"
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
        <p class="truncate text-sm font-extrabold text-ibbil-green">
          {{ store.storeName }}
        </p>
        <p class="mt-0.5 text-xs text-foreground-muted">
          {{ t('site.commerce.cart.productCount', { count: store.products.length }) }}
        </p>
      </div>
    </div>

    <div class="px-5 py-4">
      <h3 class="mb-3 text-xs font-bold uppercase tracking-wide text-foreground-muted">
        {{ t('site.commerce.checkout.products') }}
      </h3>

      <ul class="space-y-3">
        <li
          v-for="product in store.products"
          :key="product.lineId || product.id"
          class="flex items-center gap-3"
        >
          <div
            class="size-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-ibbil-green/[0.08] to-ibbil-green/[0.02]"
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
            >
              <Icon name="lucide:package" class="size-5 text-ibbil-green/25" aria-hidden="true" />
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-ibbil-green">
              {{ product.name }}
            </p>
            <p class="mt-0.5 text-xs tabular-nums text-foreground-muted">
              {{ product.quantity }} × {{ n(unitPrice(product)) }}
            </p>
            <p class="mt-0.5 text-sm font-extrabold tabular-nums text-ibbil-green">
              {{ n(getLineTotal(product)) }}
              <span class="text-[11px] font-semibold text-foreground-muted">
                {{ t('site.stores.profile.currency') }}
              </span>
            </p>
          </div>

          <button
            type="button"
            class="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-danger/15 text-danger/80 transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
            :disabled="isCartMutating(product.id)"
            :aria-label="t('site.commerce.cart.remove')"
            @click="onRemove(product.id)"
          >
            <Icon name="lucide:trash-2" class="size-4" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </div>

    <div class="space-y-2.5 border-t border-ibbil-green/10 px-5 py-4 text-sm">
      <div class="flex items-center justify-between">
        <span class="text-foreground-muted">{{ t('site.commerce.checkout.subtotal') }}</span>
        <span class="font-bold tabular-nums text-ibbil-green">
          {{ n(subtotal) }}
          <span class="text-xs font-semibold text-foreground-muted">
            {{ t('site.stores.profile.currency') }}
          </span>
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-foreground-muted">{{ t('site.commerce.checkout.shipping') }}</span>
        <span class="font-bold tabular-nums text-ibbil-green">
          {{ n(shipping) }}
          <span class="text-xs font-semibold text-foreground-muted">
            {{ t('site.stores.profile.currency') }}
          </span>
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-foreground-muted">{{ t('site.commerce.checkout.vat') }}</span>
        <span class="font-bold tabular-nums text-ibbil-green">
          {{ n(vat) }}
          <span class="text-xs font-semibold text-foreground-muted">
            {{ t('site.stores.profile.currency') }}
          </span>
        </span>
      </div>

      <div class="border-t border-dashed border-ibbil-green/15 pt-3">
        <div class="flex items-end justify-between gap-3">
          <span class="text-sm font-semibold text-foreground-muted">
            {{ t('site.commerce.checkout.total') }}
          </span>
          <p class="text-xl font-extrabold tabular-nums text-ibbil-green">
            {{ n(total) }}
            <span class="text-sm font-semibold text-foreground-muted">
              {{ t('site.stores.profile.currency') }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <div class="space-y-2 border-t border-ibbil-green/10 px-5 py-4">
      <button
        type="button"
        class="group flex w-full items-center justify-center gap-2 rounded-xl bg-ibbil-green px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-ibbil-green-dark disabled:cursor-not-allowed disabled:opacity-55"
        :disabled="submitting || !canSubmit"
        @click="emit('placeOrder')"
      >
        {{ t('site.commerce.checkout.placeOrder') }}
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
.checkout-summary {
  animation: checkout-summary-enter 0.55s ease both;
  animation-delay: 100ms;
}

@keyframes checkout-summary-enter {
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
  .checkout-summary {
    animation: none;
  }
}
</style>
