import { PAYMENT_CALLBACK_MESSAGE_TYPE, HYPERPAY_BRANDS } from '@shared/payment/constants/providers'
import type { PaymentProvider, PaymentWidgetMountOptions } from '@shared/payment/providers/payment-provider.interface'
import type { PaymentCallbackPayload, PaymentSession } from '@shared/payment/types/internal.types'
import type { HyperPayWidgetError } from '@shared/payment/types/hyperpay.d'
import {
  buildHyperPayScriptUrl,
  loadScript,
  removeScript,
} from '@shared/payment/utils/script-loader'

const HYPERPAY_SCRIPT_ID_PREFIX = 'hyperpay-payment-widgets'
const HYPERPAY_IFRAME_NAME = 'hyperpay-payment-result-frame'

type HyperPayRuntimeConfig = {
  widgetBaseUrl: string
}

export class HyperPayProvider implements PaymentProvider {
  readonly id = 'hyperpay' as const

  private readonly config: HyperPayRuntimeConfig
  private container: HTMLElement | null = null
  private messageHandler: ((event: MessageEvent) => void) | null = null
  private mountOptions: PaymentWidgetMountOptions | null = null
  private currentScriptId: string | null = null

  constructor(config: HyperPayRuntimeConfig) {
    this.config = config
  }

  async loadSdk(session: PaymentSession): Promise<void> {
    const scriptId = `${HYPERPAY_SCRIPT_ID_PREFIX}-${session.checkoutId}`
    this.currentScriptId = scriptId

    const scriptUrl = buildHyperPayScriptUrl(this.config.widgetBaseUrl, session.checkoutId)
    await loadScript(scriptUrl, scriptId)
  }

  mountWidget(
    container: HTMLElement,
    session: PaymentSession,
    options: PaymentWidgetMountOptions,
  ): void {
    this.destroyWidget()
    this.container = container
    this.mountOptions = options

    const iframe = document.createElement('iframe')
    iframe.name = HYPERPAY_IFRAME_NAME
    iframe.title = 'Payment result'
    iframe.setAttribute('aria-hidden', 'true')
    iframe.tabIndex = -1
    iframe.style.cssText =
      'position:absolute;width:0;height:0;border:0;opacity:0;pointer-events:none;visibility:hidden'

    const widgetHost = document.createElement('div')
    widgetHost.className = 'payment-widget-host relative z-[1] w-full'

    const form = document.createElement('form')
    form.action = options.shopperResultUrl
    form.method = 'POST'
    form.className = 'paymentWidgets'
    form.target = HYPERPAY_IFRAME_NAME
    form.setAttribute('data-brands', HYPERPAY_BRANDS.join(' '))

    window.wpwlOptions = {
      style: 'card',
      locale: options.locale,
      paymentTarget: HYPERPAY_IFRAME_NAME,
      onReady: () => options.onReady?.(),
      onError: (error: HyperPayWidgetError) => {
        options.onError?.(error.message ?? 'HyperPay widget error')
      },
    }

    widgetHost.appendChild(form)
    container.appendChild(widgetHost)
    container.appendChild(iframe)

    this.messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!isPaymentCallbackMessage(event.data)) return

      const payload: PaymentCallbackPayload = {
        resourcePath: event.data.resourcePath,
        checkoutId: event.data.checkoutId ?? session.checkoutId,
      }

      options.onCallback?.(payload)
    }

    window.addEventListener('message', this.messageHandler)
  }

  destroyWidget(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler)
      this.messageHandler = null
    }

    if (this.container) {
      this.container.replaceChildren()
      this.container = null
    }

    if (this.currentScriptId) {
      removeScript(this.currentScriptId)
      this.currentScriptId = null
    }

    delete window.wpwlOptions
    this.mountOptions = null
  }
}

type PaymentCallbackMessage = {
  type: typeof PAYMENT_CALLBACK_MESSAGE_TYPE
  resourcePath?: string
  checkoutId?: string
}

function isPaymentCallbackMessage(data: unknown): data is PaymentCallbackMessage {
  if (!data || typeof data !== 'object') return false
  return (data as PaymentCallbackMessage).type === PAYMENT_CALLBACK_MESSAGE_TYPE
}
