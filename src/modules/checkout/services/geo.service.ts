import { GeoApi } from '@modules/checkout/api/geo.api'
import type { CheckoutCity, CheckoutCountry } from '@modules/checkout/types'
import { mapCities, mapCountries } from '@modules/checkout/utils/mappers'

export class GeoService {
  private readonly api: GeoApi

  constructor(api?: GeoApi) {
    this.api = api ?? new GeoApi()
  }

  async listCities(): Promise<CheckoutCity[]> {
    const response = await this.api.listCities()
    return mapCities(response)
  }

  async listCountries(): Promise<CheckoutCountry[]> {
    const response = await this.api.listCountries()
    return mapCountries(response)
  }
}

let geoService: GeoService | null = null

export function getGeoService(): GeoService {
  if (!geoService) {
    geoService = new GeoService()
  }
  return geoService
}
