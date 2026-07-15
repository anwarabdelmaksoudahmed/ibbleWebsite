import { getOrdersService, toInitiatePayload } from '@modules/checkout/services/orders.service'
import type { CreateOrderInput } from '@modules/checkout/types'
import type { CreateOrderApiResponse } from '@modules/checkout/types/api.types'
import type { CartStoreGroup } from '@modules/cart/types'
import { PAYMENT_PROVIDERS } from '@shared/payment/constants/providers'
import type { PaymentRequest, PaymentResult } from '@shared/payment/types/internal.types'
import { persistCheckoutCartSnapshot, clearCheckoutCartSnapshot } from '@shared/payment/utils/pending-payment'

export function useCheckoutOrder() {
  const { handleError } = useApi()
  const payment = usePayment()

  async function createOrder(input: CreateOrderInput): Promise<CreateOrderApiResponse> {
    return getOrdersService().create(input)
  }

  function buildPaymentRequest(
    order: CreateOrderApiResponse,
    summary?: PaymentRequest['summary'],
  ): PaymentRequest {
    return {
      provider: PAYMENT_PROVIDERS.HYPERPAY,
      orderId: String(order.merchant_transaction_id),
      amount: order.amount,
      currency: order.currency,
      summary,
      initiatePayload: toInitiatePayload(order),
    }
  }

  async function payWithHyperPay(
    order: CreateOrderApiResponse,
    summary?: PaymentRequest['summary'],
  ): Promise<PaymentResult> {
    return payment.pay(buildPaymentRequest(order, summary))
  }

  async function placeCardOrder(
    input: CreateOrderInput,
    summary?: PaymentRequest['summary'],
    cartSnapshot?: CartStoreGroup,
  ): Promise<PaymentResult> {
    try {
      if (cartSnapshot) {
        persistCheckoutCartSnapshot(cartSnapshot)
      }

      const order = await createOrder(input)
      return await payWithHyperPay(order, summary)
    } catch (error) {
      clearCheckoutCartSnapshot()
      payment.close()
      const apiError = handleError(error, false)
      return {
        success: false,
        status: 'failed',
        transactionId: '',
        orderId: '',
        message: apiError.message,
      }
    }
  }

  return {
    createOrder,
    buildPaymentRequest,
    payWithHyperPay,
    placeCardOrder,
  }
}
