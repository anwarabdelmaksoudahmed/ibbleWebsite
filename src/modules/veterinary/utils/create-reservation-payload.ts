import { VETERINARY_PAYMENT_METHOD_IDS } from '@modules/veterinary/constants/payment-methods'
import type { VeterinaryServiceTypeId } from '@modules/veterinary/constants/routes'
import type {
  CreateVeterinaryReservationApiRequest,
  CreateVeterinaryReservationApiResponse,
  CreateVeterinaryReservationCardApiResponse,
  CreateVeterinaryReservationRecordApiResponse,
} from '@modules/veterinary/types/api.types'
import type {
  VeterinaryAppointmentSlot,
  VeterinaryBookingPaymentForm,
  VeterinaryDoctor,
  VeterinaryPaymentMethodId,
  VeterinaryWeekdayName,
} from '@modules/veterinary/types/internal.types'
import type { InitiatePaymentApiRequest } from '@shared/payment/types/api.types'

export type BuildCreateVeterinaryReservationInput = {
  doctor: VeterinaryDoctor
  serviceType: VeterinaryServiceTypeId
  day: VeterinaryWeekdayName
  date: string
  slot: VeterinaryAppointmentSlot
  payment: VeterinaryBookingPaymentForm
  pinCode?: string
}

function mapServiceType(serviceType: VeterinaryServiceTypeId): 'clinic_examine' | 'outdoor_examine' {
  return serviceType === 'clinic' ? 'clinic_examine' : 'outdoor_examine'
}

export function buildCreateVeterinaryReservationPayload(
  input: BuildCreateVeterinaryReservationInput,
): CreateVeterinaryReservationApiRequest {
  const payload: CreateVeterinaryReservationApiRequest = {
    doctor_id: input.doctor.id,
    service_type: mapServiceType(input.serviceType),
    day: input.day,
    date: input.date,
    from: input.slot.from,
    to: input.slot.to,
    payment_method_id: VETERINARY_PAYMENT_METHOD_IDS[input.payment.paymentMethod as VeterinaryPaymentMethodId],
    customer_name: input.payment.customerName.trim(),
    customer_phone: input.payment.customerPhone.trim(),
    country_code: input.payment.countryCode.trim() || undefined,
  }

  if (input.serviceType === 'fieldVisit') {
    payload.address = input.payment.address.trim()
  }

  if (input.payment.paymentMethod === 'wallet') {
    const pin = input.pinCode?.trim()
    if (pin) payload.PIN_code = pin
  }

  return payload
}

export function isCreateVeterinaryCardResponse(
  response: CreateVeterinaryReservationApiResponse,
): response is CreateVeterinaryReservationCardApiResponse {
  return (
    typeof response === 'object' &&
    response != null &&
    'merchant_transaction_id' in response &&
    response.merchant_transaction_id != null &&
    'amount' in response &&
    Number.isFinite(Number(response.amount))
  )
}

export function unwrapCreateVeterinaryReservationResponse(
  payload: unknown,
): CreateVeterinaryReservationApiResponse {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid veterinary reservation response')
  }

  const record = payload as Record<string, unknown>
  if (record.data && typeof record.data === 'object') {
    return record.data as CreateVeterinaryReservationApiResponse
  }

  return payload as CreateVeterinaryReservationApiResponse
}

export function toVeterinaryInitiatePayload(
  order: CreateVeterinaryReservationCardApiResponse,
): InitiatePaymentApiRequest {
  return {
    message: order.message,
    amount: Number(order.amount),
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

export function isCreateVeterinaryRecordResponse(
  response: CreateVeterinaryReservationApiResponse,
): response is CreateVeterinaryReservationRecordApiResponse {
  return !isCreateVeterinaryCardResponse(response)
}
