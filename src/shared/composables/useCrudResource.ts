import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryReturnType,
} from '@tanstack/vue-query'
import { toValue } from 'vue'
import { normalizeApiError } from '@core/api/http/errors'
import type { FilterRecord } from '@shared/composables/useFilters'
import type { CrudMode, UseCrudResourceOptions } from '@shared/types/crud'

function toQueryKey(key: string | string[]): string[] {
  return Array.isArray(key) ? key : [key]
}

/**
 * Reusable admin CRUD composable: list (search + filters + pagination) + create/update/delete.
 * Pair with CrudListPage / CrudFormModal for UI.
 */
export function useCrudResource<
  TItem extends Record<string, unknown>,
  TCreate = Partial<TItem>,
  TUpdate = Partial<TItem>,
  TFilters extends FilterRecord = FilterRecord,
>(options: UseCrudResourceOptions<TItem, TCreate, TUpdate, TFilters>) {
  const {
    queryKey,
    list,
    create,
    update,
    remove,
    idKey = 'id' as keyof TItem & string,
    initialFilters = {} as TFilters,
    initialPage = 1,
    initialPerPage,
    messages = {},
    getItemLabel,
    enabled = true,
  } = options

  const { t } = useI18n()
  const toast = useToast()
  const dialog = useDialog()
  const queryClient = useQueryClient()
  const { handleError } = useApi()

  const pagination = usePagination(initialPage, initialPerPage)
  const searchState = useSearch()
  const filterState = useFilters(initialFilters)

  const mode = ref<CrudMode>(null)
  const selectedItem = ref<TItem | null>(null) as Ref<TItem | null>
  const isFormOpen = computed({
    get: () => mode.value !== null,
    set: (open: boolean) => {
      if (!open) closeForm()
    },
  })

  const listParams = computed(() => ({
    ...pagination.queryParams.value,
    ...searchState.queryParams.value,
    ...filterState.queryParams.value,
  }))

  const resourceKey = toQueryKey(queryKey)

  const listQuery = useQuery({
    queryKey: computed(() => [...resourceKey, 'list', listParams.value]),
    queryFn: () => list(listParams.value),
    enabled: computed(() => toValue(enabled)),
  }) as UseQueryReturnType<{ items: TItem[]; total: number }, Error>

  watch(
    () => listQuery.data.value?.total,
    (total) => {
      if (typeof total === 'number') pagination.setTotal(total)
    },
    { immediate: true },
  )

  watch(searchState.debouncedSearch, () => {
    pagination.setPage(1)
  })

  watch(
    () => filterState.filters.value,
    () => {
      pagination.setPage(1)
    },
    { deep: true },
  )

  const items = computed(() => listQuery.data.value?.items ?? [])
  const isLoading = computed(() => listQuery.isPending.value || listQuery.isFetching.value)
  const isError = computed(() => listQuery.isError.value)
  const error = computed(() =>
    listQuery.error.value ? normalizeApiError(listQuery.error.value) : null,
  )

  function invalidateList() {
    return queryClient.invalidateQueries({ queryKey: resourceKey })
  }

  const createMutation = useMutation({
    mutationFn: (payload: TCreate) => {
      if (!create) throw new Error('create handler is not configured')
      return create(payload)
    },
    onSuccess: async () => {
      toast.success(messages.createSuccess ?? t('crud.createSuccess'))
      closeForm()
      await invalidateList()
    },
    onError: (err) => handleError(err),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: TUpdate }) => {
      if (!update) throw new Error('update handler is not configured')
      return update(id, payload)
    },
    onSuccess: async () => {
      toast.success(messages.updateSuccess ?? t('crud.updateSuccess'))
      closeForm()
      await invalidateList()
    },
    onError: (err) => handleError(err),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => {
      if (!remove) throw new Error('remove handler is not configured')
      return remove(id)
    },
    onSuccess: async () => {
      toast.success(messages.deleteSuccess ?? t('crud.deleteSuccess'))
      await invalidateList()
    },
    onError: (err) => handleError(err),
  })

  function openCreate() {
    selectedItem.value = null
    mode.value = 'create'
  }

  function openEdit(item: TItem) {
    selectedItem.value = item
    mode.value = 'edit'
  }

  function closeForm() {
    mode.value = null
    selectedItem.value = null
  }

  function getItemId(item: TItem): string | number {
    return item[idKey] as string | number
  }

  async function submitForm(payload: TCreate | TUpdate) {
    if (mode.value === 'create') {
      await createMutation.mutateAsync(payload as TCreate)
      return
    }

    if (mode.value === 'edit' && selectedItem.value) {
      await updateMutation.mutateAsync({
        id: getItemId(selectedItem.value),
        payload: payload as TUpdate,
      })
    }
  }

  async function confirmDelete(item: TItem) {
    if (!remove) return

    const label = getItemLabel?.(item)
    const confirmed = await dialog.confirm({
      title: messages.deleteConfirmTitle ?? t('crud.deleteConfirmTitle'),
      message:
        messages.deleteConfirmMessage ??
        (label ? t('crud.deleteConfirmNamed', { name: label }) : t('crud.deleteConfirmMessage')),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      variant: 'danger',
    })

    if (!confirmed) return

    await deleteMutation.mutateAsync(getItemId(item))
  }

  const isMutating = computed(
    () =>
      createMutation.isPending.value ||
      updateMutation.isPending.value ||
      deleteMutation.isPending.value,
  )

  const isSubmitting = computed(
    () => createMutation.isPending.value || updateMutation.isPending.value,
  )

  return {
    // list state
    items,
    isLoading,
    isError,
    error,
    listQuery,
    refetch: listQuery.refetch,

    // search / filters / pagination
    search: searchState.search,
    debouncedSearch: searchState.debouncedSearch,
    isSearching: searchState.isSearching,
    clearSearch: searchState.clear,
    filters: filterState.filters,
    setFilter: filterState.setFilter,
    removeFilter: filterState.removeFilter,
    resetFilters: filterState.reset,
    activeFilterCount: filterState.activeFilterCount,
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
    setPage: pagination.setPage,
    setTotal: pagination.setTotal,

    // form state
    mode,
    selectedItem,
    isFormOpen,
    openCreate,
    openEdit,
    closeForm,
    submitForm,
    confirmDelete,
    getItemId,

    // mutation flags
    isMutating,
    isSubmitting,
    isDeleting: computed(() => deleteMutation.isPending.value),
    invalidateList,
  }
}
