import type {
  PayTransportTripApiResponse,
  PayTransportTripCardApiResponse,
  PayTransportTripWalletApiResponse,
  TransportVehicleApiDto,
  TransportVehicleApiResponse,
} from '@modules/transport/types/api.types'
import type { TransportVehicleDetails } from '@modules/transport/types/internal.types'
import type { InitiatePaymentApiRequest } from '@shared/payment/types/api.types'

function toId(value: unknown): string {
  return value == null ? '' : String(value)
}

function toTrimmed(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
}

function finiteNumber(value: number): number {
  return Number.isFinite(value) ? value : 0
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

/** Unwrap NestJS `{ data: T }` envelopes when present. */
export function unwrapPayTransportTripResponse(payload: unknown): PayTransportTripApiResponse {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid trip pay response')
  }

  const record = payload as Record<string, unknown>
  const nested = asRecord(record.data)
  if (nested && 'merchant_transaction_id' in nested) {
    return nested as PayTransportTripCardApiResponse
  }
  if (
    nested &&
    ('amount' in nested || 'merchant_transaction_id' in nested) &&
    !('id' in nested && !('merchant_transaction_id' in nested))
  ) {
    // Prefer card shape when HyperPay fields live under data.
    if ('merchant_transaction_id' in nested || 'currency' in nested) {
      return nested as PayTransportTripCardApiResponse
    }
  }

  return payload as PayTransportTripApiResponse
}

export function isPayTransportTripCardResponse(
  response: PayTransportTripApiResponse,
): response is PayTransportTripCardApiResponse {
  return (
    typeof response === 'object' &&
    response != null &&
    'merchant_transaction_id' in response &&
    (response as PayTransportTripCardApiResponse).merchant_transaction_id != null &&
    'amount' in response &&
    Number.isFinite(Number((response as PayTransportTripCardApiResponse).amount))
  )
}

export function isPayTransportTripWalletResponse(
  response: PayTransportTripApiResponse,
): response is PayTransportTripWalletApiResponse {
  return !isPayTransportTripCardResponse(response)
}

export function toTransportInitiatePayload(
  order: PayTransportTripCardApiResponse,
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

function mapVehicleDto(dto: TransportVehicleApiDto | null | undefined): TransportVehicleDetails | null {
  if (!dto?.id) return null
  const images = Array.isArray(dto.images)
    ? dto.images.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : []

  return {
    id: toId(dto.id),
    model: toTrimmed(dto.model),
    year: toTrimmed(dto.year),
    plateNumber: toTrimmed(dto.plateNumber),
    images,
  }
}

export function mapTransportVehicleResponse(
  response: TransportVehicleApiResponse,
): TransportVehicleDetails {
  const mapped = mapVehicleDto(response.data)
  if (!mapped) {
    throw new Error(response.message || 'Invalid vehicle response')
  }
  return mapped
}
