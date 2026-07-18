<script setup lang="ts">
import InsurancePaymentMethods from '@modules/insurance/components/InsurancePaymentMethods.vue'
import InsuranceQuoteBreakdown from '@modules/insurance/components/InsuranceQuoteBreakdown.vue'
import type {
  InsurancePaymentField,
  InsurancePaymentFormValues,
  InsurancePaymentMethodId,
} from '@modules/insurance/schemas/payment.schema'
import type { InsuranceCustomerFormValues } from '@modules/insurance/schemas/customer.schema'
import type { InsuranceServiceProvider } from '@modules/insurance/types'
import type { UserWallet } from '@modules/checkout/types'
import { formatMoneyAmount } from '@shared/utils/format-money'
import { sanitizeIbanInput } from '@shared/utils/iban'

const props = defineProps<{
  provider: InsuranceServiceProvider | null
  customer: InsuranceCustomerFormValues
  model: InsurancePaymentFormValues
  errors: Partial<Record<InsurancePaymentField, string>>
  wallet?: UserWallet | null
  walletLoading?: boolean
  walletDisabled?: boolean
}>()

const emit = defineEmits<{
  'update:iban': [value: string]
  'update:dataAccurate': [value: boolean]
  'update:termsAccepted': [value: boolean]
  'update:paymentMethod': [value: InsurancePaymentMethodId]
  'field-blur': [field: InsurancePaymentField]
}>()

const { t, locale } = useI18n()

const termsOpen = ref(false)

const quote = computed(() => props.provider?.quote ?? null)

const deductibleMinLabel = computed(() =>
  quote.value ? formatMoneyAmount(quote.value.minDeductible, locale.value) : '',
)

const policyFields = computed(() => {
  if (!props.provider || !quote.value) return []

  return [
    {
      label: t('site.insurance.register.payment.policyHolderId'),
      value: props.customer.nationalId,
      dir: 'ltr' as const,
    },
    {
      label: t('site.insurance.register.payment.coverageLabel'),
      value: t('site.insurance.register.payment.coverageDescription'),
    },
    {
      label: t('site.insurance.register.payment.deductibleLabel'),
      value: t('site.insurance.register.pricing.deductibleNote', {
        percent: quote.value.deductiblePercent,
        min: deductibleMinLabel.value,
      }),
      wide: true,
    },
    {
      label: t('site.insurance.register.pricing.insuredAmount'),
      amount: quote.value.insuredAmount,
      highlight: true,
    },
  ]
})

const termsParagraphs = computed(() => {
  const text = props.provider?.termsAndConditions?.trim() ?? ''
  if (!text) return []
  return text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
})

function onIbanInput(value: string | number) {
  emit('update:iban', sanitizeIbanInput(String(value)))
}

function openTerms(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  termsOpen.value = true
}

function closeTerms() {
  termsOpen.value = false
}
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-2 text-center sm:text-start">
      <h2 class="text-base font-bold text-ibbil-green sm:text-lg">
        {{ t('site.insurance.register.sections.payment') }}
      </h2>
      <p class="text-sm leading-relaxed text-foreground-muted">
        {{ t('site.insurance.register.sections.paymentHint') }}
      </p>
    </header>

    <BaseEmptyState
      v-if="!provider || !quote"
      variant="brand"
      icon="lucide:shield-off"
      :title="t('site.insurance.register.payment.missingProviderTitle')"
      :description="t('site.insurance.register.payment.missingProviderDescription')"
    />

    <template v-else>
      <section
        class="overflow-hidden rounded-2xl border border-ibbil-green/15 bg-white shadow-[0_10px_28px_-22px_rgba(45,83,61,0.4)] dark:bg-surface-elevated"
        :aria-label="t('site.insurance.register.payment.companyTitle')"
      >
        <header
          class="border-b border-ibbil-green/10 bg-gradient-to-l from-ibbil-green/[0.07] via-transparent to-transparent px-4 py-3.5 sm:px-5"
        >
          <h3 class="text-sm font-extrabold text-ibbil-green sm:text-base">
            {{ t('site.insurance.register.payment.companyTitle') }}
          </h3>
        </header>

        <div class="grid gap-5 p-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.9fr)] lg:gap-6 sm:p-5">
          <div class="min-w-0 space-y-5">
            <div class="flex items-center gap-3 sm:gap-4">
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
                <p class="text-base font-extrabold text-ibbil-green sm:text-lg">
                  {{ provider.name }}
                </p>
                <p class="mt-1 text-xs text-foreground-muted sm:text-sm">
                  {{ t('site.insurance.register.pricing.providerHint') }}
                </p>
              </div>
            </div>

            <dl class="grid gap-4 sm:grid-cols-2">
              <div
                v-for="(field, index) in policyFields"
                :key="`${field.label}-${index}`"
                class="flex min-w-0 flex-col gap-1"
                :class="field.wide ? 'sm:col-span-2' : undefined"
              >
                <dt class="text-xs font-medium text-foreground-muted sm:text-sm">
                  {{ field.label }}
                </dt>
                <dd
                  class="m-0 break-words text-sm font-bold text-foreground [overflow-wrap:anywhere] sm:text-base"
                  :class="field.highlight ? 'text-ibbil-gold' : undefined"
                >
                  <MoneyAmount v-if="field.amount != null" :amount="field.amount" />
                  <bdi v-else-if="field.dir" :dir="field.dir">{{ field.value || '—' }}</bdi>
                  <template v-else>{{ field.value || '—' }}</template>
                </dd>
              </div>
            </dl>
          </div>

          <InsuranceQuoteBreakdown :quote="quote" />
        </div>
      </section>

      <form class="space-y-5" novalidate @submit.prevent>
        <BaseInput
          :model-value="model.iban"
          inputmode="text"
          autocomplete="off"
          spellcheck="false"
          dir="ltr"
          maxlength="34"
          :label="t('site.insurance.register.form.iban')"
          :placeholder="t('site.insurance.register.form.ibanPlaceholder')"
          :hint="t('site.insurance.register.hints.iban')"
          :error="errors.iban"
          required
          @update:model-value="onIbanInput"
          @blur="emit('field-blur', 'iban')"
        >
          <template #suffix>
            <Icon name="lucide:landmark" class="size-4 text-ibbil-green/60" aria-hidden="true" />
          </template>
        </BaseInput>

        <div class="space-y-4 rounded-2xl border border-ibbil-green/10 bg-[#fafbfa] p-4 dark:bg-surface-muted/40 sm:p-5">
          <BaseCheckbox
            :model-value="model.dataAccurate"
            size="lg"
            root-class="w-full"
            label-class="!text-foreground leading-relaxed"
            :error="errors.dataAccurate"
            :label="t('site.insurance.register.payment.dataAccurate')"
            @update:model-value="emit('update:dataAccurate', $event)"
          />

          <BaseCheckbox
            :model-value="model.termsAccepted"
            size="lg"
            root-class="w-full"
            label-class="!text-foreground leading-relaxed"
            :error="errors.termsAccepted"
            @update:model-value="emit('update:termsAccepted', $event)"
          >
            <template #label>
              <span>
                {{ t('site.insurance.register.payment.termsPrefix') }}
                <button
                  type="button"
                  class="font-bold text-ibbil-gold underline-offset-2 hover:underline"
                  @click="openTerms"
                >
                  {{ t('site.insurance.register.pricing.termsLink') }}
                </button>
              </span>
            </template>
          </BaseCheckbox>
        </div>

        <InsurancePaymentMethods
          :model-value="model.paymentMethod"
          :error="errors.paymentMethod"
          :wallet="wallet"
          :wallet-loading="walletLoading"
          :wallet-disabled="walletDisabled"
          @update:model-value="emit('update:paymentMethod', $event)"
        />
      </form>
    </template>

    <BaseModal
      :open="termsOpen"
      size="lg"
      :title="
        provider
          ? t('site.insurance.register.pricing.termsTitle', { name: provider.name })
          : t('site.insurance.register.pricing.termsLink')
      "
      @close="closeTerms"
      @update:open="(value) => !value && closeTerms()"
    >
      <div class="max-h-[min(60vh,28rem)] space-y-4 overflow-y-auto pe-1 text-sm leading-relaxed text-foreground-muted">
        <p v-if="!termsParagraphs.length">
          {{ t('site.insurance.register.pricing.termsEmpty') }}
        </p>
        <p v-for="(paragraph, index) in termsParagraphs" :key="index">
          {{ paragraph }}
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <BaseButton
            class="!bg-ibbil-green !text-white hover:!bg-ibbil-green-dark"
            @click="closeTerms"
          >
            {{ t('site.insurance.register.pricing.termsClose') }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
