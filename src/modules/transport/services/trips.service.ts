import { TransportTripsApi } from '@modules/transport/api/trips.api'
import type { TransportTripsPage, TransportVehicleType } from '@modules/transport/types'
import type {
  TransportAllowedVehicleTypesQueryParams,
  TransportTripsQueryParams,
} from '@modules/transport/types/api.types'
import { mapTransportTripsPage } from '@modules/transport/utils/trip-mappers'
import { mapTransportVehicleTypes } from '@modules/transport/utils/vehicle-type-mappers'

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
}

let transportTripsService: TransportTripsService | null = null

export function getTransportTripsService(): TransportTripsService {
  if (!transportTripsService) {
    transportTripsService = new TransportTripsService()
  }
  return transportTripsService
}
