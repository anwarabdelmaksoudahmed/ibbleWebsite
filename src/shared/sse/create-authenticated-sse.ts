import { createSseChunkParser } from '@shared/sse/parse-sse-chunk'
import type { AuthenticatedSseOptions, SseConnectionStatus } from '@shared/sse/types'

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

/**
 * Authenticated SSE over `fetch` + ReadableStream.
 * Native `EventSource` cannot send `Authorization` headers — this can.
 *
 * Features:
 * - Bearer token per connect attempt (fresh token on reconnect)
 * - Exponential backoff reconnect
 * - AbortController cleanup
 * - Verbose `[SSE]` console tracing
 */
export function connectAuthenticatedSse(options: AuthenticatedSseOptions): () => void {
  const {
    url,
    getAccessToken,
    onMessage,
    onStatusChange,
    onError,
    initialRetryMs = 1000,
    maxRetryMs = 30_000,
    logPrefix = '[SSE]',
  } = options

  const controller = new AbortController()
  let retryMs = initialRetryMs
  let attempt = 0
  let setStatus: (status: SseConnectionStatus) => void = () => undefined

  setStatus = (status: SseConnectionStatus) => {
    console.log(`${logPrefix} status → ${status}`, { url, attempt })
    onStatusChange?.(status)
  }

  async function readStream(response: Response) {
    const body = response.body
    if (!body) throw new Error('SSE response has no body')

    const reader = body.getReader()
    const decoder = new TextDecoder()
    const parser = createSseChunkParser((message) => {
      console.log(`${logPrefix} frame`, {
        event: message.event,
        id: message.id,
        retry: message.retry,
        dataPreview: message.data.slice(0, 300),
      })
      onMessage(message)
    })

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log(`${logPrefix} stream ended by server`)
          parser.flush()
          break
        }
        parser.push(decoder.decode(value, { stream: true }))
      }
    } finally {
      reader.releaseLock()
    }
  }

  async function runLoop() {
    setStatus('connecting')

    while (!controller.signal.aborted) {
      attempt += 1
      const token = getAccessToken()?.trim()
      if (!token) {
        const error = new Error('Missing access token for SSE')
        console.error(`${logPrefix} cannot connect`, error)
        onError?.(error)
        setStatus('error')
        try {
          await sleep(retryMs, controller.signal)
        } catch {
          break
        }
        retryMs = Math.min(retryMs * 2, maxRetryMs)
        setStatus('reconnecting')
        continue
      }

      console.log(`${logPrefix} connecting`, {
        url,
        attempt,
        hasToken: true,
        tokenPreview: `${token.slice(0, 12)}…`,
      })

      try {
        if (attempt > 1) setStatus('reconnecting')
        else setStatus('connecting')

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'text/event-stream',
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
          signal: controller.signal,
          // Avoid browser HTTP cache interfering with long-lived streams
          cache: 'no-store',
        })

        console.log(`${logPrefix} response`, {
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type'),
        })

        if (!response.ok) {
          const text = await response.text().catch(() => '')
          throw new Error(`SSE HTTP ${response.status}: ${text.slice(0, 200)}`)
        }

        setStatus('open')
        retryMs = initialRetryMs
        await readStream(response)

        if (controller.signal.aborted) break
        console.warn(`${logPrefix} stream closed — will reconnect`, { retryMs })
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted) {
          console.log(`${logPrefix} aborted (intentional disconnect)`)
          break
        }
        console.error(`${logPrefix} connection error`, error)
        onError?.(error)
        setStatus('error')
      }

      if (controller.signal.aborted) break

      console.log(`${logPrefix} backoff before reconnect`, { retryMs, nextAttempt: attempt + 1 })
      setStatus('reconnecting')
      try {
        await sleep(retryMs, controller.signal)
      } catch {
        break
      }
      retryMs = Math.min(retryMs * 2, maxRetryMs)
    }

    setStatus('closed')
  }

  void runLoop()

  return () => {
    console.log(`${logPrefix} disconnect requested`)
    controller.abort()
  }
}
