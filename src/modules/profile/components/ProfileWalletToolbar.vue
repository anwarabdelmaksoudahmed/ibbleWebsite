<script setup lang="ts">
import type { WalletTransactionSource } from '@modules/checkout/types'
import type { SelectOption } from '@shared/components/ui/BaseSelect.vue'

withDefaults(
  defineProps<{
    search: string
    status: string | number
    paymentSource: WalletTransactionSource
    statusOptions: SelectOption[]
    paymentSourceOptions: SelectOption[]
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:search': [value: string]
  'update:status': [value: string]
  'update:paymentSource': [value: WalletTransactionSource]
  search: [query: string, signal: AbortSignal]
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="grid gap-3 rounded-2xl border border-ibbil-green/10 bg-white p-3 shadow-[0_8px_24px_-20px_rgba(45,83,61,0.4)] dark:border-ibbil-green/20 dark:bg-surface-elevated sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3 sm:p-4"
    role="search"
    :aria-label="t('site.profile.wallet.filters.label')"
  >
    <BaseSearchInput
      :model-value="search"
      :placeholder="t('site.profile.wallet.filters.searchPlaceholder')"
      :aria-label="t('site.profile.wallet.filters.searchPlaceholder')"
      :disabled="disabled"
      size="sm"
      root-class="!space-y-0 sm:col-span-2 lg:col-span-1"
      @update:model-value="emit('update:search', $event)"
      @search="(query, signal) => emit('search', query, signal)"
    />

    <BaseSelect
      :model-value="paymentSource"
      :options="paymentSourceOptions"
      :placeholder="t('site.profile.wallet.filters.paymentSource')"
      :disabled="disabled"
      size="sm"
      root-class="!space-y-0"
      @update:model-value="emit('update:paymentSource', String($event) as WalletTransactionSource)"
    />

    <BaseSelect
      :model-value="status"
      :options="statusOptions"
      :placeholder="t('site.profile.wallet.filters.status')"
      :disabled="disabled"
      size="sm"
      root-class="!space-y-0"
      @update:model-value="emit('update:status', String($event))"
    />
  </div>
</template>
