import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { WISHLIST_ENDPOINTS } from '@modules/wishlist/constants/endpoints'
import type {
  WishlistAddApiRequest,
  WishlistApiResponse,
  WishlistMutationApiResponse,
} from '@modules/wishlist/types/api.types'

export class WishlistApi {
  private readonly client: AxiosInstance

  constructor(client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
  }

  list(): Promise<WishlistApiResponse> {
    return this.client
      .get<WishlistApiResponse>(WISHLIST_ENDPOINTS.BASE)
      .then((response) => response.data)
  }

  add(payload: WishlistAddApiRequest): Promise<WishlistMutationApiResponse> {
    return this.client
      .post<WishlistMutationApiResponse>(WISHLIST_ENDPOINTS.BASE, payload)
      .then((response) => response.data)
  }

  remove(productId: string): Promise<WishlistMutationApiResponse> {
    return this.client
      .delete<WishlistMutationApiResponse>(WISHLIST_ENDPOINTS.BY_PRODUCT(productId))
      .then((response) => response.data)
  }
}
