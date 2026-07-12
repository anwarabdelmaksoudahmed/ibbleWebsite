import { APP_CONFIG } from '@shared/constants/app-config'
import { debounce } from '@shared/utils/debounce'

export function useSearch(initialValue = '', debounceMs = APP_CONFIG.DEBOUNCE_MS) {
  const search = ref(initialValue)
  const debouncedSearch = ref(initialValue)
  const isSearching = ref(false)

  const updateDebounced = debounce((value: string) => {
    debouncedSearch.value = value
    isSearching.value = false
  }, debounceMs)

  watch(search, (value) => {
    isSearching.value = true
    updateDebounced(value)
  })

  function clear() {
    search.value = ''
    debouncedSearch.value = ''
    isSearching.value = false
  }

  const queryParams = computed(() => ({
    search: debouncedSearch.value || undefined,
  }))

  return {
    search,
    debouncedSearch,
    isSearching,
    queryParams,
    clear,
  }
}
