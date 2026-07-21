import type {
  CitiesApiResponse,
  CityApiDto,
  CountriesApiResponse,
  CountryApiDto,
  CustomerAddressApiDto,
  CustomerAddressesApiResponse,
  CustomerOrderApiDto,
  CustomerOrderProductApiDto,
  CustomerOrdersApiResponse,
  WalletApiDto,
  WalletDetailsApiDto,
  WalletTransactionApiDto,
  WalletTransactionSource,
  WalletTransactionsApiResponse,
  WalletsApiResponse,
} from '@modules/checkout/types/api.types'
import type {
  AddressFormInput,
  CheckoutCity,
  CheckoutCountry,
  CustomerAddress,
  CustomerOrder,
  CustomerOrderAddress,
  CustomerOrderProduct,
  CustomerOrderStore,
  CustomerOrdersPage,
  UserWallet,
  WalletBankInfo,
  WalletDetails,
  WalletTransaction,
  WalletTransactionsPage,
} from '@modules/checkout/types/internal.types'
import type { CreateCustomerAddressApiRequest } from '@modules/checkout/types/api.types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function toId(value: unknown): string {
  return value == null ? '' : String(value)
}

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function toCount(value: unknown): number {
  return toNumber(value)
}

function toOptionalNumber(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
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
    balance: toNumber(dto.balance),
    currency: (dto.currency || 'SAR').trim() || 'SAR',
    status: (dto.status || '').trim(),
    name: (dto.name || '').trim(),
  }
}

function mapWalletBankInfo(
  dto: WalletDetailsApiDto['bank_info'],
): WalletBankInfo | null {
  if (!dto || typeof dto !== 'object') return null

  const accountName = toTrimmed(dto.account_name)
  const bankName = toTrimmed(dto.bank_name)
  const iban = toTrimmed(dto.IBAN)

  if (!accountName && !bankName && !iban) return null

  return { accountName, bankName, iban }
}

function toTrimmed(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
}

function unwrapWalletDetailsDto(
  payload: WalletsApiResponse | null | undefined,
): WalletDetailsApiDto | null {
  if (!payload) return null

  if (Array.isArray(payload)) {
    return (payload[0] as WalletDetailsApiDto) ?? null
  }

  if (isRecord(payload) && 'data' in payload) {
    const data = payload.data
    if (Array.isArray(data)) return (data[0] as WalletDetailsApiDto) ?? null
    if (isRecord(data)) return data as WalletDetailsApiDto
  }

  if (isRecord(payload)) {
    return payload as WalletDetailsApiDto
  }

  return null
}

export function mapWalletDetails(
  payload: WalletsApiResponse | null | undefined,
): WalletDetails | null {
  const dto = unwrapWalletDetailsDto(payload)
  if (!dto) return null

  const wallet = mapWallet(dto, 0)

  return {
    id: wallet.id,
    userId: toId(dto.user_id),
    balance: wallet.balance,
    currency: wallet.currency,
    totalWithdraw: toNumber(dto.total_withdraw),
    totalDeposit: toNumber(dto.total_deposit),
    withdrawCount: toCount(dto.withdraw_count),
    depositCount: toCount(dto.deposit_count),
    pendingAmount: toOptionalNumber(dto.pending_amount),
    bankInfo: mapWalletBankInfo(dto.bank_info),
    createdAt: toTrimmed(dto.created_at),
  }
}

export function mapWalletTransaction(
  dto: WalletTransactionApiDto,
  source: WalletTransactionSource = 'wallet',
): WalletTransaction {
  const details = dto.details
  const orderIdFromDetails =
    details && typeof details === 'object' && 'orderId' in details
      ? toId(details.orderId)
      : ''

  const rawPaymentMethod = toTrimmed(dto.payment_method)

  return {
    id: toId(dto.id),
    amount: toNumber(dto.amount),
    title: toTrimmed(dto.title),
    status: toTrimmed(dto.status).toLowerCase() || 'pending',
    type: toTrimmed(dto.type).toLowerCase() || 'withdrawal',
    transactionId: toId(dto.transaction_id),
    orderId: toId(dto.order_id) || orderIdFromDetails,
    module: toTrimmed(dto.module),
    paymentMethod: rawPaymentMethod || source,
    paymentSource: source,
    createdAt: toTrimmed(dto.created_at),
  }
}

export function mapWalletTransactionsPage(
  response: WalletTransactionsApiResponse,
  source: WalletTransactionSource = 'wallet',
): WalletTransactionsPage {
  const meta = response.meta
  return {
    items: (response.data ?? []).map((dto) => mapWalletTransaction(dto, source)),
    count: toNumber(meta?.totalItems ?? meta?.itemCount),
    totalPages: Math.max(1, toNumber(meta?.totalPages) || 1),
    currentPage: Math.max(1, toNumber(meta?.currentPage) || 1),
    itemsPerPage: Math.max(1, toNumber(meta?.itemsPerPage) || 10),
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

function mapOrderProduct(dto: CustomerOrderProductApiDto): CustomerOrderProduct {
  return {
    id: toId(dto.id),
    qty: toNumber(dto.qty),
    price: toNumber(dto.price),
    name: (dto.product_name || '').trim(),
    description: (dto.product_description || '').trim(),
    image: (dto.product_image || dto.product?.featured_image || '').trim(),
    productId: toId(dto.product?.id),
  }
}

function mapOrderStore(dto: CustomerOrderApiDto['store']): CustomerOrderStore {
  return {
    id: toId(dto?.id),
    name: (dto?.name || '').trim(),
    logo: (dto?.logo || '').trim(),
    url: (dto?.url || '').trim(),
    cityName: (dto?.city?.name || '').trim(),
    categoryName: (dto?.category?.name || '').trim(),
    categorySlug: (dto?.category?.slug || '').trim(),
  }
}

function mapOrderAddress(dto: CustomerOrderApiDto['order_address']): CustomerOrderAddress {
  return {
    name: (dto?.name || '').trim(),
    phone: (dto?.phone || '').trim(),
    countryCode: (dto?.country_code || '').trim(),
    email: (dto?.email || '').trim(),
    address: (dto?.address || '').trim(),
  }
}

export function mapCustomerOrder(dto: CustomerOrderApiDto): CustomerOrder {
  const products = (dto.order_products ?? []).map(mapOrderProduct)

  return {
    id: toId(dto.id),
    orderNum: (dto.order_num || `#${dto.id}`).trim(),
    status: (dto.status || 'pending').trim().toLowerCase(),
    totalAmount: toNumber(dto.total_amount),
    taxAmount: toNumber(dto.tax_amount),
    shippingAmount: toNumber(dto.shipping_amount),
    discountAmount: toNumber(dto.discount_amount),
    subTotal: toNumber(dto.sub_total),
    couponCode: (dto.coupon_code || '').trim(),
    invoiceUrl: dto.invoice?.trim() || null,
    createdAt: (dto.created_at || '').trim(),
    address: mapOrderAddress(dto.order_address),
    store: mapOrderStore(dto.store),
    products,
    productsCount: products.reduce((sum, product) => sum + product.qty, 0),
  }
}

export function mapCustomerOrdersPage(response: CustomerOrdersApiResponse): CustomerOrdersPage {
  const meta = response.meta
  return {
    items: (response.data ?? []).map(mapCustomerOrder),
    count: toNumber(meta?.totalItems ?? meta?.itemCount),
    totalPages: Math.max(1, toNumber(meta?.totalPages) || 1),
    currentPage: Math.max(1, toNumber(meta?.currentPage) || 1),
    itemsPerPage: Math.max(1, toNumber(meta?.itemsPerPage) || 10),
  }
}
