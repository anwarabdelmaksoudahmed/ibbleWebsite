import type { PaymentMethodId } from '@modules/checkout/types'

/** Marketplace `payment_method_id` values for checkout orders. */
export const CHECKOUT_PAYMENT_METHOD_IDS: Record<PaymentMethodId, string> = {
  card: '1',
  wallet: '2',
} as const
