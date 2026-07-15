import { defineStore } from 'pinia'
import type {
  PaymentModalPhase,
  PaymentOrderSummary,
  PaymentRequest,
  PaymentResult,
  PaymentSession,
  PaymentStatus,
} from '@shared/payment/types/internal.types'

type PaymentState = {
  isOpen: boolean
  isLoading: boolean
  status: PaymentStatus
  modalPhase: PaymentModalPhase
  request: PaymentRequest | null
  summary: PaymentOrderSummary | null
  session: PaymentSession | null
  result: PaymentResult | null
  errorMessage: string | null
}

export const usePaymentStore = defineStore('payment', {
  state: (): PaymentState => ({
    isOpen: false,
    isLoading: false,
    status: 'idle',
    modalPhase: 'loading',
    request: null,
    summary: null,
    session: null,
    result: null,
    errorMessage: null,
  }),

  getters: {
    hasActiveSession: (state) => Boolean(state.session),
    canRetry: (state) => state.modalPhase === 'failure' && Boolean(state.request),
  },

  actions: {
    reset() {
      this.isOpen = false
      this.isLoading = false
      this.status = 'idle'
      this.modalPhase = 'loading'
      this.request = null
      this.summary = null
      this.session = null
      this.result = null
      this.errorMessage = null
    },

    open(request: PaymentRequest) {
      this.isOpen = true
      this.isLoading = true
      this.request = request
      this.summary = request.summary ?? {
        total: request.amount,
        currency: request.currency,
      }
      this.session = null
      this.status = 'initiating'
      this.modalPhase = 'loading'
      this.result = null
      this.errorMessage = null
    },

    openPreparing(summary: PaymentOrderSummary) {
      this.isOpen = true
      this.isLoading = true
      this.request = null
      this.summary = summary
      this.session = null
      this.status = 'initiating'
      this.modalPhase = 'loading'
      this.result = null
      this.errorMessage = null
    },

    setLoading(isLoading: boolean) {
      this.isLoading = isLoading
    },

    setStatus(status: PaymentStatus) {
      this.status = status
    },

    setModalPhase(modalPhase: PaymentModalPhase) {
      this.modalPhase = modalPhase
    },

    setSession(session: PaymentSession | null) {
      this.session = session
    },

    setResult(result: PaymentResult | null) {
      if (!result) {
        this.result = null
        return
      }

      this.result = result
      this.status = result.status
      this.modalPhase = result.success ? 'success' : 'failure'
      this.errorMessage = result.success ? null : result.message ?? null
    },

    setErrorMessage(message: string | null) {
      this.errorMessage = message
      if (message) {
        this.status = 'failed'
        this.modalPhase = 'failure'
      }
    },

    restoreOutcome(result: PaymentResult, request: PaymentRequest) {
      this.isOpen = true
      this.isLoading = false
      this.request = request
      this.summary = request.summary ?? {
        total: request.amount,
        currency: request.currency,
      }
      this.result = result
      this.status = result.status
      this.modalPhase = result.success ? 'success' : 'failure'
      this.errorMessage = result.success ? null : result.message ?? null
    },

    close() {
      this.isOpen = false
    },
  },
})
