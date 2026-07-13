export type CartProduct = {
  id: string
  quantity: number
  name: string
  image: string
  price: number | null
  finalPrice: number | null
}

export type CartStoreGroup = {
  storeId: string
  storeName: string
  storeLogo: string
  storeSlug: string
  products: CartProduct[]
}

export type Cart = {
  stores: CartStoreGroup[]
  /** Flat map of productId → quantity for O(1) lookups */
  productQuantities: Record<string, number>
}

export type CartItemInput = {
  storeId: string
  productId: string
  quantity?: number
}

export type CartState = {
  /** Client-only UI flags — server cart lives in Vue Query */
  isDrawerOpen: boolean
}
