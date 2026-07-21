import { useQuery } from '@tanstack/vue-query'
import { normalizeApiError } from '@core/api/http/errors'
import { getWalletsService } from '@modules/checkout/services/wallets.service'
import { CHECKOUT_QUERY_KEYS } from '@modules/checkout/constants/query-keys'
import type { WalletDetails, WalletTransaction, WalletTransactionSource } from '@modules/checkout/types'
import type { SelectOption } from '@shared/components/ui/BaseSelect.vue'

const EMPTY_PAGE = {
  items: [] as WalletTransaction[],
  count: 0,
  totalPages: 1,
  currentPage: 1,
  itemsPerPage: 10,
}

const KNOWN_STATUSES = ['completed', 'pending', 'failed', 'cancelled'] as const

export function useProfileWallet() {
  const { t, te } = useI18n()
  const { authenticated } = useAuth()
  const authSessionReady = useAuthSessionReady()

  const search = ref('')
  const status = ref('')
  const paymentSource = ref<WalletTransactionSource>('wallet')
  const page = ref(1)

  const filters = computed(() => ({
    page: page.value,
    source: paymentSource.value,
    ...(status.value ? { status: status.value } : {}),
  }))

  const walletQuery = useQuery({
    queryKey: CHECKOUT_QUERY_KEYS.walletDetails(),
    queryFn: () => getWalletsService().getDetails(),
    enabled: computed(() => import.meta.client && authSessionReady.value && authenticated.value),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const code = normalizeApiError(error).statusCode
      if (code === 401 || code === 403) return false
      return failureCount < 2
    },
  })

  const listQuery = useQuery({
    queryKey: computed(() => CHECKOUT_QUERY_KEYS.walletTransactions(filters.value)),
    queryFn: ({ signal }) =>
      getWalletsService().listTransactions(filters.value, { signal }),
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

  const wallet = computed(() => walletQuery.data.value ?? null)
  const pageData = computed(() => listQuery.data.value ?? EMPTY_PAGE)

  const items = computed(() => {
    const query = search.value.trim().toLowerCase()
    if (!query) return pageData.value.items

    return pageData.value.items.filter((item) => {
      const haystack = [
        item.id,
        item.title,
        item.transactionId,
        item.orderId,
        item.type,
        item.paymentSource,
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
      { value: '', label: t('site.profile.wallet.filters.allStatuses') },
      ...Array.from(seen).map((value) => {
        const key = `site.profile.wallet.status.${value}`
        return {
          value,
          label: te(key) ? t(key) : value,
        }
      }),
    ]
  })

  const paymentSourceOptions = computed<SelectOption[]>(() => [
    { value: 'wallet', label: t('site.profile.wallet.paymentSource.wallet') },
    { value: 'card', label: t('site.profile.wallet.paymentSource.card') },
  ])

  watch([status, paymentSource], () => {
    page.value = 1
  })

  const isWalletLoading = computed(
    () =>
      authSessionReady.value &&
      authenticated.value &&
      (walletQuery.isPending.value ||
        (walletQuery.isFetching.value && !walletQuery.isFetched.value)),
  )

  const isLoading = computed(
    () =>
      authSessionReady.value &&
      authenticated.value &&
      (listQuery.isPending.value ||
        (listQuery.isFetching.value && !listQuery.isFetched.value)),
  )

  const isFetching = computed(() => listQuery.isFetching.value)
  const isError = computed(() => walletQuery.isError.value || listQuery.isError.value)
  const isEmpty = computed(
    () => !isLoading.value && !isError.value && items.value.length === 0,
  )

  function setPage(next: number) {
    page.value = Math.max(1, Math.min(next, totalPages.value))
  }

  function resetFilters() {
    search.value = ''
    status.value = ''
    paymentSource.value = 'wallet'
    page.value = 1
  }

  async function refetch() {
    await Promise.all([walletQuery.refetch(), listQuery.refetch()])
  }

  return {
    wallet,
    search,
    status,
    paymentSource,
    page,
    items,
    totalCount,
    totalPages,
    statusOptions,
    paymentSourceOptions,
    isWalletLoading,
    isLoading,
    isFetching,
    isError,
    isEmpty,
    setPage,
    resetFilters,
    refetch,
  }
}
