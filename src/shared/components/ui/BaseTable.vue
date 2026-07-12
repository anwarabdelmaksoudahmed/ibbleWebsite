<script setup lang="ts" generic="T extends Record<string, unknown>">
export type TableColumn<T> = {
  key: keyof T & string
  label: string
  sortable?: boolean
  width?: string
}

export type BaseTableProps<T extends Record<string, unknown>> = {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
}

const props = withDefaults(defineProps<BaseTableProps<T>>(), {
  loading: false,
  emptyMessage: 'No data available',
})

const emit = defineEmits<{ sort: [key: string] }>()
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-border">
    <table class="w-full text-sm">
      <thead class="border-b border-border bg-surface-muted">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="col.width ? { width: col.width } : undefined"
            class="px-4 py-3 text-left font-medium text-foreground-muted"
            :class="col.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''"
            @click="col.sortable && emit('sort', col.key)"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-4 py-8 text-center">
            <BaseLoader />
          </td>
        </tr>
        <tr v-else-if="data.length === 0">
          <td :colspan="columns.length" class="px-4 py-8">
            <BaseEmptyState :title="emptyMessage" />
          </td>
        </tr>
        <tr
          v-for="(row, index) in data"
          v-else
          :key="index"
          class="border-b border-border last:border-0 hover:bg-surface-muted/50"
        >
          <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-foreground">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
