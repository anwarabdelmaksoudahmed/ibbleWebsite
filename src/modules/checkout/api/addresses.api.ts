import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { CHECKOUT_ENDPOINTS } from '@modules/checkout/constants/endpoints'
import type {
  CreateCustomerAddressApiRequest,
  CustomerAddressApiDto,
  CustomerAddressesApiResponse,
  UpdateCustomerAddressApiRequest,
} from '@modules/checkout/types/api.types'

export class AddressesApi {
  private readonly client: AxiosInstance

  constructor(client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
  }

  list(): Promise<CustomerAddressesApiResponse> {
    return this.client
      .get<CustomerAddressesApiResponse>(CHECKOUT_ENDPOINTS.ADDRESSES)
      .then((response) => response.data)
  }

  create(payload: CreateCustomerAddressApiRequest): Promise<CustomerAddressApiDto> {
    return this.client
      .post<CustomerAddressApiDto>(CHECKOUT_ENDPOINTS.ADDRESSES, payload)
      .then((response) => response.data)
  }

  update(id: string, payload: UpdateCustomerAddressApiRequest): Promise<CustomerAddressApiDto> {
    return this.client
      .put<CustomerAddressApiDto>(CHECKOUT_ENDPOINTS.ADDRESS_BY_ID(id), payload)
      .then((response) => response.data)
  }
}
