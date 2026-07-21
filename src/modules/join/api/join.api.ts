import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { JOIN_ENDPOINTS } from '@modules/join/constants/endpoints'
import type {
  JoinApiResponse,
  JoinCitiesApiResponse,
  JoinClinicApiRequest,
  JoinCompanyApiRequest,
  JoinDoctorApiRequest,
  JoinDriverApiRequest,
  JoinMerchantApiRequest,
  JoinStoreCategoriesApiResponse,
} from '@modules/join/types/api.types'

export type JoinApiBaseUrls = {
  marketplace: string
  transportation: string
  veterinary: string
}

export class JoinApi {
  private readonly client: AxiosInstance
  private readonly baseUrls: JoinApiBaseUrls

  constructor(baseUrls: JoinApiBaseUrls, client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
    this.baseUrls = baseUrls
  }

  /** متجر / تاجر */
  join(payload: JoinMerchantApiRequest): Promise<JoinApiResponse> {
    return this.client
      .post<JoinApiResponse>(JOIN_ENDPOINTS.MERCHANT_REGISTER, payload, {
        baseURL: this.baseUrls.marketplace,
        skipAuth: true,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  /** سائق نقل */
  joinDriver(payload: JoinDriverApiRequest): Promise<JoinApiResponse> {
    return this.client
      .post<JoinApiResponse>(JOIN_ENDPOINTS.DRIVERS, payload, {
        baseURL: this.baseUrls.transportation,
        skipAuth: true,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  /** شركة نقل */
  joinCompany(payload: JoinCompanyApiRequest): Promise<JoinApiResponse> {
    return this.client
      .post<JoinApiResponse>(JOIN_ENDPOINTS.COMPANIES, payload, {
        baseURL: this.baseUrls.transportation,
        skipAuth: true,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  /** طبيب بيطري */
  joinDoctor(payload: JoinDoctorApiRequest): Promise<JoinApiResponse> {
    return this.client
      .post<JoinApiResponse>(JOIN_ENDPOINTS.DOCTORS_REGISTER, payload, {
        baseURL: this.baseUrls.veterinary,
        skipAuth: true,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  /** عيادة بيطرية */
  joinClinic(payload: JoinClinicApiRequest): Promise<JoinApiResponse> {
    return this.client
      .post<JoinApiResponse>(JOIN_ENDPOINTS.CLINICS_REGISTER, payload, {
        baseURL: this.baseUrls.veterinary,
        skipAuth: true,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  listCities(): Promise<JoinCitiesApiResponse> {
    return this.client
      .get<JoinCitiesApiResponse>(JOIN_ENDPOINTS.CITIES, {
        baseURL: this.baseUrls.marketplace,
        skipAuth: true,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  listStoreCategories(): Promise<JoinStoreCategoriesApiResponse> {
    return this.client
      .get<JoinStoreCategoriesApiResponse>(JOIN_ENDPOINTS.STORE_CATEGORIES, {
        baseURL: this.baseUrls.marketplace,
        skipAuth: true,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }
}
