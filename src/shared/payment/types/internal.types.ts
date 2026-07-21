import type { PAYMENT_PROVIDERS } from '@shared/payment/constants/providers'
import type { InitiatePaymentApiRequest } from '@shared/payment/types/api.types'

export type PaymentProviderId = (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS]

export type PaymentStatus =
  | 'idle'
  | 'initiating'
  | 'ready'
  | 'processing'
  | 'verifying'
  | 'success'
  | 'failed'
  | 'cancelled'

export type PaymentOrderSummaryItem = {
  label: string
  amount: number
}

export type PaymentOrderSummary = {
  title?: string
  items?: PaymentOrderSummaryItem[]
  subtotal?: number
  shipping?: number
  tax?: number
  total: number
  currency: string
}

export type PaymentRequest = {
  provider: PaymentProviderId
  orderId: string
  amount: number
  currency: string
  summary?: PaymentOrderSummary
  initiatePayload: InitiatePaymentApiRequest
}

export type PaymentSession = {
  provider: PaymentProviderId
  checkoutId: string
  transactionId: string
  orderId: string
  amount: number
  currency: string
}

export type PaymentResult = {
  success: boolean
  status: PaymentStatus
  transactionId: string
  orderId: string
  message?: string
  fieldErrors?: Record<string, string[]>
}

export type PaymentCallbackPayload = {
  resourcePath?: string
  checkoutId?: string
}

export type PaymentModalPhase = 'loading' | 'widget' | 'verifying' | 'success' | 'failure'
