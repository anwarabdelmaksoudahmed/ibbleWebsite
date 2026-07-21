import { InsuranceApi } from '@modules/insurance/api/insurance.api'
import type { InsuranceServiceProvider, UserInsurancesPage } from '@modules/insurance/types'
import type {
  CreateInsuranceApiRequest,
  CreateInsuranceApiResponse,
  UserInsurancesQueryParams,
} from '@modules/insurance/types/api.types'
import { mapInsuranceServiceProviders, mapUserInsurancesPage } from '@modules/insurance/utils/mappers'
import { unwrapCreateInsuranceResponse } from '@modules/insurance/utils/create-insurance-payload'
import { distanceKmToMeters } from '@modules/insurance/utils/pricing'

export class InsuranceService {
  private readonly api: InsuranceApi

  constructor(api?: InsuranceApi) {
    if (api) {
      this.api = api
      return
    }

    const config = useRuntimeConfig()
    const baseUrl =
      (config.public.insuranceApiBaseUrl as string) || 'https://api-insurance.ibbil.com/'
    this.api = new InsuranceApi(baseUrl)
  }

  /**
   * Returns `true` when the chip/serial number exists in the insurance system.
   */
  async checkChipNumber(serial: string): Promise<boolean> {
    const response = await this.api.checkChipNumber(serial.trim())
    return response.data === true
  }

  async listServiceProviders(input: {
    distanceKm: string | number
    totalPrice: number
    limit?: number
  }): Promise<InsuranceServiceProvider[]> {
    const response = await this.api.listServiceProviders({
      limit: input.limit ?? 100,
      distance: distanceKmToMeters(input.distanceKm),
      totalPrice: input.totalPrice,
    })

    return mapInsuranceServiceProviders(response.data ?? [], input.totalPrice)
  }

  async createInsurance(payload: CreateInsuranceApiRequest): Promise<CreateInsuranceApiResponse> {
    const response = await this.api.createInsurance(payload)
    return unwrapCreateInsuranceResponse(response)
  }

  async listUserInsurances(
    params: UserInsurancesQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<UserInsurancesPage> {
    const response = await this.api.listUserInsurances(params, options)
    return mapUserInsurancesPage(response)
  }
}

let insuranceService: InsuranceService | null = null

export function getInsuranceService(): InsuranceService {
  if (!insuranceService) {
    insuranceService = new InsuranceService()
  }
  return insuranceService
}
