import type { StoreProduct } from '@modules/stores/types'

export type WishlistItem = {
  id: string
  productId: string
  name: string
  image: string
  product: StoreProduct
  storeName: string
  storeSlug: string
  categorySlug: string
}

export type Wishlist = {
  items: WishlistItem[]
  /** O(1) membership checks */
  productIds: Set<string>
}

export type WishlistState = {
  /** Client-only UI flags — server wishlist lives in Vue Query */
  isDrawerOpen: boolean
}
