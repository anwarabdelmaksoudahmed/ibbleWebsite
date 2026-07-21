<script setup lang="ts">
import type { SelectOption } from '@shared/components/ui/BaseSelect.vue'

const props = withDefaults(
  defineProps<{
    search: string
    company: string | number
    status: string | number
    companyOptions: SelectOption[]
    statusOptions: SelectOption[]
    disabled?: boolean
    /** When false, the search field stays visible but inactive (endpoint not ready). */
    searchEnabled?: boolean
  }>(),
  {
    disabled: false,
    searchEnabled: true,
  },
)

const emit = defineEmits<{
  'update:search': [value: string]
  'update:company': [value: string]
  'update:status': [value: string]
  search: [query: string, signal: AbortSignal]
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="grid gap-3 rounded-2xl border border-ibbil-green/10 bg-white p-3 shadow-[0_8px_24px_-20px_rgba(45,83,61,0.4)] dark:border-ibbil-green/20 dark:bg-surface-elevated sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3 sm:p-4"
    role="search"
    :aria-label="t('site.profile.insurance.filters.label')"
  >
    <BaseSearchInput
      :model-value="search"
      :placeholder="t('site.profile.insurance.filters.searchPlaceholder')"
      :aria-label="t('site.profile.insurance.filters.searchPlaceholder')"
      :disabled="disabled || !props.searchEnabled"
      size="sm"
      root-class="!space-y-0"
      @update:model-value="emit('update:search', $event)"
      @search="(query, signal) => emit('search', query, signal)"
    />

    <BaseSelect
      :model-value="status"
      :options="statusOptions"
      :placeholder="t('site.profile.insurance.filters.status')"
      :disabled="disabled"
      size="sm"
      root-class="!space-y-0"
      @update:model-value="emit('update:status', String($event))"
    />

    <BaseSelect
      :model-value="company"
      :options="companyOptions"
      :placeholder="t('site.profile.insurance.filters.company')"
      :disabled="disabled"
      size="sm"
      root-class="!space-y-0"
      @update:model-value="emit('update:company', String($event))"
    />
  </div>
</template>
