import { getApiErrorMessage, getApiFieldErrors } from '@core/api/http/errors'
import {
  TRANSPORT_PAYMENT_METHOD_IDS,
  type TransportPaymentMethodId,
} from '@modules/transport/constants/endpoints'
import { getTransportTripsService } from '@modules/transport/services/trips.service'
import {
  isPayTransportTripCardResponse,
  toTransportInitiatePayload,
} from '@modules/transport/utils/trip-payment-mappers'
import { PAYMENT_PROVIDERS } from '@shared/payment/constants/providers'
import type { PaymentRequest, PaymentResult } from '@shared/payment/types/internal.types'
import {
  createFailureResult,
  createSuccessResult,
} from '@shared/payment/utils/mappers'

export type PlaceTransportTripPaymentInput = {
  tripId: string
  paymentMethod: TransportPaymentMethodId
  pinCode?: string
  summary?: PaymentRequest['summary']
}

export function useTransportTripPayment() {
  const { handleError } = useApi()
  const payment = usePayment()

  function buildPaymentRequest(
    order: Parameters<typeof toTransportInitiatePayload>[0],
    summary?: PaymentRequest['summary'],
  ): PaymentRequest {
    return {
      provider: PAYMENT_PROVIDERS.HYPERPAY,
      orderId: String(order.merchant_transaction_id),
      amount: Number(order.amount),
      currency: order.currency,
      summary,
      initiatePayload: toTransportInitiatePayload(order),
    }
  }

  async function placeTransportTripPayment(
    input: PlaceTransportTripPaymentInput,
  ): Promise<PaymentResult> {
    try {
      const payload = {
        payment_method_id: TRANSPORT_PAYMENT_METHOD_IDS[input.paymentMethod],
        ...(input.paymentMethod === 'wallet' && input.pinCode
          ? { PIN_code: input.pinCode }
          : {}),
      }

      console.log('[TripPay] PATCH /trips/:id/pay', {
        tripId: input.tripId,
        paymentMethod: input.paymentMethod,
        payment_method_id: payload.payment_method_id,
      })

      const response = await getTransportTripsService().payTrip(input.tripId, payload)

      if (input.paymentMethod === 'card') {
        if (!isPayTransportTripCardResponse(response)) {
          return createFailureResult(
            '',
            '',
            response.message || 'Unexpected payment response',
          )
        }
        return await payment.pay(buildPaymentRequest(response, input.summary))
      }

      if (isPayTransportTripCardResponse(response)) {
        return createFailureResult('', '', 'Unexpected payment response')
      }

      return createSuccessResult(
        response.data?.id != null ? String(response.data.id) : input.tripId,
        '',
        response.message,
      )
    } catch (error) {
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
    placeTransportTripPayment,
    closePayment: payment.close,
  }
}
