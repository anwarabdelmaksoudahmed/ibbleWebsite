import type {
  InsurancePricingRateApiDto,
  InsuranceProviderOptionsApiDto,
  InsuranceServiceProviderApiDto,
} from '@modules/insurance/types/api.types'
import type {
  InsurancePricingRate,
  InsuranceProviderOptions,
  InsuranceServiceProvider,
} from '@modules/insurance/types/internal.types'
import { buildProviderQuote } from '@modules/insurance/utils/pricing'

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
