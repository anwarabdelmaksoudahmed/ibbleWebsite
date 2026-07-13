import { getOrdersService, toInitiatePayload } from '@modules/checkout/services/orders.service'
import type { CreateOrderInput } from '@modules/checkout/types'
import type { CreateOrderApiResponse } from '@modules/checkout/types/api.types'
import { PAYMENT_PROVIDERS } from '@shared/payment/constants/providers'
import type { PaymentRequest, PaymentResult } from '@shared/payment/types/internal.types'

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
  ): Promise<PaymentResult> {
    if (summary) {
      payment.openPreparing(summary)
    }

    try {
      const order = await createOrder(input)
      return await payWithHyperPay(order, summary)
    } catch (error) {
      payment.close()
      const apiError = handleError(error, true)
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
