/** Raw API shapes — marketplace `/v1/customer/wish-lists` contract */

import type { StoreProductApiDto } from '@modules/stores/types'

export type WishlistAddApiRequest = {
  product_id: string
}

export type WishlistStoreApiDto = {
  name?: string
  url?: string
  category?: {
    name?: string
    slug?: string
  }
}

/** Wishlist list items are full product payloads; mutations may return partial shapes. */
export type WishlistItemApiDto = Partial<StoreProductApiDto> & {
  id?: string
  product_id?: string
  productId?: string
  product?: {
    id?: string
    name?: string
    featured_image?: string
  }
  store?: WishlistStoreApiDto
}

export type WishlistApiResponse =
  | WishlistItemApiDto[]
  | {
      data?: WishlistItemApiDto[] | { items?: WishlistItemApiDto[] }
      items?: WishlistItemApiDto[]
      message?: string
      success?: boolean
    }

export type WishlistMutationApiResponse = {
  data?: WishlistItemApiDto | WishlistItemApiDto[] | null
  message?: string
  success?: boolean
}
