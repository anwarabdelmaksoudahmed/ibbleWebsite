import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { INSURANCE_ENDPOINTS } from '@modules/insurance/constants/endpoints'
import type { CheckChipNumberApiResponse } from '@modules/insurance/types/api.types'

export class InsuranceApi {
  private readonly client: AxiosInstance
  private readonly baseUrl: string

  constructor(baseUrl: string, client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
    this.baseUrl = baseUrl
  }

  checkChipNumber(serial: string): Promise<CheckChipNumberApiResponse> {
    return this.client
      .get<CheckChipNumberApiResponse>(INSURANCE_ENDPOINTS.FIND_BY_CHIP_NUMBER(serial), {
        baseURL: this.baseUrl,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }
}
