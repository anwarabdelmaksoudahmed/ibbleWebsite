import type {
  PaymentCallbackPayload,
  PaymentSession,
} from '@shared/payment/types/internal.types'

export type PaymentWidgetMountOptions = {
  locale: string
  shopperResultUrl: string
  onReady?: () => void
  onError?: (message: string) => void
  onCallback?: (payload: PaymentCallbackPayload) => void
}

export interface PaymentProvider {
  readonly id: PaymentSession['provider']
  loadSdk(session: PaymentSession): Promise<void>
  mountWidget(container: HTMLElement, session: PaymentSession, options: PaymentWidgetMountOptions): void
  destroyWidget(): void
}
