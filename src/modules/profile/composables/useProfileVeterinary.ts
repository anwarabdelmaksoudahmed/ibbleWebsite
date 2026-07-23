import { useQuery } from '@tanstack/vue-query'
import { normalizeApiError } from '@core/api/http/errors'
import { getVeterinaryReservationsService } from '@modules/veterinary/services/reservations.service'
import { VETERINARY_QUERY_KEYS } from '@modules/veterinary/constants/query-keys'
import type { VeterinaryReservation } from '@modules/veterinary/types'
import type { SelectOption } from '@shared/components/ui/BaseSelect.vue'

const EMPTY_PAGE = {
  items: [] as VeterinaryReservation[],
  count: 0,
  totalPages: 1,
  currentPage: 1,
  itemsPerPage: 10,
}

const KNOWN_STATUSES = ['active', 'pending', 'completed', 'cancelled'] as const

/**
 * Client-side search across the current page only.
 * Status is filtered server-side via `?status=` so pagination stays accurate.
 */
export function useProfileVeterinary() {
  const { t, te } = useI18n()
  const { authenticated } = useAuth()
  const authSessionReady = useAuthSessionReady()

  const search = ref('')
  const status = ref('')
  const page = ref(1)

  const filters = computed(() => ({
    page: page.value,
    ...(status.value ? { status: status.value } : {}),
  }))

  const listQuery = useQuery({
    queryKey: computed(() => VETERINARY_QUERY_KEYS.customerReservations(filters.value)),
    queryFn: ({ signal }) =>
      getVeterinaryReservationsService().listCustomerReservations(filters.value, { signal }),
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
    if (!query) return pageData.value.items

    return pageData.value.items.filter((item) => {
      const haystack = [
        item.id,
        item.clinicName,
        item.serviceType,
        item.doctor.fullName,
        item.customerName,
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
    for (const item of pageData.value.items) {
      if (item.status) seen.add(item.status)
    }

    return [
      { value: '', label: t('site.profile.veterinary.filters.allStatuses') },
      ...Array.from(seen).map((value) => {
        const key = `site.profile.veterinary.status.${value}`
        return {
          value,
          label: te(key) ? t(key) : value,
        }
      }),
    ]
  })

  watch([search, status], () => {
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
