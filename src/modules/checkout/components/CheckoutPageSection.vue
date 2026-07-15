<script setup lang="ts">
import CheckoutAddressesSection from '@modules/checkout/components/CheckoutAddressesSection.vue'
import CheckoutAddressFormModal from '@modules/checkout/components/CheckoutAddressFormModal.vue'
import CheckoutDiscountCode from '@modules/checkout/components/CheckoutDiscountCode.vue'
import CheckoutOrderSummary from '@modules/checkout/components/CheckoutOrderSummary.vue'
import CheckoutPaymentMethods from '@modules/checkout/components/CheckoutPaymentMethods.vue'
import CheckoutWalletPinModal from '@modules/checkout/components/CheckoutWalletPinModal.vue'
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'
import { CHECKOUT_ROUTES } from '@modules/checkout/constants/routes'
import { STORES_ROUTES } from '@modules/stores/constants/routes'
import { ROUTES } from '@shared/constants/routes'
import type { AddressFormInput, CustomerAddress, PaymentMethodId } from '@modules/checkout/types'
import type { CartStoreGroup } from '@modules/cart/types'
import { getStoreSubtotal } from '@modules/cart/utils/mappers'
import { restoreCheckoutCartIfNeeded } from '@modules/checkout/utils/cart-restore'
import { clearCheckoutCartSnapshot, consumePaymentOutcome } from '@shared/payment/utils/pending-payment'
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
const { primaryWallet, isLoading: walletsLoading, refetch: refetchWallets } = useCheckoutWallets()
const { placeCardOrder, placeWalletOrder } = useCheckoutOrder()
const { restoreOutcome } = usePayment()

const paymentMethod = ref<PaymentMethodId>('card')
const discountCode = ref('')
const appliedDiscountCode = ref('')
const discountApplied = ref(false)
const formOpen = ref(false)
const editingAddress = ref<CustomerAddress | null>(null)
const placingOrder = ref(false)
const pinModalOpen = ref(false)
const pinServerError = ref('')

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

const storeTotal = computed(() =>
  checkoutStore.value ? getStoreSubtotal(checkoutStore.value) : 0,
)

const walletDisabled = computed(() => {
  if (walletsLoading.value || !primaryWallet.value) return true
  return primaryWallet.value.balance < storeTotal.value
})

const canSubmit = computed(
  () =>
    Boolean(selectedAddress.value && checkoutStore.value && paymentMethod.value) &&
    cartFetched.value &&
    !cartLoading.value &&
    !isCartSyncing.value &&
    (checkoutStore.value?.products.length ?? 0) > 0 &&
    (paymentMethod.value !== 'wallet' || !walletDisabled.value),
)

async function ensureCheckoutCartReady(storeId: string): Promise<boolean> {
  const refreshed = await refetchCart()
  const refreshedCart = refreshed.data ?? cart.value
  const storeGroup = refreshedCart.stores.find((entry) => entry.storeId === storeId)

  if (!storeGroup?.products.length) {
    toast.warning(t('site.commerce.checkout.cartNotReady'))
    return false
  }

  return true
}

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
  appliedDiscountCode.value = ''
  toast.info(t('site.commerce.checkout.discountSoon'))
}

function resolveOrderCouponCode(): string | undefined {
  if (!discountApplied.value) return undefined
  const code = appliedDiscountCode.value.trim()
  return code || undefined
}

async function tryRestoreCheckoutCart(snapshot: CartStoreGroup): Promise<void> {
  try {
    const restored = await restoreCheckoutCartIfNeeded(snapshot, {
      refetchCart,
      restoreStoreGroup,
      getCart: () => cart.value,
    })

    if (!restored) return
  } catch {
    toast.warning(t('site.commerce.checkout.cartRestoreFailed'))
  }
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

  if (!(await ensureCheckoutCartReady(store.storeId))) {
    return
  }

  if (paymentMethod.value === 'wallet') {
    if (walletDisabled.value) {
      toast.warning(t('site.commerce.checkout.walletInsufficientBalance'))
      return
    }
    pinServerError.value = ''
    pinModalOpen.value = true
    return
  }

  await submitCardOrder(store, selectedAddress.value)
}

async function submitCardOrder(
  store: CartStoreGroup,
  address: CustomerAddress,
) {
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
        paymentMethodId: 'card',
        couponCode: resolveOrderCouponCode(),
      },
      paymentSummary,
      checkoutSnapshot,
    )

    if (result.success) {
      clearCheckoutCartSnapshot()
      toast.success(result.message || t('site.commerce.checkout.orderSuccess'))
      await refetchCart()
      await navigateTo(localePath(ROUTES.HOME))
      return
    }

    if (checkoutSnapshot) {
      await tryRestoreCheckoutCart(checkoutSnapshot)
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

async function onWalletPinSubmit(pinCode: string) {
  const store = checkoutStore.value
  const address = selectedAddress.value
  if (!store || !address) return

  placingOrder.value = true
  pinServerError.value = ''

  try {
    const result = await placeWalletOrder({
      addressId: address.id,
      storeId: store.storeId,
      paymentMethodId: 'wallet',
      pinCode,
      couponCode: resolveOrderCouponCode(),
    })

    if (result.success) {
      pinModalOpen.value = false
      toast.success(result.message || t('site.commerce.checkout.orderSuccess'))
      await Promise.all([refetchCart(), refetchWallets()])
      await navigateTo(localePath(ROUTES.HOME))
      return
    }

    const pinError =
      result.fieldErrors?.PIN_code?.[0]
      ?? result.fieldErrors?.pin_code?.[0]

    if (pinError) {
      pinServerError.value = pinError
      return
    }

    toast.error(result.message || t('site.commerce.checkout.orderFailed'))
  } catch {
    toast.error(t('site.commerce.checkout.orderFailed'))
  } finally {
    placingOrder.value = false
  }
}

watch(
  () => walletDisabled.value,
  (disabled) => {
    if (disabled && paymentMethod.value === 'wallet') {
      paymentMethod.value = 'card'
    }
  },
)

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

async function handleReturnedPaymentOutcome() {
  const outcome = consumePaymentOutcome()
  if (!outcome) return

  if (outcome.result.success) {
    clearCheckoutCartSnapshot()
    toast.success(outcome.result.message || t('site.commerce.checkout.orderSuccess'))
    await refetchCart()
    await navigateTo(localePath(ROUTES.HOME))
    return
  }

  if (outcome.cartSnapshot) {
    await tryRestoreCheckoutCart(outcome.cartSnapshot)
  }

  clearCheckoutCartSnapshot()
  restoreOutcome(outcome.result, outcome.request)

  if (outcome.result.status !== 'cancelled') {
    toast.error(outcome.result.message || t('site.commerce.checkout.orderFailed'))
  }
}

onMounted(() => {
  if (authSessionReady.value && authenticated.value) {
    void refetchCart()
  }
  void handleReturnedPaymentOutcome()
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
            :wallet-disabled="walletDisabled"
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
            :disabled="placingOrder || !canSubmit"
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

    <CheckoutWalletPinModal
      v-model:open="pinModalOpen"
      :total="storeTotal"
      :submitting="placingOrder"
      :server-error="pinServerError"
      @submit="onWalletPinSubmit"
    />
  </section>
</template>
