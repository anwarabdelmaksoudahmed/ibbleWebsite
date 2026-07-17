<script setup lang="ts">
import type { InsuranceServiceProvider } from '@modules/insurance/types'

const props = defineProps<{
  provider: InsuranceServiceProvider
  selected: boolean
}>()

const emit = defineEmits<{
  select: []
  'view-terms': []
}>()

const { t, locale } = useI18n()

function formatMoney(amount: number) {
  const numberLocale = locale.value === 'ar' ? 'ar-SA' : 'en-SA'
  const formatted = new Intl.NumberFormat(numberLocale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${formatted} ${t('site.insurance.register.form.currency')}`
}

const quoteRows = computed(() => {
  const quote = props.provider.quote
  return [
    {
      key: 'insuredAmount',
      label: t('site.insurance.register.pricing.insuredAmount'),
      value: formatMoney(quote.insuredAmount),
      emphasize: false,
    },
    {
      key: 'certificateFees',
      label: t('site.insurance.register.pricing.certificateFees'),
      value: formatMoney(quote.certificateFees),
      emphasize: false,
    },
    {
      key: 'coverage',
      label: t('site.insurance.register.pricing.coverage'),
      value: formatMoney(quote.coverage),
      emphasize: false,
    },
    {
      key: 'vat',
      label: t('site.insurance.register.pricing.vat', { percent: quote.taxPercent }),
      value: formatMoney(quote.vat),
      emphasize: false,
    },
    {
      key: 'total',
      label: t('site.insurance.register.pricing.total'),
      value: formatMoney(quote.total),
      emphasize: true,
    },
  ]
})
</script>

<template>
  <article
    class="insurance-provider-card overflow-hidden rounded-2xl border bg-white transition-all duration-250 dark:bg-surface-elevated"
    :class="
      selected
        ? 'border-ibbil-green shadow-[0_14px_32px_-18px_rgba(45,83,61,0.5)] ring-1 ring-ibbil-green/25'
        : 'border-ibbil-green/10 hover:border-ibbil-green/30 hover:shadow-[0_10px_28px_-20px_rgba(45,83,61,0.35)]'
    "
  >
    <button
      type="button"
      class="flex w-full flex-col gap-5 p-4 text-start sm:p-5"
      :aria-pressed="selected"
      :aria-label="t('site.insurance.register.pricing.selectProviderAria', { name: provider.name })"
      @click="emit('select')"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ibbil-green/10 bg-[#fafbfa] dark:bg-surface-muted sm:size-16"
          >
            <BaseImage
              v-if="provider.image"
              :src="provider.image"
              :alt="provider.name"
              width="64"
              height="64"
              object-fit="contain"
              rounded="lg"
              class="!block size-full"
            />
            <Icon
              v-else
              name="lucide:shield-check"
              class="size-7 text-ibbil-green"
              aria-hidden="true"
            />
          </div>

          <div class="min-w-0">
            <h3 class="text-base font-extrabold text-ibbil-green sm:text-lg">
              {{ provider.name }}
            </h3>
            <p class="mt-1 text-xs text-foreground-muted sm:text-sm">
              {{ t('site.insurance.register.pricing.providerHint') }}
            </p>
          </div>
        </div>

        <span
          class="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
          :class="selected ? 'border-ibbil-green bg-ibbil-green' : 'border-ibbil-green/30'"
          aria-hidden="true"
        >
          <Icon
            v-if="selected"
            name="lucide:check"
            class="size-3.5 text-white"
          />
        </span>
      </div>

      <dl class="grid gap-2.5 sm:grid-cols-2">
        <div
          v-for="row in quoteRows"
          :key="row.key"
          class="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
          :class="
            row.emphasize
              ? 'bg-ibbil-green/[0.08] sm:col-span-2'
              : 'bg-[#fafbfa] dark:bg-surface-muted'
          "
        >
          <dt
            class="text-xs font-medium text-foreground-muted sm:text-sm"
            :class="row.emphasize ? '!font-bold !text-ibbil-green' : undefined"
          >
            {{ row.label }}
          </dt>
          <dd
            class="text-sm font-bold tabular-nums text-foreground"
            :class="row.emphasize ? '!text-base !text-ibbil-green sm:!text-lg' : undefined"
          >
            {{ row.value }}
          </dd>
        </div>
      </dl>

      <p class="text-xs leading-relaxed text-foreground-muted sm:text-sm">
        {{
          t('site.insurance.register.pricing.deductibleNote', {
            percent: provider.quote.deductiblePercent,
            min: formatMoney(provider.quote.minDeductible),
          })
        }}
      </p>
    </button>

    <div
      class="flex flex-wrap items-center justify-between gap-3 border-t border-ibbil-green/10 px-4 py-3 sm:px-5"
    >
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-sm font-bold text-ibbil-green underline-offset-4 transition-colors hover:underline"
        @click="emit('view-terms')"
      >
        <Icon name="lucide:file-text" class="size-4" aria-hidden="true" />
        {{ t('site.insurance.register.pricing.termsLink') }}
      </button>

      <BaseButton
        size="sm"
        class="min-w-[6.5rem]"
        :class="
          selected
            ? '!border-transparent !bg-ibbil-green !text-white hover:!bg-ibbil-green-dark'
            : '!border-ibbil-green/25 !bg-white !text-ibbil-green hover:!bg-ibbil-green/[0.06]'
        "
        :variant="selected ? 'primary' : 'outline'"
        @click="emit('select')"
      >
        <Icon
          :name="selected ? 'lucide:check' : 'lucide:circle-check'"
          class="size-4"
          aria-hidden="true"
        />
        {{
          selected
            ? t('site.insurance.register.pricing.selected')
            : t('site.insurance.register.pricing.select')
        }}
      </BaseButton>
    </div>
  </article>
</template>
