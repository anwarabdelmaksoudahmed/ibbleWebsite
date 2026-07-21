import { getApiErrorMessage, getApiFieldErrors } from '@core/api/http/errors'
import { getInsuranceService } from '@modules/insurance/services/insurance.service'
import type { InsuranceCustomerFormValues } from '@modules/insurance/schemas/customer.schema'
import type { InsurancePaymentMethodId } from '@modules/insurance/schemas/payment.schema'
import type { InsuranceShipmentFormValues } from '@modules/insurance/schemas/shipment.schema'
import type { InsuranceServiceProvider } from '@modules/insurance/types'
import {
  buildCreateInsurancePayload,
  isCreateInsuranceCardResponse,
  toInsuranceInitiatePayload,
} from '@modules/insurance/utils/create-insurance-payload'
import { PAYMENT_PROVIDERS } from '@shared/payment/constants/providers'
import type { PaymentRequest, PaymentResult } from '@shared/payment/types/internal.types'
import {
  createFailureResult,
  createSuccessResult,
} from '@shared/payment/utils/mappers'

export type PlaceInsurancePaymentInput = {
  customer: InsuranceCustomerFormValues
  shipment: InsuranceShipmentFormValues
  provider: InsuranceServiceProvider
  iban: string
  paymentMethod: InsurancePaymentMethodId
  pinCode?: string
  camelStatusLabel?: string
  summary?: PaymentRequest['summary']
}

export function useInsurancePayment() {
  const { handleError } = useApi()
  const payment = usePayment()

  function buildPaymentRequest(
    order: Parameters<typeof toInsuranceInitiatePayload>[0],
    summary?: PaymentRequest['summary'],
  ): PaymentRequest {
    return {
      provider: PAYMENT_PROVIDERS.HYPERPAY,
      orderId: String(order.merchant_transaction_id),
      amount: Number(order.amount),
      currency: order.currency,
      summary,
      initiatePayload: toInsuranceInitiatePayload(order),
    }
  }

  async function placeInsurancePayment(
    input: PlaceInsurancePaymentInput,
  ): Promise<PaymentResult> {
    try {
      const payload = buildCreateInsurancePayload({
        customer: input.customer,
        shipment: input.shipment,
        provider: input.provider,
        iban: input.iban,
        paymentMethod: input.paymentMethod,
        pinCode: input.pinCode,
        camelStatusLabel: input.camelStatusLabel,
      })

      const response = await getInsuranceService().createInsurance(payload)

      if (input.paymentMethod === 'card') {
        if (!isCreateInsuranceCardResponse(response)) {
          return createFailureResult(
            '',
            '',
            response.message || 'Unexpected payment response',
          )
        }

        return await payment.pay(buildPaymentRequest(response, input.summary))
      }

      // Wallet: backend settles immediately when PIN is valid.
      if (isCreateInsuranceCardResponse(response)) {
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
    placeInsurancePayment,
    closePayment: payment.close,
  }
}
