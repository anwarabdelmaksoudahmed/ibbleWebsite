<script setup lang="ts">
import CheckoutAddressesSection from '@modules/checkout/components/CheckoutAddressesSection.vue'
import CheckoutAddressFormModal from '@modules/checkout/components/CheckoutAddressFormModal.vue'
import CheckoutDiscountCode from '@modules/checkout/components/CheckoutDiscountCode.vue'
import CheckoutOrderSummary from '@modules/checkout/components/CheckoutOrderSummary.vue'
import CheckoutPaymentMethods from '@modules/checkout/components/CheckoutPaymentMethods.vue'
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'
import { CHECKOUT_ROUTES } from '@modules/checkout/constants/routes'
import { STORES_ROUTES } from '@modules/stores/constants/routes'
import { ROUTES } from '@shared/constants/routes'
import type { AddressFormInput, CustomerAddress, PaymentMethodId } from '@modules/checkout/types'
import type { CartStoreGroup } from '@modules/cart/types'
import { getStoreSubtotal } from '@modules/cart/utils/mappers'
import { toRaw } from 'vue'

const { t, n } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const toast = useToast()
const { authenticated } = useAuth()
const authSessionReady = useAuthSessionReady()

const {
  cart,
  hasItems,
  isLoading: cartLoading,
  isCartSyncing,
  isFetched: cartFetched,
  isError: cartError,
  refetch: refetchCart,
  restoreStoreGroup,
} = useCart()

const {
  addresses,
  selectedAddressId,
  selectedAddress,
  isLoading: addressesLoading,
  isError: addressesError,
  isSaving,
  selectAddress,
  createAddress,
  updateAddress,
  refetch: refetchAddresses,
} = useCheckoutAddresses()

const { countries, cities } = useCheckoutGeo()
const { primaryWallet, isLoading: walletsLoading } = useCheckoutWallets()
const { placeCardOrder } = useCheckoutOrder()

const paymentMethod = ref<PaymentMethodId>('card')
const discountCode = ref('')
const discountApplied = ref(false)
const formOpen = ref(false)
const editingAddress = ref<CustomerAddress | null>(null)
const placingOrder = ref(false)

const storeIdQuery = computed(() => {
  const raw = route.query.storeId
  return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] ?? '' : ''
})

const checkoutStore = computed(() => {
  if (!cart.value.stores.length) return null
  if (storeIdQuery.value) {
    return cart.value.stores.find((store) => store.storeId === storeIdQuery.value) ?? null
  }
  return cart.value.stores[0] ?? null
})

const breadcrumbItems = computed(() => [
  { label: t('site.nav.home'), to: localePath('/') },
  { label: t('site.nav.cart'), to: localePath('/cart') },
  { label: t('site.commerce.checkout.title') },
])

const isGuest = computed(() => authSessionReady.value && !authenticated.value)
const showSessionLoader = computed(() => !authSessionReady.value)
const showCartLoader = computed(
  () =>
    authSessionReady.value &&
    authenticated.value &&
    (cartLoading.value || isCartSyncing.value),
)
const hasCheckoutStore = computed(() => Boolean(checkoutStore.value))
const showEmptyCart = computed(
  () =>
    authSessionReady.value &&
    authenticated.value &&
    cartFetched.value &&
    !hasItems.value &&
    !isCartSyncing.value,
)
const showMissingStore = computed(
  () =>
    authSessionReady.value &&
    authenticated.value &&
    cartFetched.value &&
    hasItems.value &&
    !checkoutStore.value,
)

const canSubmit = computed(
  () => Boolean(selectedAddress.value && checkoutStore.value && paymentMethod.value),
)

const storeTotal = computed(() =>
  checkoutStore.value ? getStoreSubtotal(checkoutStore.value) : 0,
)

async function goToLogin() {
  await navigateTo({
    path: localePath(ROUTES.AUTH.LOGIN),
    query: { redirect: route.fullPath },
  })
}

function openAddAddress() {
  editingAddress.value = null
  formOpen.value = true
}

function openEditAddress(address: CustomerAddress) {
  editingAddress.value = address
  formOpen.value = true
}

async function onAddressSubmit(input: AddressFormInput) {
  if (editingAddress.value) {
    const ok = await updateAddress(editingAddress.value.id, input)
    if (ok) formOpen.value = false
    return
  }
  const ok = await createAddress(input)
  if (ok) formOpen.value = false
}

function onApplyDiscount() {
  const code = discountCode.value.trim()
  if (!code) return
  discountApplied.value = false
  toast.info(t('site.commerce.checkout.discountSoon'))
}

async function onPlaceOrder() {
  if (!selectedAddress.value) {
    toast.warning(t('site.commerce.checkout.selectAddressFirst'))
    return
  }

  const store = checkoutStore.value
  if (!store) {
    toast.warning(t('site.commerce.checkout.emptyTitle'))
    return
  }

  if (paymentMethod.value === 'wallet') {
    toast.info(t('site.commerce.checkout.walletPaymentSoon'))
    return
  }

  const address = selectedAddress.value
  placingOrder.value = true
  let checkoutSnapshot: CartStoreGroup | null = null

  try {
    checkoutSnapshot = structuredClone(toRaw(store))

    const paymentSummary = {
      title: store.storeName,
      subtotal: storeTotal.value,
      shipping: 0,
      tax: 0,
      total: storeTotal.value,
      currency: 'SAR',
    }

    const result = await placeCardOrder(
      {
        addressId: address.id,
        storeId: store.storeId,
        paymentMethodId: paymentMethod.value,
        couponCode: discountCode.value.trim(),
      },
      paymentSummary,
    )

    if (result.success) {
      toast.success(result.message || t('site.commerce.checkout.orderSuccess'))
      await refetchCart()
      await navigateTo(localePath(ROUTES.HOME))
      return
    }

    if (result.orderId && checkoutSnapshot) {
      await refetchCart()
      const storeStillInCart = cart.value.stores.some(
        (entry) =>
          entry.storeId === checkoutSnapshot!.storeId &&
          entry.products.length > 0,
      )

      if (!storeStillInCart) {
        try {
          await restoreStoreGroup(checkoutSnapshot)
          await refetchCart()
        } catch {
          toast.warning(t('site.commerce.checkout.cartRestoreFailed'))
        }
      }
    }

    if (result.status !== 'cancelled') {
      toast.error(result.message || t('site.commerce.checkout.orderFailed'))
    }
  } catch {
    toast.error(t('site.commerce.checkout.orderFailed'))
  } finally {
    placingOrder.value = false
  }
}

watch(
  () => [cartFetched.value, cart.value.stores, storeIdQuery.value] as const,
  () => {
    if (!cartFetched.value || !authenticated.value) return
    if (!cart.value.stores.length) return

    if (!storeIdQuery.value && cart.value.stores[0]) {
      void navigateTo(
        {
          path: localePath(CHECKOUT_ROUTES.ROOT),
          query: { storeId: cart.value.stores[0].storeId },
        },
        { replace: true },
      )
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (authSessionReady.value && authenticated.value) {
    void refetchCart()
  }
})
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

    <div class="relative mx-auto max-w-7xl px-4 pt-[10px] sm:px-6">
      <BaseBreadcrumb :items="breadcrumbItems" />

      <header class="mb-8 mt-6 sm:mb-10 sm:mt-8">
        <h1 class="text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl">
          {{ t('site.commerce.checkout.title') }}
        </h1>
        <p
          v-if="checkoutStore"
          class="mt-1.5 text-sm text-foreground-muted"
        >
          {{ t('site.commerce.checkout.subtitle', { store: checkoutStore.storeName }) }}
        </p>
      </header>
    </div>

    <div
      class="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-6 lg:pb-20"
      :class="hasCheckoutStore ? 'pb-28 lg:pb-20' : undefined"
    >
      <div
        v-if="isGuest"
        class="rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated"
      >
        <BaseEmptyState
          variant="brand"
          :title="t('site.commerce.checkout.guestTitle')"
          :description="t('site.commerce.checkout.guestDescription')"
          icon="lucide:log-in"
        >
          <BaseButton
            class="!bg-ibbil-green !text-white hover:!bg-ibbil-green-dark"
            @click="goToLogin"
          >
            {{ t('site.commerce.cart.signIn') }}
          </BaseButton>
        </BaseEmptyState>
      </div>

      <MarketplaceFetchLoader
        v-else-if="showSessionLoader || showCartLoader"
        :label="t('site.commerce.checkout.loading')"
      />

      <div
        v-else-if="authenticated && cartError"
        class="rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated"
      >
        <BaseErrorState
          variant="brand"
          :title="t('site.commerce.checkout.errorTitle')"
          :message="t('site.commerce.checkout.errorDescription')"
          :retryable="true"
          @retry="refetchCart()"
        />
      </div>

      <div
        v-else-if="showEmptyCart"
        class="rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated"
      >
        <BaseEmptyState
          variant="brand"
          :title="t('site.commerce.checkout.emptyTitle')"
          :description="t('site.commerce.checkout.emptyDescription')"
          icon="lucide:shopping-bag"
        >
          <NuxtLinkLocale
            :to="STORES_ROUTES.ROOT"
            class="inline-flex items-center gap-2 rounded-xl bg-ibbil-green px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ibbil-green-dark"
          >
            {{ t('site.commerce.cart.browseStores') }}
            <DirectionalArrow animated class="size-4" />
          </NuxtLinkLocale>
        </BaseEmptyState>
      </div>

      <div
        v-else-if="showMissingStore"
        class="rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated"
      >
        <BaseEmptyState
          variant="brand"
          :title="t('site.commerce.checkout.missingStoreTitle')"
          :description="t('site.commerce.checkout.missingStoreDescription')"
          icon="lucide:store"
        >
          <NuxtLinkLocale
            to="/cart"
            class="inline-flex items-center gap-2 rounded-xl bg-ibbil-green px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ibbil-green-dark"
          >
            {{ t('site.nav.cart') }}
            <DirectionalArrow animated class="size-4" />
          </NuxtLinkLocale>
        </BaseEmptyState>
      </div>

      <div
        v-else-if="checkoutStore"
        class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-8"
      >
        <div class="space-y-5 sm:space-y-6">
          <div
            v-if="addressesError"
            class="rounded-2xl border border-ibbil-green/10 bg-white p-2 dark:border-ibbil-green/20 dark:bg-surface-elevated"
          >
            <BaseErrorState
              variant="brand"
              :title="t('site.commerce.checkout.addressesErrorTitle')"
              :message="t('site.commerce.checkout.addressesErrorDescription')"
              :retryable="true"
              @retry="refetchAddresses()"
            />
          </div>

          <CheckoutAddressesSection
            v-else
            :addresses="addresses"
            :selected-id="selectedAddressId"
            :loading="addressesLoading"
            @select="selectAddress"
            @add="openAddAddress"
            @edit="openEditAddress"
          />

          <CheckoutPaymentMethods
            v-model="paymentMethod"
            :wallet="primaryWallet"
            :wallet-loading="walletsLoading"
          />

          <div class="hidden lg:block">
            <p class="text-xs text-foreground-muted">
              {{ t('site.commerce.checkout.secureNote') }}
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <CheckoutDiscountCode
            v-model="discountCode"
            :applied="discountApplied"
            @apply="onApplyDiscount"
          />

          <CheckoutOrderSummary
            class="hidden lg:block"
            :store="checkoutStore"
            :submitting="placingOrder"
            :can-submit="canSubmit"
            @place-order="onPlaceOrder"
          />
        </div>
      </div>

      <div
        v-if="checkoutStore"
        class="fixed inset-x-0 bottom-0 z-30 border-t border-ibbil-green/10 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden dark:bg-surface-elevated/95"
      >
        <div class="mx-auto flex max-w-7xl items-center gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-xs text-foreground-muted">
              {{ t('site.commerce.checkout.total') }}
            </p>
            <p class="truncate text-base font-extrabold tabular-nums text-ibbil-green">
              {{ n(storeTotal) }}
              <span class="text-xs font-semibold text-foreground-muted">
                {{ t('site.stores.profile.currency') }}
              </span>
            </p>
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-ibbil-green px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-55"
            :disabled="placingOrder"
            @click="onPlaceOrder"
          >
            <Icon
              v-if="placingOrder"
              name="lucide:loader-circle"
              class="size-4 animate-spin"
              aria-hidden="true"
            />
            {{ t('site.commerce.checkout.placeOrder') }}
            <DirectionalArrow v-if="!placingOrder" class="size-4" />
          </button>
        </div>
      </div>
    </div>

    <CheckoutAddressFormModal
      v-model:open="formOpen"
      :address="editingAddress"
      :countries="countries"
      :cities="cities"
      :saving="isSaving"
      @submit="onAddressSubmit"
    />
  </section>
</template>
