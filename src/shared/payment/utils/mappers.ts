import type { InitiatePaymentApiResponse, InitiatePaymentApiRequest } from '@shared/payment/types/api.types'
import type {
  PaymentProviderId,
  PaymentRequest,
  PaymentResult,
  PaymentSession,
  PaymentStatus,
} from '@shared/payment/types/internal.types'
import { PAYMENT_PROVIDERS } from '@shared/payment/constants/providers'

export function mapInitiateResponse(
  response: InitiatePaymentApiResponse,
  request: PaymentRequest,
): PaymentSession {
  return {
    provider: resolveProviderId(response.gateway, request.provider),
    checkoutId: response.checkout_id,
    transactionId: response.transaction_id,
    orderId: request.orderId,
    amount: request.amount,
    currency: request.currency,
  }
}

export function buildInitiatePayload(request: PaymentRequest): InitiatePaymentApiRequest {
  return request.initiatePayload
}

function resolveProviderId(
  gateway: string,
  fallback: PaymentProviderId,
): PaymentProviderId {
  const normalized = gateway.trim().toLowerCase()

  if (normalized === 'hyperpay') {
    return PAYMENT_PROVIDERS.HYPERPAY
  }

  return fallback
}

export function createPaymentResult(params: {
  success: boolean
  status: PaymentStatus
  transactionId: string
  orderId: string
  message?: string
  fieldErrors?: Record<string, string[]>
}): PaymentResult {
  return {
    success: params.success,
    status: params.status,
    transactionId: params.transactionId,
    orderId: params.orderId,
    message: params.message,
    fieldErrors: params.fieldErrors,
  }
}

export function createCancelledResult(
  orderId: string,
  transactionId = '',
  message?: string,
): PaymentResult {
  return createPaymentResult({
    success: false,
    status: 'cancelled',
    transactionId,
    orderId,
    message,
  })
}

export function createFailureResult(
  orderId: string,
  transactionId = '',
  message?: string,
  fieldErrors?: Record<string, string[]>,
): PaymentResult {
  return createPaymentResult({
    success: false,
    status: 'failed',
    transactionId,
    orderId,
    message,
    fieldErrors,
  })
}

export function createSuccessResult(
  orderId: string,
  transactionId: string,
  message?: string,
): PaymentResult {
  return createPaymentResult({
    success: true,
    status: 'success',
    transactionId,
    orderId,
    message,
  })
}

export function isInitiateResponseSuccessful(response: InitiatePaymentApiResponse): boolean {
  return response.status === 1 && Boolean(response.checkout_id) && Boolean(response.transaction_id)
}
