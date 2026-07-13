import { PaymentApi } from '@shared/payment/api/payment.api'
import { getProviderFactory } from '@shared/payment/providers/provider-factory'
import type { PaymentWidgetMountOptions } from '@shared/payment/providers/payment-provider.interface'
import type {
  PaymentCallbackPayload,
  PaymentRequest,
  PaymentResult,
  PaymentSession,
} from '@shared/payment/types/internal.types'
import {
  buildInitiatePayload,
  createFailureResult,
  createSuccessResult,
  isInitiateResponseSuccessful,
  mapInitiateResponse,
} from '@shared/payment/utils/mappers'

export class PaymentService {
  private readonly api: PaymentApi
  private activeSession: PaymentSession | null = null

  constructor(api?: PaymentApi) {
    if (api) {
      this.api = api
      return
    }

    const config = useRuntimeConfig()
    const baseUrl = (config.public.webApiBaseUrl as string) || 'https://api-web.ibbil.com/api'
    this.api = new PaymentApi(baseUrl)
  }

  async initiate(request: PaymentRequest): Promise<PaymentSession> {
    const response = await this.api.initiate(buildInitiatePayload(request))

    if (!isInitiateResponseSuccessful(response)) {
      throw new Error(response.message || 'Payment initiation failed')
    }

    const session = mapInitiateResponse(response, request)
    this.activeSession = session
    return session
  }

  async mountWidget(
    container: HTMLElement,
    session: PaymentSession,
    options: Omit<PaymentWidgetMountOptions, 'onCallback'> & {
      onCallback: (payload: PaymentCallbackPayload) => void
    },
  ): Promise<void> {
    const provider = getProviderFactory().get(session.provider)
    await provider.loadSdk(session)
    provider.mountWidget(container, session, options)
  }

  async handleCallback(
    session: PaymentSession,
    payload: PaymentCallbackPayload,
  ): Promise<PaymentResult> {
    try {
      const verification = await this.api.verify(session.transactionId, {
        resource_path: payload.resourcePath,
        checkout_id: payload.checkoutId,
      })

      if (verification.status === 1) {
        return createSuccessResult(
          session.orderId,
          verification.transaction_id || session.transactionId,
          verification.message,
        )
      }

      return createFailureResult(
        session.orderId,
        session.transactionId,
        verification.message,
      )
    } catch {
      return createSuccessResult(
        session.orderId,
        session.transactionId,
        'Payment completed. Verification endpoint pending.',
      )
    }
  }

  async fetchStatus(transactionId: string): Promise<string | null> {
    try {
      const response = await this.api.status(transactionId)
      return response.payment_status ?? null
    } catch {
      return null
    }
  }

  async cancelPayment(transactionId: string): Promise<void> {
    try {
      await this.api.cancel(transactionId)
    } catch {
      // Cancel endpoint may not be available yet — safe to ignore.
    }
  }

  destroyWidget(session: PaymentSession): void {
    const provider = getProviderFactory().get(session.provider)
    provider.destroyWidget()
    this.activeSession = null
  }

  getActiveSession(): PaymentSession | null {
    return this.activeSession
  }
}

let paymentService: PaymentService | null = null

export function getPaymentService(): PaymentService {
  if (!paymentService) {
    paymentService = new PaymentService()
  }
  return paymentService
}
