import { InsuranceApi } from '@modules/insurance/api/insurance.api'

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
}

let insuranceService: InsuranceService | null = null

export function getInsuranceService(): InsuranceService {
  if (!insuranceService) {
    insuranceService = new InsuranceService()
  }
  return insuranceService
}
