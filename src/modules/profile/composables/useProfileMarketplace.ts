import { useQuery } from '@tanstack/vue-query'
import { normalizeApiError } from '@core/api/http/errors'
import { getOrdersService } from '@modules/checkout/services/orders.service'
import { CHECKOUT_QUERY_KEYS } from '@modules/checkout/constants/query-keys'
import type { CustomerOrder } from '@modules/checkout/types'
import type { SelectOption } from '@shared/components/ui/BaseSelect.vue'

const EMPTY_PAGE = {
  items: [] as CustomerOrder[],
  count: 0,
  totalPages: 1,
  currentPage: 1,
  itemsPerPage: 10,
}

const KNOWN_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
] as const

export function useProfileMarketplace() {
  const { t, te } = useI18n()
  const { authenticated } = useAuth()
  const authSessionReady = useAuthSessionReady()

  const search = ref('')
  const status = ref('')
  const page = ref(1)

  const filters = computed(() => ({
    page: page.value,
  }))

  const listQuery = useQuery({
    queryKey: computed(() => CHECKOUT_QUERY_KEYS.customerOrders(filters.value)),
    queryFn: ({ signal }) =>
      getOrdersService().listCustomerOrders(filters.value, { signal }),
    enabled: computed(() => import.meta.client && authSessionReady.value && authenticated.value),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
    retry: (failureCount, error) => {
      const code = normalizeApiError(error).statusCode
      if (code === 401 || code === 403) return false
      return failureCount < 2
    },
  })

  const pageData = computed(() => listQuery.data.value ?? EMPTY_PAGE)

  const items = computed(() => {
    const query = search.value.trim().toLowerCase()
    const statusFilter = status.value

    return pageData.value.items.filter((order) => {
      if (statusFilter && order.status !== statusFilter) return false
      if (!query) return true

      const haystack = [
        order.orderNum,
        order.store.name,
        ...order.products.map((product) => product.name),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  })

  const totalCount = computed(() => pageData.value.count)
  const totalPages = computed(() => pageData.value.totalPages)

  const statusOptions = computed<SelectOption[]>(() => {
    const seen = new Set<string>(KNOWN_STATUSES)
    for (const order of pageData.value.items) {
      if (order.status) seen.add(order.status)
    }

    return [
      { value: '', label: t('site.profile.marketplace.filters.allStatuses') },
      ...Array.from(seen).map((value) => {
        const key = `site.profile.marketplace.status.${value}`
        return {
          value,
          label: te(key) ? t(key) : value,
        }
      }),
    ]
  })

  watch(status, () => {
    page.value = 1
  })

  const isLoading = computed(
    () =>
      authSessionReady.value &&
      authenticated.value &&
      (listQuery.isPending.value ||
        (listQuery.isFetching.value && !listQuery.isFetched.value)),
  )

  const isFetching = computed(() => listQuery.isFetching.value)
  const isError = computed(() => listQuery.isError.value)
  const isEmpty = computed(
    () => !isLoading.value && !isError.value && items.value.length === 0,
  )

  function setPage(next: number) {
    page.value = Math.max(1, Math.min(next, totalPages.value))
  }

  function resetFilters() {
    search.value = ''
    status.value = ''
    page.value = 1
  }

  return {
    search,
    status,
    page,
    items,
    totalCount,
    totalPages,
    statusOptions,
    isLoading,
    isFetching,
    isError,
    isEmpty,
    setPage,
    resetFilters,
    refetch: listQuery.refetch,
  }
}
