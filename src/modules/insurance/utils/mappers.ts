import type {
  InsurancePricingRateApiDto,
  InsuranceProviderOptionsApiDto,
  InsuranceServiceProviderApiDto,
  UserInsuranceApiDto,
  UserInsurancesApiResponse,
} from '@modules/insurance/types/api.types'
import type {
  InsurancePricingRate,
  InsuranceProviderOptions,
  InsuranceServiceProvider,
  UserInsurance,
  UserInsuranceStatus,
  UserInsurancesPage,
} from '@modules/insurance/types/internal.types'
import { buildProviderQuote } from '@modules/insurance/utils/pricing'
import { dayjs } from '@shared/utils/formatters'

function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function mapPricingRate(dto: InsurancePricingRateApiDto): InsurancePricingRate {
  const type = dto.type === 'fixed' ? 'fixed' : 'percentage'
  return {
    id: dto.id,
    from: toNumber(dto.from),
    to: toNumber(dto.to),
    price: toNumber(dto.price),
    type,
  }
}

function mapOptions(dto: InsuranceProviderOptionsApiDto): InsuranceProviderOptions {
  return {
    deductiblePercent: toNumber(dto.mount),
    minDeductible: toNumber(dto.min_mount),
    certificateFees: toNumber(dto.certificate_fees),
    taxPercent: toNumber(dto.tax),
  }
}

export function mapInsuranceServiceProvider(
  dto: InsuranceServiceProviderApiDto,
  insuredAmount: number,
): InsuranceServiceProvider {
  const options = mapOptions(dto.options)
  const pricingRates = (dto.pricingRate ?? []).map(mapPricingRate)

  return {
    id: dto.id,
    name: dto.name,
    image: dto.image?.trim() ?? '',
    isActive: Boolean(dto.is_active),
    options,
    termsAndConditions: dto.termsAndConditions?.trim() ?? '',
    pricingRates,
    quote: buildProviderQuote(options, pricingRates, insuredAmount),
    raw: dto,
  }
}

export function mapInsuranceServiceProviders(
  dtos: InsuranceServiceProviderApiDto[],
  insuredAmount: number,
): InsuranceServiceProvider[] {
  return dtos
    .filter((dto) => dto.is_active)
    .map((dto) => mapInsuranceServiceProvider(dto, insuredAmount))
}

export function resolveUserInsuranceStatus(coverageDate: string): UserInsuranceStatus {
  const endOfCoverage = dayjs(coverageDate).endOf('day')
  if (!endOfCoverage.isValid()) return 'expired'
  return endOfCoverage.isBefore(dayjs()) ? 'expired' : 'active'
}

export function mapUserInsurance(dto: UserInsuranceApiDto): UserInsurance {
  const fees = dto.fees_details

  return {
    id: dto.id,
    fullName: dto.full_name?.trim() ?? '',
    address: dto.address?.trim() ?? '',
    phone: dto.phone?.trim() ?? '',
    email: dto.email?.trim() ?? '',
    date: dto.date,
    distanceMeters: toNumber(dto.distance),
    iban: dto.iban?.trim() ?? '',
    totalPrice: toNumber(dto.total_price),
    nationalId: dto.national_id?.trim() ?? '',
    transportationCoverage: toNumber(dto.transportation_coverage),
    invoiceUrl: dto.invoice?.trim() || null,
    policiesUrl: dto.policies?.trim() || null,
    fees: {
      insuredAmount: toNumber(fees?.total_insurance_price),
      certificateFees: toNumber(fees?.certificate_fees),
      transportationCoverage: toNumber(fees?.transportaion_coverage),
      taxFees: toNumber(fees?.tax_fees),
      total: toNumber(fees?.total ?? dto.total_price),
    },
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    provider: {
      id: dto.service_provider?.id ?? 0,
      name: dto.service_provider?.name?.trim() ?? '',
      image: dto.service_provider?.image?.trim() ?? '',
      isActive: Boolean(dto.service_provider?.is_active),
    },
    status: resolveUserInsuranceStatus(dto.date),
  }
}

export function mapUserInsurancesPage(response: UserInsurancesApiResponse): UserInsurancesPage {
  const meta = response.meta
  return {
    items: (response.data ?? []).map(mapUserInsurance),
    count: toNumber(response.count ?? meta?.itemCount),
    totalPages: Math.max(1, toNumber(meta?.totalPages) || 1),
    currentPage: Math.max(1, toNumber(meta?.currentPage) || 1),
    itemsPerPage: Math.max(1, toNumber(meta?.itemsPerPage) || 5),
  }
}
