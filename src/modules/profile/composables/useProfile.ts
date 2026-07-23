import { dayjs } from '@shared/utils/formatters'
import { useQuery } from '@tanstack/vue-query'
import { normalizeApiError } from '@core/api/http/errors'
import { PROFILE_SIDEBAR_NAV } from '@modules/profile/constants/nav'
import { getInsuranceService } from '@modules/insurance/services/insurance.service'
import { INSURANCE_QUERY_KEYS } from '@modules/insurance/constants/query-keys'
import { getVeterinaryReservationsService } from '@modules/veterinary/services/reservations.service'
import { VETERINARY_QUERY_KEYS } from '@modules/veterinary/constants/query-keys'
import type { ProfileStat, ProfileStatKey } from '@modules/profile/types'

const STAT_META: Array<{
  key: ProfileStatKey
  icon: string
  accent: ProfileStat['accent']
}> = [
  { key: 'orders', icon: 'lucide:shopping-bag', accent: 'green' },
  { key: 'favorites', icon: 'lucide:heart', accent: 'gold' },
  { key: 'wallet', icon: 'lucide:wallet', accent: 'green' },
  { key: 'insurance', icon: 'lucide:shield-check', accent: 'green' },
  { key: 'transportation', icon: 'lucide:truck', accent: 'neutral' },
  { key: 'veterinary', icon: 'lucide:stethoscope', accent: 'green' },
  { key: 'marketplace', icon: 'lucide:store', accent: 'gold' },
  { key: 'bookings', icon: 'lucide:calendar-check', accent: 'green' },
]

export function useProfile() {
  const { t, n } = useI18n()
  const { user, logout, authenticated } = useAuth()
  const authSessionReady = useAuthSessionReady()
  const { primaryWallet, isLoading: walletLoading, isError: walletError, refetch: refetchWallet } =
    useCheckoutWallets()
  const { wishlist, isLoading: wishlistLoading, isError: wishlistError, refetch: refetchWishlist } =
    useWishlist()

  const insuranceQuery = useQuery({
    queryKey: INSURANCE_QUERY_KEYS.userList({ page: 1 }),
    queryFn: () => getInsuranceService().listUserInsurances({ page: 1 }),
    enabled: computed(() => import.meta.client && authSessionReady.value && authenticated.value),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = normalizeApiError(error).statusCode
      if (status === 401 || status === 403) return false
      return failureCount < 2
    },
  })

  const veterinaryQuery = useQuery({
    queryKey: VETERINARY_QUERY_KEYS.customerReservations({ page: 1 }),
    queryFn: () => getVeterinaryReservationsService().listCustomerReservations({ page: 1 }),
    enabled: computed(() => import.meta.client && authSessionReady.value && authenticated.value),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = normalizeApiError(error).statusCode
      if (status === 401 || status === 403) return false
      return failureCount < 2
    },
  })

  const stats = computed<ProfileStat[]>(() =>
    STAT_META.map((meta) => {
      let value: number | null = null

      if (meta.key === 'favorites') {
        value = wishlist.value.productIds.size
      } else if (meta.key === 'wallet') {
        value = primaryWallet.value?.balance ?? null
      } else if (meta.key === 'insurance') {
        value = insuranceQuery.data.value?.count ?? null
      } else if (meta.key === 'veterinary') {
        value = veterinaryQuery.data.value?.count ?? null
      }

      return {
        key: meta.key,
        icon: meta.icon,
        accent: meta.accent,
        value,
      }
    }),
  )

  const lastLoginLabel = computed(() => {
    const source = user.value?.updatedAt
    if (!source) return t('site.profile.lastLogin.unknown')

    try {
      return t('site.profile.lastLogin.value', {
        date: dayjs(source).format('YYYY/M/D'),
      })
    } catch {
      return t('site.profile.lastLogin.unknown')
    }
  })

  const isLoading = computed(
    () =>
      authSessionReady.value &&
      authenticated.value &&
      (walletLoading.value ||
        wishlistLoading.value ||
        insuranceQuery.isPending.value ||
        veterinaryQuery.isPending.value ||
        (insuranceQuery.isFetching.value && !insuranceQuery.isFetched.value) ||
        (veterinaryQuery.isFetching.value && !veterinaryQuery.isFetched.value)),
  )

  const isError = computed(
    () =>
      walletError.value ||
      wishlistError.value ||
      insuranceQuery.isError.value ||
      veterinaryQuery.isError.value,
  )

  async function refetch() {
    await Promise.all([
      refetchWallet(),
      refetchWishlist(),
      insuranceQuery.refetch(),
      veterinaryQuery.refetch(),
    ])
  }

  function formatStatValue(key: ProfileStatKey, value: number | null): string {
    if (value == null) return '—'
    if (key === 'wallet') {
      return n(value, { maximumFractionDigits: 0 })
    }
    return n(value)
  }

  return {
    user,
    authenticated,
    logout,
    stats,
    formatStatValue,
    lastLoginLabel,
    sidebarNav: PROFILE_SIDEBAR_NAV,
    isLoading,
    isError,
    refetch,
  }
}
