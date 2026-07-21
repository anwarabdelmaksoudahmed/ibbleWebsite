import type { Cart, CartStoreGroup } from '@modules/cart/types'
import type { QueryObserverResult } from '@tanstack/vue-query'

type RestoreCheckoutCartDeps = {
  refetchCart: () => Promise<QueryObserverResult<Cart, Error>>
  restoreStoreGroup: (store: CartStoreGroup) => Promise<void>
  getCart: () => Cart
}

export async function restoreCheckoutCartIfNeeded(
  snapshot: CartStoreGroup,
  deps: RestoreCheckoutCartDeps,
): Promise<boolean> {
  if (!snapshot.storeId || snapshot.products.length === 0) return false

  const refreshed = await deps.refetchCart()
  const refreshedCart = refreshed.data ?? deps.getCart()
  const storeStillInCart = refreshedCart.stores.some(
    (entry) => entry.storeId === snapshot.storeId && entry.products.length > 0,
  )

  if (storeStillInCart) return false

  await deps.restoreStoreGroup(snapshot)
  await deps.refetchCart()
  return true
}
