import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { VETERINARY_ENDPOINTS } from '@modules/veterinary/constants/endpoints'
import type {
  VeterinaryReservationsApiResponse,
  VeterinaryReservationsQueryParams,
} from '@modules/veterinary/types/api.types'

export class VeterinaryReservationsApi {
  private readonly client: AxiosInstance
  private readonly baseUrl: string

  constructor(baseUrl: string, client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
    this.baseUrl = baseUrl
  }

  listCustomerReservations(
    params: VeterinaryReservationsQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<VeterinaryReservationsApiResponse> {
    return this.client
      .get<VeterinaryReservationsApiResponse>(VETERINARY_ENDPOINTS.CUSTOMER_RESERVATIONS, {
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
