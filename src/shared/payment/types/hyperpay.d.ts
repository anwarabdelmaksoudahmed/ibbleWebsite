export type HyperPayWidgetError = {
  name?: string
  message?: string
}

export type HyperPayWpwlOptions = {
  style?: string
  locale?: string
  paymentTarget?: string
  onReady?: () => void
  onError?: (error: HyperPayWidgetError) => void
}

declare global {
  interface Window {
    wpwlOptions?: HyperPayWpwlOptions
  }
}

export {}
