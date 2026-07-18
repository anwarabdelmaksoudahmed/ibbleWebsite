<script setup lang="ts">
import type { PaymentMethodId, UserWallet } from '@modules/checkout/types'

const props = defineProps<{
  modelValue: PaymentMethodId
  wallet: UserWallet | null
  walletLoading?: boolean
  walletDisabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PaymentMethodId]
}>()

const { t, n } = useI18n()

const methods = computed(() => [
  {
    id: 'card' as const,
    title: t('site.commerce.checkout.payment.card'),
    description: t('site.commerce.checkout.payment.cardHint'),
    icon: 'lucide:credit-card',
    disabled: false,
  },
  {
    id: 'wallet' as const,
    title: t('site.commerce.checkout.payment.wallet'),
    description: props.walletDisabled
      ? t('site.commerce.checkout.payment.walletInsufficient')
      : props.wallet
        ? t('site.commerce.checkout.payment.walletBalance', {
            balance: n(props.wallet.balance),
          })
        : t('site.commerce.checkout.payment.walletHint'),
    icon: 'lucide:wallet',
    disabled: props.walletDisabled,
  },
])

function selectMethod(id: PaymentMethodId) {
  const method = methods.value.find((entry) => entry.id === id)
  if (method?.disabled) return
  emit('update:modelValue', id)
}
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_10px_32px_-22px_rgba(45,83,61,0.35)] dark:border-ibbil-green/20 dark:bg-surface-elevated"
    :aria-label="t('site.commerce.checkout.paymentTitle')"
  >
    <header
      class="border-b border-ibbil-green/10 bg-gradient-to-l from-ibbil-green/[0.07] via-transparent to-transparent px-4 py-4 sm:px-5"
    >
      <h2 class="text-base font-extrabold text-ibbil-green sm:text-lg">
        {{ t('site.commerce.checkout.paymentTitle') }}
      </h2>
      <p class="mt-0.5 text-xs text-foreground-muted">
        {{ t('site.commerce.checkout.paymentHint') }}
      </p>
    </header>

    <div class="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
      <button
        v-for="method in methods"
        :key="method.id"
        type="button"
        class="relative flex min-h-[6.5rem] flex-col items-start gap-3 rounded-2xl border p-4 text-start transition-all duration-250"
        :class="
          modelValue === method.id
            ? 'border-ibbil-green bg-ibbil-green/[0.05] shadow-[0_10px_24px_-18px_rgba(45,83,61,0.4)] ring-1 ring-ibbil-green/15'
            : method.disabled
              ? 'cursor-not-allowed border-ibbil-green/10 bg-[#fafbfa] opacity-60 dark:bg-surface-muted/40'
              : 'border-ibbil-green/10 bg-[#fafbfa] hover:border-ibbil-green/25 dark:bg-surface-muted/40'
        "
        :disabled="method.disabled"
        :aria-pressed="modelValue === method.id"
        @click="selectMethod(method.id)"
      >
        <span
          class="absolute end-3 top-3 size-2.5 rounded-full transition-colors"
          :class="modelValue === method.id ? 'bg-ibbil-green' : 'bg-ibbil-green/20'"
          aria-hidden="true"
        />

        <span
          class="inline-flex size-11 items-center justify-center rounded-xl bg-ibbil-green/10 text-ibbil-green"
        >
          <Icon :name="method.icon" class="size-5" aria-hidden="true" />
        </span>

        <div class="min-w-0">
          <p class="text-sm font-extrabold text-ibbil-green">
            {{ method.title }}
          </p>
          <p class="mt-1 text-xs leading-relaxed text-foreground-muted">
            <span v-if="method.id === 'wallet' && walletLoading">
              {{ t('site.commerce.checkout.payment.walletLoading') }}
            </span>
            <span
              v-else-if="method.id === 'wallet' && wallet && !walletDisabled"
              class="inline-flex items-center"
            >
              {{ method.description }}
              <SaudiRiyalSymbol class="ms-0.5 text-[0.95em]" />
            </span>
            <span v-else>{{ method.description }}</span>
          </p>
        </div>

        <div
          v-if="method.id === 'card'"
          class="mt-auto flex flex-wrap items-center gap-1.5 pt-1"
        >
          <span
            v-for="label in ['mada', 'visa', 'mastercard']"
            :key="label"
            class="rounded-md border border-ibbil-green/10 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ibbil-green/70"
          >
            {{ label }}
          </span>
        </div>
      </button>
    </div>
  </section>
</template>
