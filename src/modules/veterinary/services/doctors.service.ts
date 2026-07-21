import { VeterinaryDoctorsApi } from '@modules/veterinary/api/doctors.api'
import type { VeterinaryDoctorsQueryParams } from '@modules/veterinary/types/api.types'
import type { VeterinaryDoctorsPage } from '@modules/veterinary/types'
import { mapVeterinaryDoctorsPage } from '@modules/veterinary/utils/doctor-mappers'

export class VeterinaryDoctorsService {
  private readonly api: VeterinaryDoctorsApi

  constructor(api?: VeterinaryDoctorsApi) {
    if (api) {
      this.api = api
      return
    }

    const config = useRuntimeConfig()
    const baseUrl =
      (config.public.veterinaryApiBaseUrl as string) || 'https://api-veterinary.ibbil.com/api'
    this.api = new VeterinaryDoctorsApi(baseUrl)
  }

  async listDoctors(
    params: VeterinaryDoctorsQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<VeterinaryDoctorsPage> {
    const response = await this.api.listDoctors(params, options)
    return mapVeterinaryDoctorsPage(response)
  }
}

let veterinaryDoctorsService: VeterinaryDoctorsService | null = null

export function getVeterinaryDoctorsService(): VeterinaryDoctorsService {
  if (!veterinaryDoctorsService) {
    veterinaryDoctorsService = new VeterinaryDoctorsService()
  }
  return veterinaryDoctorsService
}
