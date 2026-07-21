<script setup lang="ts">
import type { InsurancePaymentMethodId } from '@modules/insurance/schemas/payment.schema'
import type { UserWallet } from '@modules/checkout/types'

const props = defineProps<{
  modelValue: InsurancePaymentMethodId | ''
  error?: string
  wallet?: UserWallet | null
  walletLoading?: boolean
  walletDisabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: InsurancePaymentMethodId]
}>()

const { t, n } = useI18n()

const methods = computed(() => [
  {
    id: 'card' as const,
    title: t('site.insurance.register.payment.methods.card'),
    description: t('site.insurance.register.payment.methods.cardHint'),
    icon: 'lucide:credit-card',
    brands: ['mada', 'visa', 'mastercard'] as const,
    disabled: false,
  },
  {
    id: 'wallet' as const,
    title: t('site.insurance.register.payment.methods.wallet'),
    description: props.walletDisabled
      ? t('site.insurance.register.payment.methods.walletInsufficient')
      : props.wallet
        ? t('site.insurance.register.payment.methods.walletBalance', {
            balance: n(props.wallet.balance),
          })
        : t('site.insurance.register.payment.methods.walletHint'),
    icon: 'lucide:wallet',
    brands: null,
    disabled: Boolean(props.walletDisabled),
  },
])

function selectMethod(id: InsurancePaymentMethodId) {
  const method = methods.value.find((entry) => entry.id === id)
  if (method?.disabled) return
  emit('update:modelValue', id)
}
</script>

<template>
  <section
    class="space-y-3"
    :aria-label="t('site.insurance.register.payment.methodsTitle')"
  >
    <header class="space-y-1">
      <h3 class="text-sm font-extrabold text-ibbil-green sm:text-base">
        {{ t('site.insurance.register.payment.methodsTitle') }}
      </h3>
      <p class="text-xs text-foreground-muted sm:text-sm">
        {{ t('site.insurance.register.payment.methodsHint') }}
      </p>
    </header>

    <div
      class="grid gap-3 sm:grid-cols-2"
      role="radiogroup"
      :aria-label="t('site.insurance.register.payment.methodsTitle')"
      :aria-invalid="error ? true : undefined"
    >
      <button
        v-for="method in methods"
        :id="`insurance-pay-${method.id}`"
        :key="method.id"
        type="button"
        role="radio"
        class="relative flex min-h-[7rem] flex-col items-start gap-3 rounded-2xl border p-4 text-start transition-all duration-250"
        :class="
          modelValue === method.id
            ? 'border-ibbil-green bg-ibbil-green/[0.05] shadow-[0_10px_24px_-18px_rgba(45,83,61,0.4)] ring-1 ring-ibbil-green/15'
            : method.disabled
              ? 'cursor-not-allowed border-ibbil-green/10 bg-[#fafbfa] opacity-60 dark:bg-surface-muted/40'
              : 'border-ibbil-green/10 bg-[#fafbfa] hover:border-ibbil-green/25 dark:bg-surface-muted/40'
        "
        :disabled="method.disabled"
        :aria-checked="modelValue === method.id"
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
              {{ t('site.insurance.register.payment.methods.walletLoading') }}
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
          v-if="method.brands"
          class="mt-auto flex flex-wrap items-center gap-1.5 pt-1"
        >
          <span
            v-for="label in method.brands"
            :key="label"
            class="rounded-md border border-ibbil-green/10 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ibbil-green/70 dark:bg-surface-elevated"
          >
            {{ label }}
          </span>
        </div>
      </button>
    </div>

    <p
      v-if="error"
      class="text-xs text-danger"
      role="alert"
      data-validation-error
    >
      {{ error }}
    </p>
  </section>
</template>
