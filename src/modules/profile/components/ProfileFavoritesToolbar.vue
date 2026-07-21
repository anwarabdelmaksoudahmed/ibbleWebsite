<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    search: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:search': [value: string]
  search: [query: string, signal: AbortSignal]
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="rounded-2xl border border-ibbil-green/10 bg-white p-3 shadow-[0_8px_24px_-20px_rgba(45,83,61,0.4)] dark:border-ibbil-green/20 dark:bg-surface-elevated sm:p-4"
    role="search"
    :aria-label="t('site.profile.favorites.filters.label')"
  >
    <BaseSearchInput
      :model-value="props.search"
      :placeholder="t('site.profile.favorites.filters.searchPlaceholder')"
      :aria-label="t('site.profile.favorites.filters.searchPlaceholder')"
      :disabled="props.disabled"
      size="sm"
      root-class="!space-y-0"
      @update:model-value="emit('update:search', $event)"
      @search="(query, signal) => emit('search', query, signal)"
    />
  </div>
</template>
