import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { INSURANCE_ENDPOINTS } from '@modules/insurance/constants/endpoints'
import type {
  CheckChipNumberApiResponse,
  CreateInsuranceApiRequest,
  CreateInsuranceApiResponse,
  InsuranceServiceProvidersApiResponse,
  InsuranceServiceProvidersQueryParams,
  UserInsurancesApiResponse,
  UserInsurancesQueryParams,
} from '@modules/insurance/types/api.types'

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

  listServiceProviders(
    params: InsuranceServiceProvidersQueryParams,
  ): Promise<InsuranceServiceProvidersApiResponse> {
    return this.client
      .get<InsuranceServiceProvidersApiResponse>(INSURANCE_ENDPOINTS.SERVICE_PROVIDERS, {
        baseURL: this.baseUrl,
        params: {
          limit: params.limit ?? 100,
          distance: params.distance,
          totalPrice: params.totalPrice,
        },
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  createInsurance(payload: CreateInsuranceApiRequest): Promise<CreateInsuranceApiResponse> {
    return this.client
      .post<CreateInsuranceApiResponse>(INSURANCE_ENDPOINTS.CREATE, payload, {
        baseURL: this.baseUrl,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  listUserInsurances(
    params: UserInsurancesQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<UserInsurancesApiResponse> {
    return this.client
      .get<UserInsurancesApiResponse>(INSURANCE_ENDPOINTS.USER_LIST, {
        baseURL: this.baseUrl,
        signal: options?.signal,
        params: {
          id: params.id ?? '',
          company: params.company ?? '',
          status: params.status ?? '',
          page: params.page ?? 1,
        },
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }
}
