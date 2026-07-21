import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { CHECKOUT_ENDPOINTS } from '@modules/checkout/constants/endpoints'
import type {
  WalletTransactionsApiResponse,
  WalletTransactionsQueryParams,
  WalletsApiResponse,
} from '@modules/checkout/types/api.types'

export class WalletsApi {
  private readonly client: AxiosInstance
  private readonly baseUrl: string

  constructor(baseUrl: string, client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
    this.baseUrl = baseUrl
  }

  list(): Promise<WalletsApiResponse> {
    return this.client
      .get<WalletsApiResponse>(CHECKOUT_ENDPOINTS.WALLETS, {
        baseURL: this.baseUrl,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  listTransactions(
    params: WalletTransactionsQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<WalletTransactionsApiResponse> {
    return this.client
      .get<WalletTransactionsApiResponse>(CHECKOUT_ENDPOINTS.WALLET_TRANSACTIONS, {
        baseURL: this.baseUrl,
        signal: options?.signal,
        params: {
          page: params.page ?? 1,
          ...(params.status ? { status: params.status } : {}),
        },
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  listCreditTransactions(
    params: WalletTransactionsQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<WalletTransactionsApiResponse> {
    return this.client
      .get<WalletTransactionsApiResponse>(CHECKOUT_ENDPOINTS.WALLET_CREDIT_TRANSACTIONS, {
        baseURL: this.baseUrl,
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
