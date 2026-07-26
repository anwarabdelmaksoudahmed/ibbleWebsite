import type { SseMessage } from '@shared/sse/types'

/**
 * Incremental SSE wire parser (WHATWG EventStream).
 * Feeds text chunks; emits complete messages when a blank line is seen.
 */
export function createSseChunkParser(onMessage: (message: SseMessage) => void) {
  let buffer = ''
  let eventName = 'message'
  let dataLines: string[] = []
  let id: string | undefined
  let retry: number | undefined

  function resetFrame() {
    eventName = 'message'
    dataLines = []
    id = undefined
    retry = undefined
  }

  function dispatch() {
    if (dataLines.length === 0 && eventName === 'message' && id == null && retry == null) {
      resetFrame()
      return
    }

    const message: SseMessage = {
      event: eventName || 'message',
      data: dataLines.join('\n'),
      id,
      retry,
    }
    resetFrame()
    onMessage(message)
  }

  function push(chunk: string) {
    buffer += chunk
    // Normalize CRLF → LF while parsing line-by-line
    let newlineIndex = buffer.indexOf('\n')
    while (newlineIndex >= 0) {
      let line = buffer.slice(0, newlineIndex)
      buffer = buffer.slice(newlineIndex + 1)
      if (line.endsWith('\r')) line = line.slice(0, -1)

      if (line === '') {
        dispatch()
      } else if (line.startsWith(':')) {
        // comment / heartbeat — ignore
      } else {
        const colonIndex = line.indexOf(':')
        const field = colonIndex === -1 ? line : line.slice(0, colonIndex)
        let value = colonIndex === -1 ? '' : line.slice(colonIndex + 1)
        if (value.startsWith(' ')) value = value.slice(1)

        switch (field) {
          case 'event':
            eventName = value || 'message'
            break
          case 'data':
            dataLines.push(value)
            break
          case 'id':
            id = value
            break
          case 'retry': {
            const parsed = Number(value)
            if (Number.isFinite(parsed) && parsed >= 0) retry = parsed
            break
          }
          default:
            break
        }
      }

      newlineIndex = buffer.indexOf('\n')
    }
  }

  function flush() {
    if (buffer.trim()) {
      // Incomplete trailing frame — ignore (connection closed mid-message)
      buffer = ''
    }
    resetFrame()
  }

  return { push, flush }
}
