import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { VETERINARY_ENDPOINTS } from '@modules/veterinary/constants/endpoints'
import type {
  VeterinaryDoctorsApiResponse,
  VeterinaryDoctorsQueryParams,
} from '@modules/veterinary/types/api.types'

export class VeterinaryDoctorsApi {
  private readonly client: AxiosInstance
  private readonly baseUrl: string

  constructor(baseUrl: string, client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
    this.baseUrl = baseUrl
  }

  listDoctors(
    params: VeterinaryDoctorsQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<VeterinaryDoctorsApiResponse> {
    return this.client
      .get<VeterinaryDoctorsApiResponse>(VETERINARY_ENDPOINTS.CUSTOMER_DOCTORS, {
        baseURL: this.baseUrl,
        signal: options?.signal,
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.allow_clinic_examine != null
            ? { allow_clinic_examine: params.allow_clinic_examine }
            : {}),
          ...(params.allow_outdoor_examine != null
            ? { allow_outdoor_examine: params.allow_outdoor_examine }
            : {}),
        },
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }
}
