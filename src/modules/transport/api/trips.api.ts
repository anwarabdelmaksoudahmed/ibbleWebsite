import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { TRANSPORT_ENDPOINTS } from '@modules/transport/constants/endpoints'
import type {
  AcceptTransportOfferApiPayload,
  AcceptTransportOfferApiResponse,
  CreateTransportTripRequestApiPayload,
  PayTransportTripApiPayload,
  PayTransportTripApiResponse,
  RegisterFcmTokenApiPayload,
  TransportAllowedVehicleTypesApiResponse,
  TransportAllowedVehicleTypesQueryParams,
  TransportOffersApiResponse,
  TransportTripRequestApiResponse,
  TransportTripsApiResponse,
  TransportTripsQueryParams,
  TransportVehicleApiResponse,
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

/** Build `filters[status]=1` for allowed vehicle types. */
function serializeStatusFilter(params: Record<string, unknown>): string {
  const status = encodeURIComponent(String(params.status ?? 1))
  return `filters[status]=${status}`
}

/** Build `filters[tripRequestId]=123` for offers of a request. */
function serializeTripRequestFilter(params: Record<string, unknown>): string {
  const tripRequestId = encodeURIComponent(String(params.tripRequestId ?? ''))
  return `filters[tripRequestId]=${tripRequestId}`
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

  listAllowedVehicleTypes(
    params: TransportAllowedVehicleTypesQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<TransportAllowedVehicleTypesApiResponse> {
    return this.client
      .get<TransportAllowedVehicleTypesApiResponse>(
        TRANSPORT_ENDPOINTS.ALLOWED_VEHICLE_TYPES,
        {
          baseURL: this.baseUrl,
          signal: options?.signal,
          params: {
            status: params.status ?? 1,
          },
          paramsSerializer: {
            serialize: serializeStatusFilter,
          },
          skipErrorToast: true,
        },
      )
      .then((response) => response.data)
  }

  createTripRequest(
    payload: CreateTransportTripRequestApiPayload,
  ): Promise<TransportTripRequestApiResponse> {
    return this.client
      .post<TransportTripRequestApiResponse>(TRANSPORT_ENDPOINTS.TRIP_REQUESTS, payload, {
        baseURL: this.baseUrl,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  getTripRequest(
    id: string | number,
    options?: { signal?: AbortSignal },
  ): Promise<TransportTripRequestApiResponse> {
    return this.client
      .get<TransportTripRequestApiResponse>(TRANSPORT_ENDPOINTS.TRIP_REQUEST(id), {
        baseURL: this.baseUrl,
        signal: options?.signal,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  listOffersByTripRequest(
    tripRequestId: string | number,
    options?: { signal?: AbortSignal },
  ): Promise<TransportOffersApiResponse> {
    return this.client
      .get<TransportOffersApiResponse>(TRANSPORT_ENDPOINTS.OFFERS, {
        baseURL: this.baseUrl,
        signal: options?.signal,
        params: { tripRequestId },
        paramsSerializer: {
          serialize: serializeTripRequestFilter,
        },
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  acceptOffer(
    offerId: string | number,
    payload: AcceptTransportOfferApiPayload,
  ): Promise<AcceptTransportOfferApiResponse> {
    return this.client
      .patch<AcceptTransportOfferApiResponse>(
        TRANSPORT_ENDPOINTS.OFFER(offerId),
        payload,
        {
          baseURL: this.baseUrl,
          skipErrorToast: true,
        },
      )
      .then((response) => response.data)
  }

  registerFcmToken(payload: RegisterFcmTokenApiPayload): Promise<unknown> {
    return this.client
      .patch(TRANSPORT_ENDPOINTS.USER_FCM_TOKEN, payload, {
        baseURL: this.baseUrl,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  payTrip(
    tripId: string | number,
    payload: PayTransportTripApiPayload,
  ): Promise<PayTransportTripApiResponse> {
    return this.client
      .patch<PayTransportTripApiResponse>(TRANSPORT_ENDPOINTS.TRIP_PAY(tripId), payload, {
        baseURL: this.baseUrl,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  cancelTrip(tripId: string | number): Promise<unknown> {
    return this.client
      .patch(TRANSPORT_ENDPOINTS.TRIP_CANCEL(tripId), undefined, {
        baseURL: this.baseUrl,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  getVehicle(vehicleId: string | number): Promise<TransportVehicleApiResponse> {
    return this.client
      .get<TransportVehicleApiResponse>(TRANSPORT_ENDPOINTS.VEHICLE(vehicleId), {
        baseURL: this.baseUrl,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }
}
