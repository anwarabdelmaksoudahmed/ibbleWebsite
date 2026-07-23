import { TransportTripsApi } from '@modules/transport/api/trips.api'
import type { TransportTripsPage } from '@modules/transport/types'
import type { TransportTripsQueryParams } from '@modules/transport/types/api.types'
import { mapTransportTripsPage } from '@modules/transport/utils/trip-mappers'

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
}

let transportTripsService: TransportTripsService | null = null

export function getTransportTripsService(): TransportTripsService {
  if (!transportTripsService) {
    transportTripsService = new TransportTripsService()
  }
  return transportTripsService
}
