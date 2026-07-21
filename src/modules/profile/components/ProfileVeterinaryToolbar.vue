<script setup lang="ts">
import type { SelectOption } from '@shared/components/ui/BaseSelect.vue'

withDefaults(
  defineProps<{
    search: string
    status: string | number
    statusOptions: SelectOption[]
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:search': [value: string]
  'update:status': [value: string]
  search: [query: string, signal: AbortSignal]
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="grid gap-3 rounded-2xl border border-ibbil-green/10 bg-white p-3 shadow-[0_8px_24px_-20px_rgba(45,83,61,0.4)] dark:border-ibbil-green/20 dark:bg-surface-elevated sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] sm:gap-3 sm:p-4"
    role="search"
    :aria-label="t('site.profile.veterinary.filters.label')"
  >
    <BaseSearchInput
      :model-value="search"
      :placeholder="t('site.profile.veterinary.filters.searchPlaceholder')"
      :aria-label="t('site.profile.veterinary.filters.searchPlaceholder')"
      :disabled="disabled"
      size="sm"
      root-class="!space-y-0"
      @update:model-value="emit('update:search', $event)"
      @search="(query, signal) => emit('search', query, signal)"
    />

    <BaseSelect
      :model-value="status"
      :options="statusOptions"
      :placeholder="t('site.profile.veterinary.filters.status')"
      :disabled="disabled"
      size="sm"
      root-class="!space-y-0"
      @update:model-value="emit('update:status', String($event))"
    />
  </div>
</template>
