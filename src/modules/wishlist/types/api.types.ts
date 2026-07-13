/** Raw API shapes — marketplace `/v1/customer/wish-lists` contract */

export type WishlistAddApiRequest = {
  product_id: string
}

export type WishlistItemApiDto = {
  id?: string
  product_id?: string
  productId?: string
  product?: {
    id?: string
    name?: string
    featured_image?: string
  }
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
