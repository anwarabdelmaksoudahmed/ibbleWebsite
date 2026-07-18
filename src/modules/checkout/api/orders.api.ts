import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { CHECKOUT_ENDPOINTS } from '@modules/checkout/constants/endpoints'
import type {
  CreateOrderApiRequest,
  CreateOrderApiResponse,
  CustomerOrdersApiResponse,
  CustomerOrdersQueryParams,
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

  listCustomerOrders(
    params: CustomerOrdersQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<CustomerOrdersApiResponse> {
    return this.client
      .get<CustomerOrdersApiResponse>(CHECKOUT_ENDPOINTS.ORDERS, {
        signal: options?.signal,
        params: {
          page: params.page ?? 1,
          ...(params.status ? { status: params.status } : {}),
        },
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }
}
