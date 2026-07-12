import type { FilterRecord } from '@shared/composables/useFilters'
import type { TableColumn } from '@shared/components/ui/BaseTable.vue'

export type CrudMode = 'create' | 'edit' | null

export type CrudMessages = {
  createSuccess?: string
  updateSuccess?: string
  deleteSuccess?: string
  deleteConfirmTitle?: string
  deleteConfirmMessage?: string
}

export type CrudListFetcher<TItem> = (
  params: Record<string, unknown>,
) => Promise<{ items: TItem[]; total: number }>

export type UseCrudResourceOptions<
  TItem extends Record<string, unknown>,
  TCreate = Partial<TItem>,
  TUpdate = Partial<TItem>,
  TFilters extends FilterRecord = FilterRecord,
> = {
  /** Unique Vue Query key prefix for this resource */
  queryKey: string | string[]
  list: CrudListFetcher<TItem>
  getById?: (id: string | number) => Promise<TItem>
  create?: (payload: TCreate) => Promise<TItem>
  update?: (id: string | number, payload: TUpdate) => Promise<TItem>
  remove?: (id: string | number) => Promise<void>
  /** Field used as the resource id (default: `id`) */
  idKey?: keyof TItem & string
  initialFilters?: TFilters
  initialPage?: number
  initialPerPage?: number
  messages?: CrudMessages
  /** Label used in delete confirm dialog */
  getItemLabel?: (item: TItem) => string
  enabled?: MaybeRefOrGetter<boolean>
}

export type CrudListPageProps<T extends Record<string, unknown>> = {
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
}
