<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { TableColumn } from './BaseTable.vue'

export type BaseDataTableProps<T extends Record<string, unknown>> = {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  page?: number
  totalPages?: number
  searchable?: boolean
  searchPlaceholder?: string
}

const props = withDefaults(defineProps<BaseDataTableProps<T>>(), {
  loading: false,
  page: 1,
  totalPages: 1,
  searchable: false,
  searchPlaceholder: 'Search...',
})

const emit = defineEmits<{
  'update:page': [page: number]
  search: [query: string]
  sort: [key: string]
}>()

const searchQuery = ref('')

watch(searchQuery, (value: string) => emit('search', value))
</script>

<template>
  <div class="space-y-4">
    <div v-if="searchable || $slots.toolbar" class="flex items-center justify-between gap-4">
      <BaseSearchInput
        v-if="searchable"
        v-model="searchQuery"
        :placeholder="searchPlaceholder"
        size="sm"
        root-class="max-w-xs !space-y-0"
      />
      <slot name="toolbar" />
    </div>

    <BaseTable :columns="columns" :data="data" :loading="loading" @sort="emit('sort', $event)">
      <template v-for="col in columns" :key="col.key" #[`cell-${col.key}`]="slotProps">
        <slot :name="`cell-${col.key}`" v-bind="slotProps" />
      </template>
    </BaseTable>

    <div v-if="totalPages > 1" class="flex justify-center">
      <BasePagination :page="page" :total-pages="totalPages" @update:page="emit('update:page', $event)" />
    </div>
  </div>
</template>
