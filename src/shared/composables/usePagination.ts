import { APP_CONFIG } from '@shared/constants/app-config'

export function usePagination(initialPage = 1, initialPerPage = APP_CONFIG.DEFAULT_PAGE_SIZE) {
  const page = ref(initialPage)
  const perPage = ref(initialPerPage)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / perPage.value) || 1)
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPrevPage = computed(() => page.value > 1)
  const offset = computed(() => (page.value - 1) * perPage.value)

  const queryParams = computed(() => ({
    page: page.value,
    perPage: perPage.value,
  }))

  function setPage(newPage: number) {
    page.value = Math.max(1, Math.min(newPage, totalPages.value))
  }

  function nextPage() {
    if (hasNextPage.value) page.value++
  }

  function prevPage() {
    if (hasPrevPage.value) page.value--
  }

  function setTotal(count: number) {
    total.value = count
  }

  function reset() {
    page.value = initialPage
    perPage.value = initialPerPage
    total.value = 0
  }

  return {
    page,
    perPage,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    offset,
    queryParams,
    setPage,
    nextPage,
    prevPage,
    setTotal,
    reset,
  }
}
