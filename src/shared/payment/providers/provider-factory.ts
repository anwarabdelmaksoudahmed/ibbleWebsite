import { PAYMENT_PROVIDERS } from '@shared/payment/constants/providers'
import { HyperPayProvider } from '@shared/payment/providers/hyperpay.provider'
import type { PaymentProvider } from '@shared/payment/providers/payment-provider.interface'
import type { PaymentProviderId } from '@shared/payment/types/internal.types'

type ProviderFactoryConfig = {
  hyperPayWidgetBaseUrl: string
}

export class ProviderFactory {
  private readonly providers = new Map<PaymentProviderId, PaymentProvider>()

  constructor(config: ProviderFactoryConfig) {
    this.register(new HyperPayProvider({ widgetBaseUrl: config.hyperPayWidgetBaseUrl }))
  }

  register(provider: PaymentProvider): void {
    this.providers.set(provider.id, provider)
  }

  get(providerId: PaymentProviderId): PaymentProvider {
    const provider = this.providers.get(providerId)

    if (!provider) {
      throw new Error(`Payment provider "${providerId}" is not registered`)
    }

    return provider
  }

  has(providerId: PaymentProviderId): boolean {
    return this.providers.has(providerId)
  }

  get supportedProviders(): PaymentProviderId[] {
    return [...this.providers.keys()]
  }
}

let providerFactory: ProviderFactory | null = null

export function getProviderFactory(): ProviderFactory {
  if (!providerFactory) {
    const config = useRuntimeConfig()
    providerFactory = new ProviderFactory({
      hyperPayWidgetBaseUrl: config.public.hyperPayWidgetBaseUrl,
    })
  }

  return providerFactory
}

export function isSupportedPaymentProvider(providerId: string): providerId is PaymentProviderId {
  return getProviderFactory().has(providerId as PaymentProviderId)
}

export { PAYMENT_PROVIDERS }
