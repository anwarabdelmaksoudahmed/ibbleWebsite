import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { normalizeApiError } from '@core/api/http/errors'
import { getCartService } from '@modules/cart/services/cart.service'
import { CART_QUERY_KEYS } from '@modules/cart/constants/query-keys'
import { createEmptyCart } from '@modules/cart/utils/mappers'
import type { Cart, CartItemInput } from '@modules/cart/types'
import { ROUTES } from '@shared/constants/routes'

function resolveProductId(productId: string | number): string {
  return String(productId)
}

function hasCartPayload(cart: Cart): boolean {
  return cart.stores.length > 0 || Object.keys(cart.productQuantities).length > 0
}

export function useCart() {
  const { t } = useI18n()
  const toast = useToast()
  const { handleError } = useApi()
  const queryClient = useQueryClient()
  const localePath = useLocalePath()
  const { authenticated, isAuthenticated } = useAuth()
  const authSessionReady = useAuthSessionReady()

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEYS.list(),
    queryFn: () => getCartService().getCart(),
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
    placeholderData: createEmptyCart(),
  })

  const cart = computed<Cart>(() => cartQuery.data.value ?? createEmptyCart())

  const itemCount = computed(() =>
    Object.values(cart.value.productQuantities).reduce((sum, qty) => sum + qty, 0),
  )

  const pendingProductId = computed(() => {
    const vars = addMutation.variables.value
    return vars ? resolveProductId(vars.productId) : null
  })

  function isInCart(productId: string | number): boolean {
    return (cart.value.productQuantities[resolveProductId(productId)] ?? 0) > 0
  }

  function getQuantity(productId: string | number): number {
    return cart.value.productQuantities[resolveProductId(productId)] ?? 0
  }

  function isCartMutating(productId: string | number): boolean {
    if (!addMutation.isPending.value && !quantityMutation.isPending.value) return false
    const target = resolveProductId(productId)
    const addVars = addMutation.variables.value
    const qtyVars = quantityMutation.variables.value
    return (
      (addVars != null && resolveProductId(addVars.productId) === target) ||
      (qtyVars != null && resolveProductId(qtyVars.productId) === target)
    )
  }

  async function ensureAuthenticated(): Promise<boolean> {
    if (isAuthenticated()) return true
    toast.warning(t('site.commerce.authRequired'))
    await navigateTo(localePath(ROUTES.AUTH.LOGIN))
    return false
  }

  function applyOptimisticQuantity(
    previous: Cart | undefined,
    input: CartItemInput,
    quantity: number,
  ): Cart {
    const base = previous ?? createEmptyCart()
    const productId = resolveProductId(input.productId)
    const nextQuantities = { ...base.productQuantities }

    if (quantity <= 0) {
      delete nextQuantities[productId]
    } else {
      nextQuantities[productId] = quantity
    }

    return {
      stores: base.stores,
      productQuantities: nextQuantities,
    }
  }

  const addMutation = useMutation({
    mutationFn: (input: CartItemInput) => getCartService().addToCart(input),
    retry: false,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEYS.root })
      const previous = queryClient.getQueryData<Cart>(CART_QUERY_KEYS.list())
      const quantity = Math.max(1, Math.floor(input.quantity ?? 1))
      queryClient.setQueryData<Cart>(
        CART_QUERY_KEYS.list(),
        applyOptimisticQuantity(previous, input, quantity),
      )
      return { previous }
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_QUERY_KEYS.list(), context.previous)
      }
      handleError(error)
    },
    onSuccess: (data) => {
      // Prefer server payload when present; otherwise keep optimistic cache (no extra GET).
      if (hasCartPayload(data)) {
        queryClient.setQueryData(CART_QUERY_KEYS.list(), data)
      }
      toast.success(t('site.commerce.cart.addSuccess'))
    },
  })

  const quantityMutation = useMutation({
    mutationFn: (input: CartItemInput & { quantity: number }) =>
      getCartService().updateQuantity(input),
    retry: false,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEYS.root })
      const previous = queryClient.getQueryData<Cart>(CART_QUERY_KEYS.list())
      queryClient.setQueryData<Cart>(
        CART_QUERY_KEYS.list(),
        applyOptimisticQuantity(previous, input, input.quantity),
      )
      return { previous }
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_QUERY_KEYS.list(), context.previous)
      }
      handleError(error)
    },
    onSuccess: (data) => {
      if (hasCartPayload(data) || Object.keys(data.productQuantities).length === 0) {
        queryClient.setQueryData(CART_QUERY_KEYS.list(), data)
      }
    },
  })

  async function addToCart(input: CartItemInput): Promise<void> {
    if (!(await ensureAuthenticated())) return

    const productId = resolveProductId(input.productId)
    if (!input.storeId) {
      toast.error(t('site.commerce.cart.missingStore'))
      return
    }
    if (isCartMutating(productId)) return
    if (isInCart(productId)) {
      toast.info(t('site.commerce.cart.alreadyInCart'))
      return
    }

    await addMutation.mutateAsync({
      storeId: String(input.storeId),
      productId,
      quantity: input.quantity ?? 1,
    })
  }

  async function updateQuantity(input: CartItemInput & { quantity: number }): Promise<void> {
    if (!(await ensureAuthenticated())) return
    if (isCartMutating(input.productId)) return
    await quantityMutation.mutateAsync({
      storeId: String(input.storeId),
      productId: resolveProductId(input.productId),
      quantity: input.quantity,
    })
  }

  async function increaseQuantity(input: CartItemInput): Promise<void> {
    const current = getQuantity(input.productId)
    await updateQuantity({ ...input, quantity: current + 1 })
  }

  async function decreaseQuantity(input: CartItemInput): Promise<void> {
    const current = getQuantity(input.productId)
    await updateQuantity({ ...input, quantity: Math.max(0, current - 1) })
  }

  async function removeFromCart(input: CartItemInput): Promise<void> {
    await updateQuantity({ ...input, quantity: 0 })
  }

  return {
    cart,
    itemCount,
    isLoading: computed(() => cartQuery.isPending.value),
    isFetching: computed(() => cartQuery.isFetching.value),
    isError: computed(() => cartQuery.isError.value),
    error: computed(() => cartQuery.error.value),
    pendingProductId,
    isInCart,
    getQuantity,
    isCartMutating,
    addToCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    refetch: cartQuery.refetch,
  }
}
