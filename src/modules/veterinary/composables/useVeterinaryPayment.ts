import { getApiErrorMessage, getApiFieldErrors } from '@core/api/http/errors'
import { getVeterinaryReservationsService } from '@modules/veterinary/services/reservations.service'
import type { VeterinaryBookingPaymentForm } from '@modules/veterinary/types'
import type { VeterinaryServiceTypeId } from '@modules/veterinary/constants/routes'
import {
  buildCreateVeterinaryReservationPayload,
  isCreateVeterinaryCardResponse,
  toVeterinaryInitiatePayload,
} from '@modules/veterinary/utils/create-reservation-payload'
import { PAYMENT_PROVIDERS } from '@shared/payment/constants/providers'
import type { PaymentRequest, PaymentResult } from '@shared/payment/types/internal.types'
import {
  createFailureResult,
  createSuccessResult,
} from '@shared/payment/utils/mappers'
import type {
  VeterinaryAppointmentDay,
  VeterinaryAppointmentSlot,
  VeterinaryDoctor,
  VeterinaryWeekdayName,
} from '@modules/veterinary/types/internal.types'

export type PlaceVeterinaryPaymentInput = {
  doctor: VeterinaryDoctor
  serviceType: VeterinaryServiceTypeId
  day: VeterinaryWeekdayName
  date: string
  slot: VeterinaryAppointmentSlot
  payment: VeterinaryBookingPaymentForm
  pinCode?: string
  summary?: PaymentRequest['summary']
}

export function useVeterinaryPayment() {
  const { handleError } = useApi()
  const payment = usePayment()

  function buildPaymentRequest(
    order: Parameters<typeof toVeterinaryInitiatePayload>[0],
    summary?: PaymentRequest['summary'],
  ): PaymentRequest {
    return {
      provider: PAYMENT_PROVIDERS.HYPERPAY,
      orderId: String(order.merchant_transaction_id),
      amount: Number(order.amount),
      currency: order.currency,
      summary,
      initiatePayload: toVeterinaryInitiatePayload(order),
    }
  }

  async function placeVeterinaryPayment(
    input: PlaceVeterinaryPaymentInput,
  ): Promise<PaymentResult> {
    try {
      const payload = buildCreateVeterinaryReservationPayload({
        doctor: input.doctor,
        serviceType: input.serviceType,
        day: input.day,
        date: input.date,
        slot: input.slot,
        payment: input.payment,
        pinCode: input.pinCode,
      })

      const response = await getVeterinaryReservationsService().createReservation(payload)

      if (input.payment.paymentMethod === 'card') {
        if (!isCreateVeterinaryCardResponse(response)) {
          return createFailureResult(
            '',
            '',
            response.message || 'Unexpected payment response',
          )
        }

        return await payment.pay(buildPaymentRequest(response, input.summary))
      }

      if (isCreateVeterinaryCardResponse(response)) {
        return createFailureResult('', '', 'Unexpected payment response')
      }

      return createSuccessResult(
        response.id != null ? String(response.id) : '',
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
    placeVeterinaryPayment,
    closePayment: payment.close,
  }
}
