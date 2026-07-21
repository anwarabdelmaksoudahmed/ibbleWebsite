/** Raw API shapes — marketplace `/v1/carts` contract */

export type CartStoreInfoApiDto = {
  id: string
  name?: string
  logo?: string
  url?: string
}

export type CartStoreProductApiDto = {
  id: string
  quantityInCart: number
  name?: string
  featured_image?: string
  price?: number
  final_price?: number
}

/** Grouped cart shape (legacy / mutation-friendly). */
export type CartStoreGroupApiDto = {
  store_info: CartStoreInfoApiDto
  store_products: CartStoreProductApiDto[]
}

/**
 * Flat cart line returned by GET `/v1/carts` (`data: CartLineItemApiDto[]`).
 * Each entry embeds store + product; the mapper groups these by store.
 */
export type CartLineItemApiDto = {
  id: string
  qty?: string | number
  quantity?: string | number
  store?: CartStoreInfoApiDto
  product?: {
    id: string
    name?: string
    featured_image?: string
    price?: number
    price_info?: {
      final_price?: number
      price_without_tax?: number
      tax?: number
      discount?: number
    }
  }
}

export type CartAddProductApiPayload = {
  id: string
  quantityInCart: number
}

export type CartAddStoreApiPayload = {
  store_info: { id: string }
  store_products: CartAddProductApiPayload[]
}

export type CartAddApiRequest = {
  carts: CartAddStoreApiPayload[]
}

export type CartPayloadListItem = CartStoreGroupApiDto | CartLineItemApiDto

/** GET `/v1/carts` may wrap under `data`, `data.carts`, or return groups/lines directly. */
export type CartApiResponse =
  | CartPayloadListItem[]
  | {
      data?: CartPayloadListItem[] | { carts?: CartPayloadListItem[] }
      carts?: CartPayloadListItem[]
      message?: string
      success?: boolean
    }

export type CartMutationApiResponse = {
  data?: CartPayloadListItem[] | { carts?: CartPayloadListItem[] }
  carts?: CartPayloadListItem[]
  message?: string
  success?: boolean
}

export type CartDeleteApiResponse = {
  message?: string
  success?: boolean
}
