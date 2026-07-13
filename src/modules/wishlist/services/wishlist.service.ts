import { WishlistApi } from '@modules/wishlist/api/wishlist.api'
import type { Wishlist } from '@modules/wishlist/types'
import { mapWishlistResponse } from '@modules/wishlist/utils/mappers'

export class WishlistService {
  private readonly api: WishlistApi

  constructor(api?: WishlistApi) {
    this.api = api ?? new WishlistApi()
  }

  async list(): Promise<Wishlist> {
    const response = await this.api.list()
    return mapWishlistResponse(response)
  }

  async add(productId: string): Promise<{ wishlist: Wishlist; message?: string }> {
    const response = await this.api.add({ product_id: String(productId) })
    return {
      wishlist: mapWishlistResponse(response),
      message: response.message,
    }
  }

  async remove(productId: string): Promise<{ wishlist: Wishlist; message?: string }> {
    const response = await this.api.remove(String(productId))
    return {
      wishlist: mapWishlistResponse(response),
      message: response.message,
    }
  }
}

let wishlistService: WishlistService | null = null

export function getWishlistService(): WishlistService {
  if (!wishlistService) {
    wishlistService = new WishlistService()
  }
  return wishlistService
}
