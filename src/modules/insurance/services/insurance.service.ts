import { InsuranceApi } from '@modules/insurance/api/insurance.api'
import type { InsuranceServiceProvider } from '@modules/insurance/types'
import { mapInsuranceServiceProviders } from '@modules/insurance/utils/mappers'
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
}

let insuranceService: InsuranceService | null = null

export function getInsuranceService(): InsuranceService {
  if (!insuranceService) {
    insuranceService = new InsuranceService()
  }
  return insuranceService
}
