export type FilterValue = string | number | boolean | null | undefined
export type FilterRecord = Record<string, FilterValue | FilterValue[]>

export function useFilters<T extends FilterRecord>(initialFilters: T) {
  const filters = ref<T>({ ...initialFilters }) as Ref<T>
  const activeFilterCount = computed(() =>
    Object.values(filters.value).filter((v) => v !== null && v !== undefined && v !== '').length,
  )

  function setFilter<K extends keyof T>(key: K, value: T[K]) {
    filters.value = { ...filters.value, [key]: value }
  }

  function removeFilter(key: keyof T) {
    const updated = { ...filters.value }
    updated[key] = initialFilters[key]
    filters.value = updated
  }

  function reset() {
    filters.value = { ...initialFilters }
  }

  const queryParams = computed(() => {
    const params: Record<string, string> = {}
    for (const [key, value] of Object.entries(filters.value)) {
      if (value !== null && value !== undefined && value !== '') {
        params[key] = Array.isArray(value) ? value.join(',') : String(value)
      }
    }
    return params
  })

  return {
    filters,
    activeFilterCount,
    setFilter,
    removeFilter,
    reset,
    queryParams,
  }
}
