import {
  getOrdersService,
  isCardOrderResponse,
  toInitiatePayload,
} from '@modules/checkout/services/orders.service'
import type { CreateOrderInput } from '@modules/checkout/types'
import type { CardOrderApiResponse, CreateOrderApiResponse } from '@modules/checkout/types/api.types'
import { getApiErrorMessage, getApiFieldErrors } from '@core/api/http/errors'
import {
  createFailureResult,
  createSuccessResult,
} from '@shared/payment/utils/mappers'
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
    order: CardOrderApiResponse,
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
    order: CardOrderApiResponse,
    summary?: PaymentRequest['summary'],
  ): Promise<PaymentResult> {
    return payment.pay(buildPaymentRequest(order, summary))
  }

  async function placeWalletOrder(input: CreateOrderInput): Promise<PaymentResult> {
    try {
      const order = await createOrder({
        ...input,
        paymentMethodId: 'wallet',
      })

      if (isCardOrderResponse(order)) {
        return createFailureResult('', '', 'Unexpected payment response')
      }

      return createSuccessResult('', '', order.message)
    } catch (error) {
      const apiError = handleError(error, false)
      return createFailureResult(
        '',
        '',
        getApiErrorMessage(apiError),
        getApiFieldErrors(apiError),
      )
    }
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

      if (!isCardOrderResponse(order)) {
        return createFailureResult('', '', order.message || 'Unexpected payment response')
      }

      return await payWithHyperPay(order, summary)
    } catch (error) {
      clearCheckoutCartSnapshot()
      payment.close()
      const apiError = handleError(error, false)
      return createFailureResult(
        '',
        '',
        getApiErrorMessage(apiError),
        getApiFieldErrors(apiError),
      )
    }
  }

  return {
    createOrder,
    buildPaymentRequest,
    payWithHyperPay,
    placeCardOrder,
    placeWalletOrder,
  }
}
