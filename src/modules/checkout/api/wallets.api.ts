import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { CHECKOUT_ENDPOINTS } from '@modules/checkout/constants/endpoints'
import type { WalletsApiResponse } from '@modules/checkout/types/api.types'

export class WalletsApi {
  private readonly client: AxiosInstance
  private readonly baseUrl: string

  constructor(baseUrl: string, client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
    this.baseUrl = baseUrl
  }

  list(): Promise<WalletsApiResponse> {
    return this.client
      .get<WalletsApiResponse>(CHECKOUT_ENDPOINTS.WALLETS, { baseURL: this.baseUrl })
      .then((response) => response.data)
  }
}
