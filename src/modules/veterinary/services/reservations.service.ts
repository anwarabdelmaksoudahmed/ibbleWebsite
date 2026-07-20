import { VeterinaryReservationsApi } from '@modules/veterinary/api/reservations.api'
import type { VeterinaryReservationsPage } from '@modules/veterinary/types'
import type { VeterinaryReservationsQueryParams } from '@modules/veterinary/types/api.types'
import { mapVeterinaryReservationsPage } from '@modules/veterinary/utils/mappers'

export class VeterinaryReservationsService {
  private readonly api: VeterinaryReservationsApi

  constructor(api?: VeterinaryReservationsApi) {
    if (api) {
      this.api = api
      return
    }

    const config = useRuntimeConfig()
    const baseUrl =
      (config.public.veterinaryApiBaseUrl as string) || 'https://api-veterinary.ibbil.com/api'
    this.api = new VeterinaryReservationsApi(baseUrl)
  }

  async listCustomerReservations(
    params: VeterinaryReservationsQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<VeterinaryReservationsPage> {
    const response = await this.api.listCustomerReservations(params, options)
    return mapVeterinaryReservationsPage(response)
  }
}

let veterinaryReservationsService: VeterinaryReservationsService | null = null

export function getVeterinaryReservationsService(): VeterinaryReservationsService {
  if (!veterinaryReservationsService) {
    veterinaryReservationsService = new VeterinaryReservationsService()
  }
  return veterinaryReservationsService
}
