import type {
  CitiesApiResponse,
  CityApiDto,
  CountriesApiResponse,
  CountryApiDto,
  CustomerAddressApiDto,
  CustomerAddressesApiResponse,
  WalletApiDto,
  WalletsApiResponse,
} from '@modules/checkout/types/api.types'
import type {
  AddressFormInput,
  CheckoutCity,
  CheckoutCountry,
  CustomerAddress,
  UserWallet,
} from '@modules/checkout/types/internal.types'
import type { CreateCustomerAddressApiRequest } from '@modules/checkout/types/api.types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function toId(value: unknown): string {
  return value == null ? '' : String(value)
}

function toBalance(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

export function mapCustomerAddress(dto: CustomerAddressApiDto): CustomerAddress {
  return {
    id: toId(dto.id),
    name: (dto.name || '').trim(),
    email: (dto.email || '').trim(),
    phone: (dto.phone || '').trim(),
    countryCode: (dto.country_code || '').trim(),
    address: (dto.address || '').trim(),
    isDefault: Boolean(dto.is_default),
    zipCode: (dto.zip_code || '').trim(),
    countryId: toId(dto.country?.id),
    countryFlag: dto.country?.flag || '',
    countryName: (dto.country?.name || '').trim(),
    cityId: toId(dto.city?.id),
    cityName: (dto.city?.name || '').trim(),
  }
}

export function mapCustomerAddresses(
  payload: CustomerAddressesApiResponse | null | undefined,
): CustomerAddress[] {
  if (!payload) return []
  const list = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : []
  return list.map(mapCustomerAddress).filter((item) => item.id)
}

export function mapCity(dto: CityApiDto): CheckoutCity {
  return {
    id: toId(dto.id),
    name: (dto.name || '').trim(),
    countryId: toId(dto.country),
  }
}

export function mapCities(payload: CitiesApiResponse | null | undefined): CheckoutCity[] {
  if (!payload) return []
  const list = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : []
  return list.map(mapCity).filter((item) => item.id && item.name)
}

export function mapCountry(dto: CountryApiDto): CheckoutCountry {
  return {
    id: toId(dto.id),
    name: (dto.name || '').trim(),
    flag: dto.flag || '',
    code: (dto.code || '').trim(),
  }
}

export function mapCountries(payload: CountriesApiResponse | null | undefined): CheckoutCountry[] {
  if (!payload) return []
  const list = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : []
  return list.map(mapCountry).filter((item) => item.id && item.name)
}

function mapWallet(dto: WalletApiDto, index: number): UserWallet {
  return {
    id: toId(dto.id) || `wallet-${index}`,
    balance: toBalance(dto.balance),
    currency: (dto.currency || 'SAR').trim() || 'SAR',
    status: (dto.status || '').trim(),
    name: (dto.name || '').trim(),
  }
}

export function mapWallets(payload: WalletsApiResponse | null | undefined): UserWallet[] {
  if (!payload) return []

  if (Array.isArray(payload)) {
    return payload.map(mapWallet).filter((w) => w.id)
  }

  if (isRecord(payload) && 'data' in payload) {
    const data = payload.data
    if (Array.isArray(data)) return data.map(mapWallet).filter((w) => w.id)
    if (isRecord(data)) return [mapWallet(data as WalletApiDto, 0)].filter((w) => w.id)
  }

  if (isRecord(payload)) {
    return [mapWallet(payload as WalletApiDto, 0)].filter((w) => w.id)
  }

  return []
}

export function toAddressApiPayload(input: AddressFormInput): CreateCustomerAddressApiRequest {
  return {
    name: input.name.trim(),
    email: input.email.trim() || undefined,
    phone: input.phone.trim(),
    country_code: input.countryCode.trim(),
    address: input.address.trim(),
    country_id: input.countryId,
    city_id: input.cityId,
    zip_code: input.zipCode.trim() || undefined,
    is_default: input.isDefault ? 1 : 0,
  }
}

export function createEmptyAddressForm(): AddressFormInput {
  return {
    name: '',
    email: '',
    phone: '',
    countryCode: '002',
    address: '',
    countryId: '',
    cityId: '',
    zipCode: '',
    isDefault: false,
  }
}

export function addressToFormInput(address: CustomerAddress): AddressFormInput {
  return {
    name: address.name,
    email: address.email,
    phone: address.phone,
    countryCode: address.countryCode || '002',
    address: address.address,
    countryId: address.countryId,
    cityId: address.cityId,
    zipCode: address.zipCode,
    isDefault: address.isDefault,
  }
}
