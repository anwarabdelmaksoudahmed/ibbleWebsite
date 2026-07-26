export type SseConnectionStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed' | 'error'

export type SseMessage = {
  /** SSE `event:` field, or fallback `message`. */
  event: string
  data: string
  id?: string
  retry?: number
}

export type AuthenticatedSseOptions = {
  url: string
  getAccessToken: () => string | null | undefined
  onMessage: (message: SseMessage) => void
  onStatusChange?: (status: SseConnectionStatus) => void
  /** Called with non-fatal stream errors before a reconnect attempt. */
  onError?: (error: unknown) => void
  /** Initial reconnect delay (ms). Default 1000. */
  initialRetryMs?: number
  /** Cap for exponential backoff (ms). Default 30_000. */
  maxRetryMs?: number
  /** Optional log prefix. Default `[SSE]`. */
  logPrefix?: string
}
