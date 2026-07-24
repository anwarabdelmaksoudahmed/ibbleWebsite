import { TransportTripsApi } from '@modules/transport/api/trips.api'
import type {
  AcceptedTransportTrip,
  TransportOffer,
  TransportTripRequest,
  TransportTripsPage,
  TransportVehicleDetails,
  TransportVehicleType,
} from '@modules/transport/types'
import type {
  AcceptTransportOfferApiPayload,
  CreateTransportTripRequestApiPayload,
  PayTransportTripApiPayload,
  PayTransportTripApiResponse,
  TransportAllowedVehicleTypesQueryParams,
  TransportTripsQueryParams,
} from '@modules/transport/types/api.types'
import { mapTransportTripsPage } from '@modules/transport/utils/trip-mappers'
import {
  mapAcceptedTransportTrip,
  mapTransportOffersResponse,
  mapTransportTripRequestResponse,
} from '@modules/transport/utils/trip-request-mappers'
import {
  mapTransportVehicleResponse,
  unwrapPayTransportTripResponse,
} from '@modules/transport/utils/trip-payment-mappers'
import { mapTransportVehicleTypes } from '@modules/transport/utils/vehicle-type-mappers'
import { buildFcmDevicePayload } from '@shared/firebase/device'

export class TransportTripsService {
  private readonly api: TransportTripsApi

  constructor(api?: TransportTripsApi) {
    if (api) {
      this.api = api
      return
    }

    const config = useRuntimeConfig()
    this.api = new TransportTripsApi(config.public.transportationApiBaseUrl as string)
  }

  async listUserTrips(
    params: TransportTripsQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<TransportTripsPage> {
    const response = await this.api.listUserTrips(params, options)
    return mapTransportTripsPage(response)
  }

  async listAllowedVehicleTypes(
    params: TransportAllowedVehicleTypesQueryParams = {},
    options?: { signal?: AbortSignal; locale?: string },
  ): Promise<TransportVehicleType[]> {
    const response = await this.api.listAllowedVehicleTypes(params, options)
    return mapTransportVehicleTypes(response.data, options?.locale ?? 'ar')
  }

  async createTripRequest(
    payload: CreateTransportTripRequestApiPayload,
  ): Promise<TransportTripRequest> {
    const response = await this.api.createTripRequest(payload)
    return mapTransportTripRequestResponse(response)
  }

  async getTripRequest(
    id: string | number,
    options?: { signal?: AbortSignal },
  ): Promise<TransportTripRequest> {
    const response = await this.api.getTripRequest(id, options)
    return mapTransportTripRequestResponse(response)
  }

  async listOffersByTripRequest(
    tripRequestId: string | number,
    options?: { signal?: AbortSignal },
  ): Promise<TransportOffer[]> {
    const response = await this.api.listOffersByTripRequest(tripRequestId, options)
    return mapTransportOffersResponse(response)
  }

  async acceptOffer(
    offerId: string | number,
    payload: AcceptTransportOfferApiPayload,
  ): Promise<AcceptedTransportTrip> {
    const response = await this.api.acceptOffer(offerId, payload)
    return mapAcceptedTransportTrip(response)
  }

  async registerFcmToken(token: string): Promise<void> {
    const payload = buildFcmDevicePayload(token)
    console.log('[FCM] transport register payload', {
      fcm_token_preview: payload.fcm_token.slice(0, 16),
      device_type: payload.device_type,
      device_id: payload.device_id,
    })
    await this.api.registerFcmToken(payload)
  }

  async payTrip(
    tripId: string | number,
    payload: PayTransportTripApiPayload,
  ): Promise<PayTransportTripApiResponse> {
    const response = await this.api.payTrip(tripId, payload)
    return unwrapPayTransportTripResponse(response)
  }

  async cancelTrip(tripId: string | number): Promise<void> {
    await this.api.cancelTrip(tripId)
  }

  async getVehicle(vehicleId: string | number): Promise<TransportVehicleDetails> {
    const response = await this.api.getVehicle(vehicleId)
    return mapTransportVehicleResponse(response)
  }
}

let transportTripsService: TransportTripsService | null = null

export function getTransportTripsService(): TransportTripsService {
  if (!transportTripsService) {
    transportTripsService = new TransportTripsService()
  }
  return transportTripsService
}
