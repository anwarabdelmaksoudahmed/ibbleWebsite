<script setup lang="ts">
import CartStoreGroup from '@modules/cart/components/CartStoreGroup.vue'
import CartSummary from '@modules/cart/components/CartSummary.vue'
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'
import { getCartTotal } from '@modules/cart/utils/mappers'
import { ROUTES } from '@shared/constants/routes'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

const { t, n } = useI18n()
const localePath = useLocalePath()
const { authenticated } = useAuth()
const authSessionReady = useAuthSessionReady()

const {
  cart,
  itemCount,
  isLoading,
  isFetched,
  isError,
  refetch,
} = useCart()

// Shared wishlist cache for line-item favourite actions.
useWishlist()

const breadcrumbItems = computed(() => [
  { label: t('site.nav.home'), to: localePath('/') },
  { label: t('site.nav.cart') },
])

const isGuest = computed(() => authSessionReady.value && !authenticated.value)
const hasItems = computed(() => cart.value.stores.length > 0)
const showSessionLoader = computed(() => !authSessionReady.value)
const showLoader = computed(
  () => authSessionReady.value && authenticated.value && isLoading.value,
)
const showEmpty = computed(
  () => authSessionReady.value && authenticated.value && isFetched.value && !hasItems.value,
)
const grandTotal = computed(() => getCartTotal(cart.value))
const formattedGrandTotal = computed(() => n(grandTotal.value))

const toast = useToast()

async function goToLogin() {
  await navigateTo(localePath(ROUTES.AUTH.LOGIN))
}

function onMobileCheckout() {
  toast.info(t('site.commerce.cart.checkoutSoon'))
}

onMounted(() => {
  if (authSessionReady.value && authenticated.value) {
    void refetch()
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

    <div class="relative mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-12 lg:px-6 lg:pt-14">
      <BaseBreadcrumb :items="breadcrumbItems" />

      <header class="mb-8 mt-6 sm:mb-10 sm:mt-8">
        <h1 class="text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl">
          {{ t('site.commerce.cart.title') }}
        </h1>
        <p
          v-if="hasItems"
          class="mt-1.5 text-sm text-foreground-muted"
        >
          {{ t('site.commerce.cart.subtitle', { count: itemCount }) }}
        </p>
      </header>
    </div>

    <div
      class="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-6 lg:pb-20"
      :class="hasItems ? 'pb-28 lg:pb-20' : undefined"
    >
      <div
        v-if="isGuest"
        class="rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated"
      >
        <BaseEmptyState
          variant="brand"
          :title="t('site.commerce.cart.guestTitle')"
          :description="t('site.commerce.cart.guestDescription')"
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
        v-else-if="showSessionLoader || showLoader"
        :label="t('site.commerce.cart.loading')"
      />

      <div
        v-else-if="authenticated && isError"
        class="rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated"
      >
        <BaseErrorState
          variant="brand"
          :title="t('site.commerce.cart.errorTitle')"
          :message="t('site.commerce.cart.errorDescription')"
          :retryable="true"
          @retry="refetch()"
        />
      </div>

      <div
        v-else-if="showEmpty"
        class="rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated"
      >
        <BaseEmptyState
          variant="brand"
          :title="t('site.commerce.cart.emptyTitle')"
          :description="t('site.commerce.cart.emptyDescription')"
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
        v-else-if="hasItems"
        class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-8"
      >
        <div class="space-y-5 sm:space-y-6">
          <CartStoreGroup
            v-for="(store, storeIndex) in cart.stores"
            :key="store.storeId"
            :store="store"
            :index="storeIndex"
          />
        </div>

        <CartSummary
          class="hidden lg:block"
          :cart="cart"
          :item-count="itemCount"
        />
      </div>

      <div
        v-if="hasItems"
        class="fixed inset-x-0 bottom-0 z-30 border-t border-ibbil-green/10 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden dark:bg-surface-elevated/95"
      >
        <div class="mx-auto flex max-w-7xl items-center gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-xs text-foreground-muted">
              {{ t('site.commerce.cart.grandTotal') }}
            </p>
            <p class="truncate text-base font-extrabold tabular-nums text-ibbil-green">
              {{ formattedGrandTotal }}
              <span class="text-xs font-semibold text-foreground-muted">
                {{ t('site.stores.profile.currency') }}
              </span>
            </p>
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-ibbil-green px-4 py-2.5 text-sm font-bold text-white"
            @click="onMobileCheckout"
          >
            {{ t('site.commerce.cart.checkout') }}
            <DirectionalArrow class="size-4" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
