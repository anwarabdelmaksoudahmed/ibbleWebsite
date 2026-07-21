import { useQuery } from '@tanstack/vue-query'
import { normalizeApiError } from '@core/api/http/errors'
import { getWalletsService } from '@modules/checkout/services/wallets.service'
import { CHECKOUT_QUERY_KEYS } from '@modules/checkout/constants/query-keys'
import type { UserWallet } from '@modules/checkout/types'

export function useCheckoutWallets() {
  const { authenticated } = useAuth()
  const authSessionReady = useAuthSessionReady()

  const walletsQuery = useQuery({
    queryKey: CHECKOUT_QUERY_KEYS.wallets(),
    queryFn: () => getWalletsService().list(),
    enabled: computed(() => import.meta.client && authSessionReady.value && authenticated.value),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = normalizeApiError(error).statusCode
      if (status === 401 || status === 403) return false
      return failureCount < 2
    },
  })

  const wallets = computed<UserWallet[]>(() => walletsQuery.data.value ?? [])
  const primaryWallet = computed(() => wallets.value[0] ?? null)

  return {
    wallets,
    primaryWallet,
    isLoading: computed(
      () =>
        authSessionReady.value &&
        authenticated.value &&
        (walletsQuery.isPending.value ||
          (walletsQuery.isFetching.value && !walletsQuery.isFetched.value)),
    ),
    isError: computed(() => walletsQuery.isError.value),
    refetch: walletsQuery.refetch,
  }
}
