import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { PAYMENT_ENDPOINTS } from '@shared/payment/constants/endpoints'
import type {
  CancelPaymentApiResponse,
  InitiatePaymentApiRequest,
  InitiatePaymentApiResponse,
  PaymentStatusApiResponse,
  VerifyPaymentApiRequest,
  VerifyPaymentApiResponse,
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

  verify(
    transactionId: string,
    payload?: VerifyPaymentApiRequest,
  ): Promise<VerifyPaymentApiResponse> {
    return this.client
      .post<VerifyPaymentApiResponse>(PAYMENT_ENDPOINTS.verify(transactionId), payload, {
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
