<script setup lang="ts">
import type { InsuranceProviderQuote } from '@modules/insurance/types'

const props = defineProps<{
  quote: InsuranceProviderQuote
}>()

const { t } = useI18n()

const rows = computed(() => [
  {
    key: 'coverage',
    label: t('site.insurance.register.pricing.coverage'),
    amount: props.quote.coverage,
  },
  {
    key: 'vat',
    label: t('site.insurance.register.pricing.vat', { percent: props.quote.taxPercent }),
    amount: props.quote.vat,
  },
  {
    key: 'certificateFees',
    label: t('site.insurance.register.pricing.certificateFees'),
    amount: props.quote.certificateFees,
  },
])
</script>

<template>
  <aside
    class="flex h-full flex-col overflow-hidden rounded-2xl border border-ibbil-green/15 bg-[#fafbfa] dark:bg-surface-muted"
    :aria-label="t('site.insurance.register.payment.quoteTitle')"
  >
    <header class="border-b border-ibbil-green/10 px-4 py-3.5 sm:px-5">
      <h3 class="text-sm font-extrabold text-ibbil-green sm:text-base">
        {{ t('site.insurance.register.payment.quoteTitle') }}
      </h3>
    </header>

    <dl class="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
      <div
        v-for="row in rows"
        :key="row.key"
        class="flex items-start justify-between gap-3 text-sm"
      >
        <dt class="min-w-0 leading-snug text-foreground-muted">
          {{ row.label }}
        </dt>
        <dd class="shrink-0 font-bold text-foreground">
          <MoneyAmount :amount="row.amount" />
        </dd>
      </div>
    </dl>

    <div class="mt-auto bg-ibbil-green px-4 py-4 text-white sm:px-5">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-extrabold sm:text-base">
          {{ t('site.insurance.register.payment.grandTotal') }}
        </p>
        <MoneyAmount
          :amount="quote.total"
          class="text-base font-extrabold sm:text-lg"
        />
      </div>
      <p class="mt-1.5 text-xs leading-relaxed text-white/80">
        {{ t('site.insurance.register.payment.totalIncludes') }}
      </p>
    </div>
  </aside>
</template>
