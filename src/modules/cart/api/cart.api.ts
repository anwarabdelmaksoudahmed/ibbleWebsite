import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { CART_ENDPOINTS } from '@modules/cart/constants/endpoints'
import type {
  CartAddApiRequest,
  CartApiResponse,
  CartDeleteApiResponse,
  CartMutationApiResponse,
} from '@modules/cart/types/api.types'

export class CartApi {
  private readonly client: AxiosInstance

  constructor(client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
  }

  getCart(): Promise<CartApiResponse> {
    return this.client.get<CartApiResponse>(CART_ENDPOINTS.BASE).then((response) => response.data)
  }

  /** POST `/v1/carts` — set absolute quantity for a cart line. */
  upsertCart(payload: CartAddApiRequest): Promise<CartMutationApiResponse> {
    return this.client
      .post<CartMutationApiResponse>(CART_ENDPOINTS.BASE, payload)
      .then((response) => response.data)
  }

  /** DELETE `/v1/carts/:productId` — remove a product from the cart. */
  removeProduct(productId: string): Promise<CartDeleteApiResponse> {
    return this.client
      .delete<CartDeleteApiResponse>(CART_ENDPOINTS.byProductId(productId))
      .then((response) => response.data)
  }
}
