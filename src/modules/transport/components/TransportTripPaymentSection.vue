<script setup lang="ts">
import CheckoutWalletPinModal from '@modules/checkout/components/CheckoutWalletPinModal.vue'
import { TRANSPORT_ROUTES } from '@modules/transport/constants/routes'
import { useTransportTripPay } from '@modules/transport/composables/useTransportTripPay'
import type { TransportPaymentMethodId } from '@modules/transport/constants/endpoints'
import { formatMoneyAmount } from '@shared/utils/format-money'

const props = defineProps<{
  tripId: string
  embedded?: boolean
}>()

const emit = defineEmits<{
  cancelled: []
}>()

const { t, locale, n } = useI18n()
const localePath = useLocalePath()

const {
  snapshot,
  amountDue,
  paymentMethod,
  primaryWallet,
  walletLoading,
  walletDisabled,
  countdown,
  isExpired,
  isPaying,
  pinOpen,
  pinServerError,
  vehicleOpen,
  vehicle,
  vehicleLoading,
  vehicleError,
  openVehicleDetails,
  submitPayment,
  runPayment,
  cancelAndRestart,
  isCancelling,
  cancelCompletedTick,
  missingSnapshot,
} = useTransportTripPay(() => props.tripId)

const cancelConfirmOpen = ref(false)

async function confirmCancel() {
  const ok = await cancelAndRestart({ reason: 'manual' })
  if (!ok) return
  cancelConfirmOpen.value = false
}

watch(cancelCompletedTick, async (tick) => {
  if (!tick) return
  emit('cancelled')
  if (!props.embedded) {
    await navigateTo(localePath(TRANSPORT_ROUTES.REGISTER), { replace: true })
  }
})

const methods = computed(() => [
  {
    id: 'wallet' as const,
    title: t('site.transport.pay.methods.wallet'),
    icon: 'lucide:wallet',
    brands: null as string[] | null,
    disabled: walletDisabled.value,
  },
  {
    id: 'card' as const,
    title: t('site.transport.pay.methods.card'),
    icon: 'lucide:credit-card',
    brands: ['mada', 'visa', 'mastercard'] as string[],
    disabled: false,
  },
])

function selectMethod(id: TransportPaymentMethodId) {
  const method = methods.value.find((entry) => entry.id === id)
  if (method?.disabled || isExpired.value) return
  paymentMethod.value = id
}

const amountLabel = computed(() => formatMoneyAmount(amountDue.value, locale.value))
</script>

<template>
  <section :class="embedded ? '' : 'bg-[#f4f6f5] dark:bg-background'">
    <div
      :class="
        embedded
          ? 'w-full'
          : 'mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10'
      "
    >
      <nav
        v-if="!embedded"
        class="mb-6 text-sm text-foreground-muted"
      >
        <NuxtLink
          :to="localePath(TRANSPORT_ROUTES.ROOT)"
          class="transition hover:text-ibbil-green"
        >
          {{ t('site.transport.ctaPrimary') }}
        </NuxtLink>
        <span class="mx-2 opacity-40">/</span>
        <span class="text-ibbil-green">{{ t('site.transport.pay.breadcrumb') }}</span>
      </nav>

      <div
        v-if="missingSnapshot"
        class="rounded-2xl border border-ibbil-gold/30 bg-ibbil-gold/10 px-5 py-6 text-sm text-ibbil-green"
      >
        <p class="font-bold">{{ t('site.transport.pay.missingTitle') }}</p>
        <p class="mt-1 text-foreground-muted">{{ t('site.transport.pay.missingHint') }}</p>
        <NuxtLink
          :to="localePath(TRANSPORT_ROUTES.REGISTER)"
          class="mt-4 inline-flex text-sm font-bold text-ibbil-green underline-offset-2 hover:underline"
        >
          {{ t('site.transport.request.backHome') }}
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Accepted banner -->
        <div
          class="mb-6 flex flex-col gap-3 rounded-2xl border border-[#6ebf97]/0.75] bg-[#6ebf97]/0.1] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5"
        >
          <h1 class="text-lg font-extrabold text-[#3d9a6e] sm:text-xl md:text-2xl">
            {{ t('site.transport.pay.acceptedTitle') }}
          </h1>
          <BaseButton
            type="button"
            class="!min-h-12 !rounded-lg !bg-[#646464] !px-6 !text-base !font-bold !text-white hover:!bg-[#525252]"
            :disabled="isPaying"
            @click="openVehicleDetails"
          >
            {{ t('site.transport.pay.vehicleDetails') }}
          </BaseButton>
        </div>

        <!-- Warning + countdown -->
        <div
          class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div class="min-w-0">
            <h2 class="text-base font-extrabold text-[#646464] sm:text-lg">
              {{ t('site.transport.pay.methodsTitle') }}
              <span class="ms-2 text-sm font-normal text-[#d58a12] sm:text-base">
                <strong class="font-bold">{{ t('site.transport.pay.attention') }} :</strong>
                {{ t('site.transport.pay.payWithin') }}
              </span>
            </h2>
          </div>
          <div class="text-start sm:text-end">
            <p class="text-sm font-semibold text-[#646464] sm:text-base">
              {{ t('site.transport.pay.cancelIn') }}
            </p>
            <p
              class="mt-0.5 text-lg font-extrabold tabular-nums text-[#d39d45] sm:text-xl"
              :aria-live="isExpired ? 'assertive' : 'polite'"
            >
              <template v-if="isExpired">
                {{ t('site.transport.pay.expired') }}
              </template>
              <template v-else>
                {{ countdown.hours }}<small class="mx-1 text-sm font-semibold">hr</small>
                {{ countdown.minutes }}<small class="mx-1 text-sm font-semibold">min</small>
                {{ countdown.seconds }}<small class="mx-1 text-sm font-semibold">sec</small>
              </template>
            </p>
          </div>
        </div>

        <!-- Amount -->
        <div
          class="mb-5 rounded-2xl border px-5 py-5 sm:px-8"
          :class="
            embedded
              ? 'border-ibbil-green/10 bg-[#fafbfa]'
              : 'border-transparent bg-white shadow-[0_3px_20px_rgba(0,0,0,0.05)]'
          "
        >
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <p class="text-sm font-bold text-[#646464] sm:text-base">
              {{ t('site.transport.pay.amountDue') }}
            </p>
            <p class="text-lg font-extrabold text-[#646464] sm:text-xl" dir="ltr">
              {{ amountLabel }}
            </p>
            <SaudiRiyalSymbol class="text-base text-[#646464]" />
          </div>
        </div>

        <!-- Payment methods (design: two side-by-side cards) -->
        <div
          class="mb-6 grid gap-4 sm:grid-cols-2"
          role="radiogroup"
          :aria-label="t('site.transport.pay.methodsTitle')"
        >
          <button
            v-for="method in methods"
            :key="method.id"
            type="button"
            role="radio"
            class="relative flex min-h-[7.5rem] flex-col items-center justify-center gap-3 rounded-2xl border px-4 py-6 text-center transition-all duration-200"
            :class="
              paymentMethod === method.id
                ? 'border-[#6ebf97] bg-white ring-1 ring-[#6ebf97]/40'
                : method.disabled || isExpired
                  ? 'cursor-not-allowed border-ibbil-green/10 bg-[#fafbfa] opacity-55'
                  : 'border-ibbil-green/10 bg-[#fafbfa] hover:border-ibbil-green/25'
            "
            :disabled="method.disabled || isExpired || isPaying"
            :aria-checked="paymentMethod === method.id"
            @click="selectMethod(method.id)"
          >
            <span
              class="inline-flex size-12 items-center justify-center rounded-xl bg-ibbil-green/10 text-ibbil-green"
            >
              <Icon :name="method.icon" class="size-6" aria-hidden="true" />
            </span>
            <span class="text-base font-extrabold text-[#646464]">
              {{ method.title }}
            </span>
            <span
              v-if="method.id === 'wallet' && primaryWallet && !walletDisabled"
              class="inline-flex items-center text-xs text-foreground-muted"
            >
              {{
                t('site.transport.pay.methods.walletBalance', {
                  balance: n(primaryWallet.balance),
                })
              }}
              <SaudiRiyalSymbol class="ms-0.5" />
            </span>
            <span
              v-else-if="method.id === 'wallet' && walletLoading"
              class="text-xs text-foreground-muted"
            >
              {{ t('site.transport.pay.methods.walletLoading') }}
            </span>
            <span
              v-else-if="method.id === 'wallet' && walletDisabled"
              class="text-xs text-ibbil-gold"
            >
              {{ t('site.transport.pay.methods.walletInsufficient') }}
            </span>
            <div
              v-if="method.brands?.length"
              class="mt-1 flex flex-wrap items-center justify-center gap-1.5"
            >
              <span
                v-for="brand in method.brands"
                :key="brand"
                class="rounded-md border border-ibbil-green/10 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ibbil-green/70"
              >
                {{ brand }}
              </span>
            </div>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <BaseButton
            type="button"
            variant="outline"
            class="!min-h-12 !min-w-[10rem] !rounded-xl !px-6 !text-base !font-bold"
            :disabled="isPaying || isCancelling"
            :loading="isCancelling"
            @click="cancelConfirmOpen = true"
          >
            {{ t('site.transport.pay.cancel') }}
          </BaseButton>
          <BaseButton
            type="button"
            variant="brand"
            class="!min-h-12 !min-w-[12rem] !rounded-xl !px-8 !text-base !font-bold"
            :loading="isPaying"
            :disabled="isExpired || !paymentMethod || isCancelling"
            @click="submitPayment"
          >
            {{ t('site.transport.pay.submit') }}
          </BaseButton>
        </div>
      </template>
    </div>

    <BaseModal
      v-model:open="cancelConfirmOpen"
      :title="t('site.transport.pay.cancelTitle')"
      size="sm"
      :closable="!isCancelling"
    >
      <p class="text-sm text-foreground-muted">
        {{ t('site.transport.pay.cancelConfirm') }}
      </p>
      <div class="mt-6 flex flex-wrap justify-end gap-2">
        <BaseButton
          type="button"
          variant="outline"
          :disabled="isCancelling"
          @click="cancelConfirmOpen = false"
        >
          {{ t('common.back') }}
        </BaseButton>
        <BaseButton
          type="button"
          variant="primary"
          class="!bg-red-600 hover:!bg-red-700"
          :loading="isCancelling"
          @click="confirmCancel"
        >
          {{ t('site.transport.pay.cancelConfirmAction') }}
        </BaseButton>
      </div>
    </BaseModal>

    <CheckoutWalletPinModal
      v-model:open="pinOpen"
      :submitting="isPaying"
      :total="amountDue"
      :server-error="pinServerError"
      @submit="runPayment"
    />

    <BaseModal
      v-model:open="vehicleOpen"
      :title="t('site.transport.pay.vehicleDetails')"
      size="lg"
    >
      <div v-if="vehicleLoading" class="py-8 text-center text-sm text-foreground-muted">
        {{ t('site.transport.pay.vehicleLoading') }}
      </div>
      <div
        v-else-if="vehicleError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ vehicleError }}
      </div>
      <div v-else-if="vehicle" class="space-y-4">
        <dl class="grid gap-3 sm:grid-cols-[8rem_1fr]">
          <dt class="text-sm font-bold text-foreground-muted">
            {{ t('site.transport.pay.vehicleModel') }}
          </dt>
          <dd class="text-base font-semibold text-ibbil-green">{{ vehicle.model || '—' }}</dd>

          <dt class="text-sm font-bold text-foreground-muted">
            {{ t('site.transport.pay.vehicleYear') }}
          </dt>
          <dd class="text-base font-semibold text-ibbil-green">{{ vehicle.year || '—' }}</dd>

          <dt class="text-sm font-bold text-foreground-muted">
            {{ t('site.transport.pay.vehiclePlate') }}
          </dt>
          <dd class="text-base font-semibold text-ibbil-green" dir="ltr">
            {{ vehicle.plateNumber || '—' }}
          </dd>
        </dl>

        <div
          v-if="vehicle.images.length"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          <img
            v-for="(src, index) in vehicle.images"
            :key="`${src}-${index}`"
            :src="src"
            :alt="t('site.transport.pay.vehicleImageAlt', { index: index + 1 })"
            class="aspect-[4/3] w-full rounded-xl object-cover"
            loading="lazy"
          >
        </div>
      </div>
    </BaseModal>
  </section>
</template>
