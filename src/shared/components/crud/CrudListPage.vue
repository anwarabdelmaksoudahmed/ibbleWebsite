<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { TableColumn } from '@shared/components/ui/BaseTable.vue'

const props = withDefaults(
  defineProps<{
    title: string
    columns: TableColumn<T>[]
    data: T[]
    loading?: boolean
    page?: number
    totalPages?: number
    searchable?: boolean
    searchPlaceholder?: string
    search?: string
    createLabel?: string
    emptyMessage?: string
    canCreate?: boolean
    canEdit?: boolean
    canDelete?: boolean
  }>(),
  {
    loading: false,
    page: 1,
    totalPages: 1,
    searchable: true,
    searchPlaceholder: undefined,
    search: '',
    createLabel: undefined,
    emptyMessage: undefined,
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
)

const emit = defineEmits<{
  'update:page': [page: number]
  'update:search': [query: string]
  create: []
  edit: [row: T]
  delete: [row: T]
  sort: [key: string]
}>()

const { t } = useI18n()

const searchModel = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value),
})

const resolvedCreateLabel = computed(() => props.createLabel ?? t('common.create'))
const resolvedEmptyMessage = computed(() => props.emptyMessage ?? t('common.noResults'))
const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder ?? t('common.search'))

const showActions = computed(() => props.canEdit || props.canDelete)

type LooseColumn = { key: string; label: string; sortable?: boolean; width?: string }

const tableColumns = computed<LooseColumn[]>(() => {
  const cols: LooseColumn[] = props.columns.map((col) => ({
    key: String(col.key),
    label: col.label,
    sortable: col.sortable,
    width: col.width,
  }))

  if (showActions.value) {
    cols.push({ key: '__actions', label: t('common.actions'), width: '8rem' })
  }

  return cols
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
        <slot name="subtitle" />
      </div>

      <div class="flex items-center gap-3">
        <slot name="actions" />
        <BaseButton v-if="canCreate" @click="emit('create')">
          <Icon name="lucide:plus" class="size-4" />
          {{ resolvedCreateLabel }}
        </BaseButton>
      </div>
    </div>

    <slot name="filters" />

    <div class="space-y-4">
      <div v-if="searchable || $slots.toolbar" class="flex items-center justify-between gap-4">
        <BaseInput
          v-if="searchable"
          v-model="searchModel"
          :placeholder="resolvedSearchPlaceholder"
          class="max-w-xs"
        />
        <slot name="toolbar" />
      </div>

      <BaseTable
        :columns="tableColumns as TableColumn<Record<string, unknown>>[]"
        :data="data as Record<string, unknown>[]"
        :loading="loading"
        :empty-message="resolvedEmptyMessage"
        @sort="emit('sort', $event)"
      >
        <template
          v-for="col in tableColumns"
          :key="col.key"
          #[`cell-${col.key}`]="slotProps"
        >
          <template v-if="col.key === '__actions'">
            <slot name="actions-cell" :row="slotProps.row as T">
              <div class="flex items-center gap-1">
                <BaseButton
                  v-if="canEdit"
                  variant="ghost"
                  size="sm"
                  :aria-label="t('common.edit')"
                  @click="emit('edit', slotProps.row as T)"
                >
                  <Icon name="lucide:pencil" class="size-4" />
                </BaseButton>
                <BaseButton
                  v-if="canDelete"
                  variant="ghost"
                  size="sm"
                  :aria-label="t('common.delete')"
                  @click="emit('delete', slotProps.row as T)"
                >
                  <Icon name="lucide:trash-2" class="size-4 text-red-600" />
                </BaseButton>
              </div>
            </slot>
          </template>
          <slot v-else :name="`cell-${col.key}`" v-bind="{ ...slotProps, row: slotProps.row as T }" />
        </template>
      </BaseTable>

      <div v-if="totalPages > 1" class="flex justify-center">
        <BasePagination
          :page="page"
          :total-pages="totalPages"
          @update:page="emit('update:page', $event)"
        />
      </div>
    </div>

    <slot />
  </div>
</template>
