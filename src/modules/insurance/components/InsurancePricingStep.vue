<script setup lang="ts">
import InsuranceProviderCard from '@modules/insurance/components/InsuranceProviderCard.vue'
import InsuranceSummaryPanel from '@modules/insurance/components/InsuranceSummaryPanel.vue'
import type { InsuranceCustomerFormValues } from '@modules/insurance/schemas/customer.schema'
import type { InsuranceShipmentFormValues } from '@modules/insurance/schemas/shipment.schema'
import type { InsuranceServiceProvider } from '@modules/insurance/types'
import { findCountryByApiCode } from '@shared/constants/country-codes'

const props = defineProps<{
  customer: InsuranceCustomerFormValues
  shipment: InsuranceShipmentFormValues
  providers: InsuranceServiceProvider[]
  selectedId: number | null
  loading?: boolean
  errorMessage?: string | null
  selectionError?: string
  totalCargoValue: number
}>()

const emit = defineEmits<{
  select: [id: number]
  retry: []
}>()

const { t, locale } = useI18n()

const termsOpen = ref(false)
const termsProvider = ref<InsuranceServiceProvider | null>(null)

const numberLocale = computed(() => (locale.value === 'ar' ? 'ar-SA' : 'en-SA'))

function formatPhone(countryCode: string, phone: string) {
  const country = findCountryByApiCode(countryCode)
  return `${country.dialCode} ${phone}`.trim()
}

function formatDistance(distanceKm: string) {
  const value = Number(distanceKm)
  if (!Number.isFinite(value) || value <= 0) return distanceKm || '—'

  const formatted = new Intl.NumberFormat(numberLocale.value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
    // numberingSystem: 'latn', 

  }).format(value)

  return `${formatted} ${t('site.insurance.register.form.kmUnit')}`
}

function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(numberLocale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

const customerFields = computed(() => [
  {
    label: t('site.insurance.register.form.nationalId'),
    value: props.customer.nationalId,
    dir: 'ltr' as const,
  },
  {
    label: t('site.insurance.register.form.name'),
    value: props.customer.name,
  },
  {
    label: t('site.insurance.register.form.phone'),
    value: formatPhone(props.customer.countryCode, props.customer.phone),
    dir: 'ltr' as const,
  },
  {
    label: t('site.insurance.register.form.email'),
    value: props.customer.email,
    dir: 'ltr' as const,
  },
  {
    label: t('site.insurance.register.form.address'),
    value: props.customer.address,
    wide: true,
  },
])

const shipmentFields = computed(() => [
  {
    label: t('site.insurance.register.form.transportDate'),
    value: formatDate(props.shipment.transportDate),
  },
  {
    label: t('site.insurance.register.form.origin'),
    value: props.shipment.origin,
  },
  {
    label: t('site.insurance.register.form.destination'),
    value: props.shipment.destination,
  },
  {
    label: t('site.insurance.register.form.distanceKm'),
    value: formatDistance(props.shipment.distanceKm),
    dir: 'ltr' as const,
  },
  {
    label: t('site.insurance.register.form.totalCargoValue'),
    amount: props.totalCargoValue,
    highlight: true,
    wide: true,
  },
])

const termsParagraphs = computed(() => {
  const text = termsProvider.value?.termsAndConditions?.trim() ?? ''
  if (!text) return []
  return text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
})

function openTerms(provider: InsuranceServiceProvider) {
  termsProvider.value = provider
  termsOpen.value = true
}

function closeTerms() {
  termsOpen.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-3">
      <InsuranceSummaryPanel
        :title="t('site.insurance.register.steps.customer')"
        :fields="customerFields"
      />
      <InsuranceSummaryPanel
        :title="t('site.insurance.register.steps.shipment')"
        :fields="shipmentFields"
      />
    </div>

    <header class="space-y-2 text-center sm:text-start">
      <h2 class="text-base font-bold text-ibbil-green sm:text-lg">
        {{ t('site.insurance.register.sections.pricing') }}
      </h2>
      <p class="text-sm leading-relaxed text-foreground-muted">
        {{ t('site.insurance.register.sections.pricingHint') }}
      </p>
    </header>

    <div
      v-if="selectionError"
      class="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger"
      role="alert"
      data-validation-error
    >
      {{ selectionError }}
    </div>

    <BaseLoader
      v-if="loading"
      block
      tone="brand"
      show-label
      :label="t('site.insurance.register.pricing.loading')"
    />

    <div
      v-else-if="errorMessage"
      class="rounded-2xl border border-ibbil-green/10 bg-white dark:bg-surface-elevated"
    >
      <BaseErrorState
        variant="brand"
        :title="t('site.insurance.register.pricing.errorTitle')"
        :message="errorMessage"
        @retry="emit('retry')"
      />
    </div>

    <BaseEmptyState
      v-else-if="!providers.length"
      variant="brand"
      icon="lucide:shield-off"
      :title="t('site.insurance.register.pricing.emptyTitle')"
      :description="t('site.insurance.register.pricing.emptyDescription')"
    />

    <div
      v-else
      class="grid gap-4"
      :class="providers.length > 1 ? 'lg:grid-cols-2' : 'mx-auto max-w-2xl'"
      role="listbox"
      :aria-label="t('site.insurance.register.sections.pricing')"
      :aria-activedescendant="selectedId != null ? `insurance-provider-${selectedId}` : undefined"
    >
      <div
        v-for="(provider, index) in providers"
        :id="`insurance-provider-${provider.id}`"
        :key="provider.id"
        role="option"
        :aria-selected="provider.id === selectedId"
        class="insurance-provider-enter"
        :style="{ animationDelay: `${index * 60}ms` }"
      >
        <InsuranceProviderCard
          :provider="provider"
          :selected="provider.id === selectedId"
          @select="emit('select', provider.id)"
          @view-terms="openTerms(provider)"
        />
      </div>
    </div>

    <BaseModal
      :open="termsOpen"
      size="lg"
      :title="
        termsProvider
          ? t('site.insurance.register.pricing.termsTitle', { name: termsProvider.name })
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

<style scoped>
.insurance-provider-enter {
  animation: insurance-provider-enter 0.45s ease both;
}

@keyframes insurance-provider-enter {
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
  .insurance-provider-enter {
    animation: none;
  }
}
</style>
