import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { normalizeApiError } from '@core/api/http/errors'
import { getWishlistService } from '@modules/wishlist/services/wishlist.service'
import { WISHLIST_QUERY_KEYS } from '@modules/wishlist/constants/query-keys'
import {
  createEmptyWishlist,
  withWishlistProduct,
  withoutWishlistProduct,
} from '@modules/wishlist/utils/mappers'
import type { Wishlist } from '@modules/wishlist/types'
import { ROUTES } from '@shared/constants/routes'

function resolveProductId(productId: string | number): string {
  return String(productId)
}

export function useWishlist() {
  const { t } = useI18n()
  const toast = useToast()
  const { handleError } = useApi()
  const queryClient = useQueryClient()
  const localePath = useLocalePath()
  const { authenticated, isAuthenticated } = useAuth()
  const authSessionReady = useAuthSessionReady()

  const wishlistQuery = useQuery({
    queryKey: WISHLIST_QUERY_KEYS.list(),
    queryFn: () => getWishlistService().list(),
    enabled: computed(() => import.meta.client && authSessionReady.value && authenticated.value),
    staleTime: 60_000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = normalizeApiError(error).statusCode
      if (status === 401 || status === 403) return false
      return failureCount < 2
    },
    placeholderData: createEmptyWishlist(),
  })

  const wishlist = computed<Wishlist>(() => wishlistQuery.data.value ?? createEmptyWishlist())

  type ToggleWishlistVariables = {
    productId: string
    remove: boolean
  }

  const togglePendingProductId = computed(() => {
    const vars = toggleMutation.variables.value
    return vars?.productId ?? null
  })

  function isFavourite(productId: string | number): boolean {
    return wishlist.value.productIds.has(resolveProductId(productId))
  }

  function isWishlistMutating(productId: string | number): boolean {
    if (!toggleMutation.isPending.value) return false
    const vars = toggleMutation.variables.value
    return vars != null && vars.productId === resolveProductId(productId)
  }

  async function ensureAuthenticated(): Promise<boolean> {
    if (isAuthenticated()) return true
    toast.warning(t('site.commerce.authRequired'))
    await navigateTo(localePath(ROUTES.AUTH.LOGIN))
    return false
  }

  const toggleMutation = useMutation({
    mutationFn: async ({ productId, remove }: ToggleWishlistVariables) => {
      if (remove) {
        return getWishlistService().remove(productId)
      }
      return getWishlistService().add(productId)
    },
    retry: false,
    onMutate: async ({ productId, remove }) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEYS.root })
      const previous = queryClient.getQueryData<Wishlist>(WISHLIST_QUERY_KEYS.list())
      const base = previous ?? createEmptyWishlist()
      const next = remove
        ? withoutWishlistProduct(base, productId)
        : withWishlistProduct(base, productId)

      queryClient.setQueryData<Wishlist>(WISHLIST_QUERY_KEYS.list(), next)
      return { previous, wasFavourite: remove }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WISHLIST_QUERY_KEYS.list(), context.previous)
      }
      handleError(error)
    },
    onSuccess: (result, _vars, context) => {
      // Keep optimistic cache when API returns message-only bodies (no extra GET).
      if (result.wishlist.items.length > 0 || result.wishlist.productIds.size > 0) {
        queryClient.setQueryData(WISHLIST_QUERY_KEYS.list(), result.wishlist)
      }

      const message =
        result.message ||
        (context?.wasFavourite
          ? t('site.commerce.wishlist.removeSuccess')
          : t('site.commerce.wishlist.addSuccess'))
      toast.success(message)
    },
  })

  async function addToWishlist(productId: string | number): Promise<void> {
    if (!(await ensureAuthenticated())) return
    const id = resolveProductId(productId)
    if (isWishlistMutating(id)) return
    if (isFavourite(id)) {
      toast.info(t('site.commerce.wishlist.alreadyFavourite'))
      return
    }
    await toggleMutation.mutateAsync({ productId: id, remove: false })
  }

  async function removeWishlist(productId: string | number): Promise<void> {
    if (!(await ensureAuthenticated())) return
    const id = resolveProductId(productId)
    if (isWishlistMutating(id)) return
    if (!isFavourite(id)) return
    await toggleMutation.mutateAsync({ productId: id, remove: true })
  }

  async function toggleWishlist(productId: string | number): Promise<void> {
    if (!(await ensureAuthenticated())) return
    const id = resolveProductId(productId)
    if (isWishlistMutating(id)) return
    await toggleMutation.mutateAsync({ productId: id, remove: isFavourite(id) })
  }

  return {
    wishlist,
    isLoading: computed(
      () =>
        wishlistQuery.isPending.value ||
        (wishlistQuery.isFetching.value && !wishlistQuery.isFetched.value),
    ),
    isFetching: computed(() => wishlistQuery.isFetching.value),
    isError: computed(() => wishlistQuery.isError.value),
    error: computed(() => wishlistQuery.error.value),
    togglePendingProductId,
    isFavourite,
    isWishlistMutating,
    addToWishlist,
    removeWishlist,
    toggleWishlist,
    refetch: wishlistQuery.refetch,
  }
}
