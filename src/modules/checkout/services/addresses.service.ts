import { AddressesApi } from '@modules/checkout/api/addresses.api'
import type { AddressFormInput, CustomerAddress } from '@modules/checkout/types'
import {
  mapCustomerAddress,
  mapCustomerAddresses,
  toAddressApiPayload,
} from '@modules/checkout/utils/mappers'

export class AddressesService {
  private readonly api: AddressesApi

  constructor(api?: AddressesApi) {
    this.api = api ?? new AddressesApi()
  }

  async list(): Promise<CustomerAddress[]> {
    const response = await this.api.list()
    return mapCustomerAddresses(response)
  }

  async create(input: AddressFormInput): Promise<CustomerAddress> {
    const response = await this.api.create(toAddressApiPayload(input))
    return mapCustomerAddress(response)
  }

  async update(id: string, input: AddressFormInput): Promise<CustomerAddress> {
    const response = await this.api.update(id, toAddressApiPayload(input))
    return mapCustomerAddress(response)
  }
}

let addressesService: AddressesService | null = null

export function getAddressesService(): AddressesService {
  if (!addressesService) {
    addressesService = new AddressesService()
  }
  return addressesService
}
