import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { TRANSPORT_ENDPOINTS } from '@modules/transport/constants/endpoints'
import type {
  TransportTripsApiResponse,
  TransportTripsQueryParams,
} from '@modules/transport/types/api.types'

/**
 * Build `/trips/user?filters[status]=&page=1` exactly.
 * Do NOT use URLSearchParams — it encodes brackets to `%5B`/`%5D`,
 * which this Nest transportation API does not accept.
 */
function serializeTripsQuery(params: Record<string, unknown>): string {
  const page = encodeURIComponent(String(params.page ?? 1))
  const status = encodeURIComponent(String(params.status ?? ''))
  return `filters[status]=${status}&page=${page}`
}

export class TransportTripsApi {
  private readonly client: AxiosInstance
  private readonly baseUrl: string

  constructor(baseUrl: string, client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  listUserTrips(
    params: TransportTripsQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<TransportTripsApiResponse> {
    return this.client
      .get<TransportTripsApiResponse>(TRANSPORT_ENDPOINTS.USER_TRIPS, {
        baseURL: this.baseUrl,
        signal: options?.signal,
        params: {
          page: params.page ?? 1,
          status: params.status ?? '',
        },
        paramsSerializer: {
          serialize: serializeTripsQuery,
        },
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }
}
