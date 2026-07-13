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

export type CartStoreGroupApiDto = {
  store_info: CartStoreInfoApiDto
  store_products: CartStoreProductApiDto[]
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

/** GET `/v1/carts` may wrap groups under `data`, `data.carts`, or return them directly. */
export type CartApiResponse =
  | CartStoreGroupApiDto[]
  | {
      data?: CartStoreGroupApiDto[] | { carts?: CartStoreGroupApiDto[] }
      carts?: CartStoreGroupApiDto[]
      message?: string
      success?: boolean
    }

export type CartMutationApiResponse = {
  data?: CartStoreGroupApiDto[] | { carts?: CartStoreGroupApiDto[] }
  carts?: CartStoreGroupApiDto[]
  message?: string
  success?: boolean
}
