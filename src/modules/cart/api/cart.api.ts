import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { CART_ENDPOINTS } from '@modules/cart/constants/endpoints'
import type {
  CartAddApiRequest,
  CartApiResponse,
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

  /**
   * Upserts cart lines. Same endpoint supports future quantity increase / decrease / remove
   * by sending the desired `quantityInCart` (0 = remove when backend supports it).
   */
  upsertCart(payload: CartAddApiRequest): Promise<CartMutationApiResponse> {
    return this.client
      .post<CartMutationApiResponse>(CART_ENDPOINTS.BASE, payload)
      .then((response) => response.data)
  }
}
