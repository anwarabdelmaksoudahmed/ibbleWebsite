import { useQuery } from '@tanstack/vue-query'
import { normalizeApiError } from '@core/api/http/errors'
import { getInsuranceService } from '@modules/insurance/services/insurance.service'
import { INSURANCE_QUERY_KEYS } from '@modules/insurance/constants/query-keys'
import type { UserInsurance, UserInsuranceStatus } from '@modules/insurance/types'
import type { SelectOption } from '@shared/components/ui/BaseSelect.vue'

const EMPTY_PAGE = {
  items: [] as UserInsurance[],
  count: 0,
  totalPages: 1,
  currentPage: 1,
  itemsPerPage: 5,
}

/**
 * Search-by-id is paused until the list endpoint supports it.
 * Keep the UI field disabled and omit `id` from the request.
 */
const SEARCH_FILTER_ENABLED = false

export function useProfileInsurance() {
  const { t } = useI18n()
  const { authenticated } = useAuth()
  const authSessionReady = useAuthSessionReady()

  const search = ref('')
  const company = ref('')
  const status = ref<'' | UserInsuranceStatus>('')
  const page = ref(1)

  const filters = computed(() => ({
    ...(SEARCH_FILTER_ENABLED && search.value.trim()
      ? { id: search.value.trim() }
      : {}),
    company: company.value || undefined,
    status: status.value || undefined,
    page: page.value,
  }))

  const listQuery = useQuery({
    queryKey: computed(() => INSURANCE_QUERY_KEYS.userList(filters.value)),
    queryFn: ({ signal }) =>
      getInsuranceService().listUserInsurances(filters.value, { signal }),
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
  const items = computed(() => pageData.value.items)
  const totalCount = computed(() => pageData.value.count)
  const totalPages = computed(() => pageData.value.totalPages)

  const companyOptions = ref<SelectOption[]>([])

  watch(
    items,
    (next) => {
      const known = new Map(
        companyOptions.value.map((option) => [String(option.value), option.label]),
      )
      for (const item of next) {
        if (!item.provider.id) continue
        known.set(String(item.provider.id), item.provider.name)
      }
      companyOptions.value = Array.from(known.entries())
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label))
    },
    { immediate: true },
  )

  const statusOptions = computed<SelectOption[]>(() => [
    { value: '', label: t('site.profile.insurance.filters.allStatuses') },
    { value: 'active', label: t('site.profile.insurance.status.active') },
    { value: 'expired', label: t('site.profile.insurance.status.expired') },
  ])

  const companySelectOptions = computed<SelectOption[]>(() => [
    { value: '', label: t('site.profile.insurance.filters.allCompanies') },
    ...companyOptions.value,
  ])

  watch([search, company, status], () => {
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
    company.value = ''
    status.value = ''
    page.value = 1
  }

  return {
    search,
    searchEnabled: SEARCH_FILTER_ENABLED,
    company,
    status,
    page,
    items,
    totalCount,
    totalPages,
    statusOptions,
    companySelectOptions,
    isLoading,
    isFetching,
    isError,
    isEmpty,
    setPage,
    resetFilters,
    refetch: listQuery.refetch,
  }
}
