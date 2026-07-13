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
    staleTime: 30_000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = normalizeApiError(error).statusCode
      if (status === 401 || status === 403) return false
      return failureCount < 2
    },
  })

  const cart = computed<Cart>(() => cartQuery.data.value ?? createEmptyCart())

  const itemCount = computed(() =>
    Object.values(cart.value.productQuantities).reduce((sum, qty) => sum + qty, 0),
  )

  const isInitialLoading = computed(
    () =>
      authSessionReady.value &&
      authenticated.value &&
      (cartQuery.isPending.value || (cartQuery.isFetching.value && !cartQuery.isFetched.value)),
  )

  const pendingProductId = computed(() => {
    const addVars = addMutation.variables.value
    const qtyVars = quantityMutation.variables.value
    const removeVars = removeMutation.variables.value
    const id = addVars?.productId ?? qtyVars?.productId ?? removeVars?.productId
    return id != null ? resolveProductId(id) : null
  })

  function isInCart(productId: string | number): boolean {
    return (cart.value.productQuantities[resolveProductId(productId)] ?? 0) > 0
  }

  function getQuantity(productId: string | number): number {
    return cart.value.productQuantities[resolveProductId(productId)] ?? 0
  }

  function isCartMutating(productId: string | number): boolean {
    const pending =
      addMutation.isPending.value ||
      quantityMutation.isPending.value ||
      removeMutation.isPending.value
    if (!pending) return false

    const target = resolveProductId(productId)
    const addVars = addMutation.variables.value
    const qtyVars = quantityMutation.variables.value
    const removeVars = removeMutation.variables.value
    return (
      (addVars != null && resolveProductId(addVars.productId) === target) ||
      (qtyVars != null && resolveProductId(qtyVars.productId) === target) ||
      (removeVars != null && resolveProductId(removeVars.productId) === target)
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
    const storeId = String(input.storeId)
    const nextQuantities = { ...base.productQuantities }

    if (quantity <= 0) {
      delete nextQuantities[productId]
    } else {
      nextQuantities[productId] = quantity
    }

    const stores = base.stores
      .map((store) => {
        if (store.storeId !== storeId) return store

        const products =
          quantity <= 0
            ? store.products.filter((p) => p.id !== productId)
            : store.products.map((p) => (p.id === productId ? { ...p, quantity } : p))

        return { ...store, products }
      })
      .filter((store) => store.products.length > 0)

    return {
      stores,
      productQuantities: nextQuantities,
    }
  }

  async function syncCartAfterMutation(hasPayload: boolean, cartData?: Cart): Promise<void> {
    if (hasPayload && cartData && hasCartPayload(cartData)) {
      queryClient.setQueryData(CART_QUERY_KEYS.list(), cartData)
      return
    }
    await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.root })
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
    onSuccess: async (result) => {
      await syncCartAfterMutation(result.hasPayload, result.cart)
      toast.success(result.message || t('site.commerce.cart.addSuccess'))
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
    onSuccess: async (result) => {
      await syncCartAfterMutation(result.hasPayload, result.cart)
    },
  })

  const removeMutation = useMutation({
    mutationFn: (input: CartItemInput) => getCartService().removeFromCart(input),
    retry: false,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEYS.root })
      const previous = queryClient.getQueryData<Cart>(CART_QUERY_KEYS.list())
      queryClient.setQueryData<Cart>(
        CART_QUERY_KEYS.list(),
        applyOptimisticQuantity(previous, input, 0),
      )
      return { previous }
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_QUERY_KEYS.list(), context.previous)
      }
      handleError(error)
    },
    onSuccess: async (result) => {
      await syncCartAfterMutation(result.hasPayload, result.cart)
      toast.success(result.message || t('site.commerce.cart.removeSuccess'))
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
    const quantity = Math.max(1, Math.floor(input.quantity))
    await quantityMutation.mutateAsync({
      storeId: String(input.storeId),
      productId: resolveProductId(input.productId),
      quantity,
    })
  }

  async function increaseQuantity(input: CartItemInput): Promise<void> {
    const current = getQuantity(input.productId)
    await updateQuantity({ ...input, quantity: current + 1 })
  }

  async function decreaseQuantity(input: CartItemInput): Promise<void> {
    const current = getQuantity(input.productId)
    if (current <= 1) {
      toast.info(t('site.commerce.cart.minQuantity'))
      return
    }
    await updateQuantity({ ...input, quantity: current - 1 })
  }

  async function removeFromCart(input: CartItemInput): Promise<void> {
    if (!(await ensureAuthenticated())) return
    if (isCartMutating(input.productId)) return
    await removeMutation.mutateAsync({
      storeId: String(input.storeId),
      productId: resolveProductId(input.productId),
    })
  }

  return {
    cart,
    itemCount,
    isLoading: isInitialLoading,
    isFetching: computed(() => cartQuery.isFetching.value),
    isFetched: computed(() => cartQuery.isFetched.value),
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
