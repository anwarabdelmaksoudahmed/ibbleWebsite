import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { VETERINARY_ENDPOINTS } from '@modules/veterinary/constants/endpoints'
import type {
  CreateVeterinaryReservationApiRequest,
  CreateVeterinaryReservationApiResponse,
  VeterinaryReservationsApiResponse,
  VeterinaryReservationsQueryParams,
  VeterinaryReservedTimesApiResponse,
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

  listReservedTimes(
    doctorId: string,
    params: { day: string; date: string },
    options?: { signal?: AbortSignal },
  ): Promise<VeterinaryReservedTimesApiResponse> {
    return this.client
      .get<VeterinaryReservedTimesApiResponse>(VETERINARY_ENDPOINTS.RESERVED_TIMES(doctorId), {
        baseURL: this.baseUrl,
        signal: options?.signal,
        params,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  createReservation(
    payload: CreateVeterinaryReservationApiRequest,
    options?: { signal?: AbortSignal },
  ): Promise<CreateVeterinaryReservationApiResponse> {
    return this.client
      .post<CreateVeterinaryReservationApiResponse>(
        VETERINARY_ENDPOINTS.CUSTOMER_RESERVATIONS,
        payload,
        {
          baseURL: this.baseUrl,
          signal: options?.signal,
          skipErrorToast: true,
        },
      )
      .then((response) => response.data)
  }
}
