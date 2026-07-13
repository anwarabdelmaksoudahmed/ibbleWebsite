import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { CHECKOUT_ENDPOINTS } from '@modules/checkout/constants/endpoints'
import type {
  CreateOrderApiRequest,
  CreateOrderApiResponse,
} from '@modules/checkout/types/api.types'

export class OrdersApi {
  private readonly client: AxiosInstance

  constructor(client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
  }

  create(payload: CreateOrderApiRequest): Promise<CreateOrderApiResponse> {
    return this.client
      .post<CreateOrderApiResponse>(CHECKOUT_ENDPOINTS.ORDERS, payload)
      .then((response) => response.data)
  }
}
