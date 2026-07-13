import { storeToRefs } from 'pinia'
import { getPaymentService } from '@shared/payment/services/payment.service'
import { usePaymentStore } from '@shared/payment/stores/payment.store'
import type {
  PaymentCallbackPayload,
  PaymentOrderSummary,
  PaymentRequest,
  PaymentResult,
} from '@shared/payment/types/internal.types'
import {
  createCancelledResult,
  createFailureResult,
} from '@shared/payment/utils/mappers'

type PaymentCompletionHandler = (result: PaymentResult) => void

let completionHandler: PaymentCompletionHandler | null = null

/**
 * Global payment orchestration composable.
 * Business modules should only interact with this API.
 */
export function usePayment() {
  const store = usePaymentStore()
  const {
    isOpen,
    isLoading,
    modalPhase,
    summary,
    result,
    errorMessage,
    canRetry,
    status,
  } = storeToRefs(store)
  const service = getPaymentService()
  const { handleError } = useApi()
  const { locale } = useI18n()
  const runtimeConfig = useRuntimeConfig()

  const shopperResultUrl = computed(
    () => `${runtimeConfig.public.appUrl}/payment/callback`,
  )

  function registerCompletionHandler(handler: PaymentCompletionHandler) {
    completionHandler = handler
  }

  function resolvePayment(result: PaymentResult) {
    store.setResult(result)
    store.setLoading(false)
    completionHandler?.(result)
    completionHandler = null
  }

  function openPreparing(orderSummary: PaymentOrderSummary) {
    store.openPreparing(orderSummary)
  }

  async function pay(request: PaymentRequest): Promise<PaymentResult> {
    store.open(request)

    const completionPromise = new Promise<PaymentResult>((resolve) => {
      registerCompletionHandler(resolve)
    })

    try {
      const session = await service.initiate(request)
      store.setSession(session)
      store.setStatus('ready')
      store.setModalPhase('widget')
      store.setLoading(false)

      return await completionPromise
    } catch (error) {
      const apiError = handleError(error, true)
      const failure = createFailureResult(request.orderId, '', apiError.message)
      resolvePayment(failure)
      return failure
    }
  }

  async function mountActiveWidget(container: HTMLElement): Promise<void> {
    const session = store.session
    if (!session) return

    store.setStatus('processing')

    await service.mountWidget(container, session, {
      locale: locale.value,
      shopperResultUrl: shopperResultUrl.value,
      onReady: () => {
        store.setLoading(false)
      },
      onError: (message) => {
        store.setErrorMessage(message)
        resolvePayment(createFailureResult(session.orderId, session.transactionId, message))
      },
      onCallback: (payload: PaymentCallbackPayload) => {
        void handlePaymentCallback(payload)
      },
    })
  }

  async function handlePaymentCallback(payload: PaymentCallbackPayload) {
    const session = store.session
    if (!session) return

    store.setStatus('verifying')
    store.setModalPhase('verifying')
    store.setLoading(true)

    const result = await service.handleCallback(session, payload)
    service.destroyWidget(session)
    resolvePayment(result)
  }

  async function cancel() {
    const session = store.session
    const request = store.request

    if (session) {
      await service.cancelPayment(session.transactionId)
      service.destroyWidget(session)
    }

    const result = createCancelledResult(
      request?.orderId ?? session?.orderId ?? '',
      session?.transactionId ?? '',
    )

    resolvePayment(result)
    store.close()
  }

  function open() {
    if (store.request) {
      store.isOpen = true
    }
  }

  function close() {
    const session = store.session
    if (session) {
      service.destroyWidget(session)
    }
    store.close()
  }

  async function retry() {
    const request = store.request
    if (!request) return

    const session = store.session
    if (session) {
      service.destroyWidget(session)
    }

    store.setSession(null)
    store.setResult(null)
    store.setErrorMessage(null)
    store.setStatus('initiating')
    store.setModalPhase('loading')
    store.setLoading(true)

    const completionPromise = new Promise<PaymentResult>((resolve) => {
      registerCompletionHandler(resolve)
    })

    try {
      const nextSession = await service.initiate(request)
      store.setSession(nextSession)
      store.setStatus('ready')
      store.setModalPhase('widget')
      store.setLoading(false)
      return await completionPromise
    } catch (error) {
      const apiError = handleError(error, true)
      const failure = createFailureResult(request.orderId, '', apiError.message)
      resolvePayment(failure)
      return failure
    }
  }

  function destroyActiveWidget() {
    const session = store.session
    if (session) {
      service.destroyWidget(session)
    }
  }

  return {
    pay,
    openPreparing,
    cancel,
    open,
    close,
    retry,
    mountActiveWidget,
    destroyActiveWidget,
    resolvePayment,
    status,
    isLoading,
    isOpen,
    result,
    modalPhase,
    summary,
    errorMessage,
    canRetry,
  }
}
