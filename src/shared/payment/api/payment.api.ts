import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { PAYMENT_ENDPOINTS } from '@shared/payment/constants/endpoints'
import type {
  CancelPaymentApiResponse,
  CheckPaymentStatusApiRequest,
  CheckPaymentStatusApiResponse,
  InitiatePaymentApiRequest,
  InitiatePaymentApiResponse,
  PaymentStatusApiResponse,
} from '@shared/payment/types/api.types'

export class PaymentApi {
  private readonly client: AxiosInstance
  private readonly baseUrl: string

  constructor(baseUrl: string, client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
    this.baseUrl = baseUrl
  }

  initiate(payload: InitiatePaymentApiRequest): Promise<InitiatePaymentApiResponse> {
    return this.client
      .post<InitiatePaymentApiResponse>(PAYMENT_ENDPOINTS.INITIATE, payload, {
        baseURL: this.baseUrl,
      })
      .then((response) => response.data)
  }

  checkStatus(payload: CheckPaymentStatusApiRequest): Promise<CheckPaymentStatusApiResponse> {
    return this.client
      .post<CheckPaymentStatusApiResponse>(PAYMENT_ENDPOINTS.CHECK_STATUS, payload, {
        baseURL: this.baseUrl,
      })
      .then((response) => response.data)
  }

  status(transactionId: string): Promise<PaymentStatusApiResponse> {
    return this.client
      .get<PaymentStatusApiResponse>(PAYMENT_ENDPOINTS.status(transactionId), {
        baseURL: this.baseUrl,
      })
      .then((response) => response.data)
  }

  cancel(transactionId: string): Promise<CancelPaymentApiResponse> {
    return this.client
      .post<CancelPaymentApiResponse>(PAYMENT_ENDPOINTS.cancel(transactionId), {
        baseURL: this.baseUrl,
      })
      .then((response) => response.data)
  }
}
