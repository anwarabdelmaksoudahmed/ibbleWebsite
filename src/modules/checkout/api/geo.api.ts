import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { CHECKOUT_ENDPOINTS } from '@modules/checkout/constants/endpoints'
import type { CitiesApiResponse, CountriesApiResponse } from '@modules/checkout/types/api.types'

export class GeoApi {
  private readonly client: AxiosInstance

  constructor(client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
  }

  listCities(): Promise<CitiesApiResponse> {
    return this.client
      .get<CitiesApiResponse>(CHECKOUT_ENDPOINTS.CITIES)
      .then((response) => response.data)
  }

  listCountries(): Promise<CountriesApiResponse> {
    return this.client
      .get<CountriesApiResponse>(CHECKOUT_ENDPOINTS.COUNTRIES)
      .then((response) => response.data)
  }
}
