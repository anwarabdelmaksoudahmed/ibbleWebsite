import { INSURANCE_PAYMENT_METHOD_IDS } from '@modules/insurance/constants/payment-methods'
import type { InsuranceCustomerFormValues } from '@modules/insurance/schemas/customer.schema'
import type { InsurancePaymentMethodId } from '@modules/insurance/schemas/payment.schema'
import type { InsuranceShipmentFormValues } from '@modules/insurance/schemas/shipment.schema'
import type {
  CreateInsuranceApiRequest,
  CreateInsuranceCardApiResponse,
  CreateInsuranceApiResponse,
  CreateInsuranceRecordApiResponse,
} from '@modules/insurance/types/api.types'
import type { InsuranceServiceProvider } from '@modules/insurance/types'
import { distanceKmToMeters } from '@modules/insurance/utils/pricing'
import { normalizeIban } from '@shared/utils/iban'
import type { InitiatePaymentApiRequest } from '@shared/payment/types/api.types'

const CAMEL_READY_STATUS = 'رقم الشريحة موجود'
const CAMEL_READY_COLOR = 'Done'

function finiteNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback
}

export type BuildCreateInsurancePayloadInput = {
  customer: InsuranceCustomerFormValues
  shipment: InsuranceShipmentFormValues
  provider: InsuranceServiceProvider
  iban: string
  paymentMethod: InsurancePaymentMethodId
  pinCode?: string
  /** Localized camel-ready status label (falls back to Arabic API legacy string). */
  camelStatusLabel?: string
}

export function buildCreateInsurancePayload(
  input: BuildCreateInsurancePayloadInput,
): CreateInsuranceApiRequest {
  const distance = finiteNumber(distanceKmToMeters(input.shipment.distanceKm))
  const totalFeesPackages = finiteNumber(
    input.shipment.items.reduce((sum, item) => sum + Number(item.cargoValue), 0),
  )

  const payload: CreateInsuranceApiRequest = {
    country_code: input.customer.countryCode.trim(),
    national_id: input.customer.nationalId.trim(),
    phone: input.customer.phone.trim(),
    email: input.customer.email.trim(),
    address: input.customer.address.trim(),
    full_name: input.customer.name.trim(),
    camels: input.shipment.items.map((item) => ({
      chip_number: item.serialNumber.trim(),
      value: String(item.cargoValue).trim(),
      status: input.camelStatusLabel?.trim() || CAMEL_READY_STATUS,
      color: CAMEL_READY_COLOR,
    })),
    startText: input.shipment.origin.trim(),
    endText: input.shipment.destination.trim(),
    distance,
    date: input.shipment.transportDate.trim(),
    totalFeesPackages,
    selectedCompany: input.provider.raw,
    service_provider_id: input.provider.id,
    iban: normalizeIban(input.iban),
    payment_method_id: INSURANCE_PAYMENT_METHOD_IDS[input.paymentMethod],
  }

  if (input.paymentMethod === 'wallet') {
    const pin = input.pinCode?.trim()
    if (pin) payload.PIN_code = pin
  }

  return payload
}

export function isCreateInsuranceCardResponse(
  response: CreateInsuranceApiResponse,
): response is CreateInsuranceCardApiResponse {
  return (
    typeof response === 'object' &&
    response != null &&
    'merchant_transaction_id' in response &&
    (response as CreateInsuranceCardApiResponse).merchant_transaction_id != null &&
    'amount' in response &&
    Number.isFinite(Number((response as CreateInsuranceCardApiResponse).amount))
  )
}

export function isCreateInsuranceRecordResponse(
  response: CreateInsuranceApiResponse,
): response is CreateInsuranceRecordApiResponse {
  return !isCreateInsuranceCardResponse(response)
}

export function toInsuranceInitiatePayload(
  order: CreateInsuranceCardApiResponse,
): InitiatePaymentApiRequest {
  return {
    message: order.message,
    amount: finiteNumber(Number(order.amount)),
    currency: order.currency,
    payment_type: order.payment_type,
    merchant_transaction_id: order.merchant_transaction_id,
    description: order.description,
    module: order.module,
    payment_method_id: order.payment_method_id,
    address: order.address,
    invoice: order.invoice ?? null,
  }
}

/** Unwrap NestJS `{ data: T }` envelopes when present. */
export function unwrapCreateInsuranceResponse(payload: unknown): CreateInsuranceApiResponse {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid insurance create response')
  }

  const record = payload as Record<string, unknown>
  if (record.data && typeof record.data === 'object') {
    return record.data as CreateInsuranceApiResponse
  }

  return payload as CreateInsuranceApiResponse
}
