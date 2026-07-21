import type { CartStoreGroup } from '@modules/cart/types'
import type { PaymentRequest, PaymentResult, PaymentSession } from '@shared/payment/types/internal.types'

const PENDING_PAYMENT_KEY = 'ibble:payment-pending'
const PAYMENT_OUTCOME_KEY = 'ibble:payment-outcome'
const CART_SNAPSHOT_KEY = 'ibble:payment-cart-snapshot'

export type PendingPaymentContext = {
  session: PaymentSession
  request: PaymentRequest
  returnPath: string
  cartSnapshot?: CartStoreGroup
}

export type StoredPaymentOutcome = {
  result: PaymentResult
  request: PaymentRequest
  cartSnapshot?: CartStoreGroup
}

function canUseSessionStorage(): boolean {
  return import.meta.client && typeof sessionStorage !== 'undefined'
}

export function persistCheckoutCartSnapshot(snapshot: CartStoreGroup): void {
  if (!canUseSessionStorage()) return
  sessionStorage.setItem(CART_SNAPSHOT_KEY, JSON.stringify(snapshot))
}

export function loadCheckoutCartSnapshot(): CartStoreGroup | null {
  if (!canUseSessionStorage()) return null

  const raw = sessionStorage.getItem(CART_SNAPSHOT_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as CartStoreGroup
  } catch {
    return null
  }
}

export function clearCheckoutCartSnapshot(): void {
  if (!canUseSessionStorage()) return
  sessionStorage.removeItem(CART_SNAPSHOT_KEY)
}

export function persistPendingPayment(context: PendingPaymentContext): void {
  if (!canUseSessionStorage()) return
  sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(context))
}

export function loadPendingPayment(): PendingPaymentContext | null {
  if (!canUseSessionStorage()) return null

  const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as PendingPaymentContext
  } catch {
    return null
  }
}

export function clearPendingPayment(): void {
  if (!canUseSessionStorage()) return
  sessionStorage.removeItem(PENDING_PAYMENT_KEY)
  clearCheckoutCartSnapshot()
}

export function savePaymentOutcome(outcome: StoredPaymentOutcome): void {
  if (!canUseSessionStorage()) return
  sessionStorage.setItem(PAYMENT_OUTCOME_KEY, JSON.stringify(outcome))
}

export function consumePaymentOutcome(): StoredPaymentOutcome | null {
  if (!canUseSessionStorage()) return null

  const raw = sessionStorage.getItem(PAYMENT_OUTCOME_KEY)
  if (!raw) return null

  sessionStorage.removeItem(PAYMENT_OUTCOME_KEY)

  try {
    return JSON.parse(raw) as StoredPaymentOutcome
  } catch {
    return null
  }
}
