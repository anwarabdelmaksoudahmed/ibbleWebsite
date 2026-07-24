const DEVICE_ID_STORAGE_KEY = 'ibble:web-device-id'

/** Fixed client type for this website (vs dashboard / mobile). */
export const WEB_DEVICE_TYPE = 'web' as const

export type FcmDevicePayload = {
  fcm_token: string
  device_type: typeof WEB_DEVICE_TYPE
  device_id: string
}

/**
 * Stable per-browser id so the backend can upsert this device
 * instead of overwriting every other token.
 */
export function getOrCreateWebDeviceId(): string {
  if (!import.meta.client) return 'server'

  try {
    const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY)?.trim()
    if (existing) return existing

    const next =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

    localStorage.setItem(DEVICE_ID_STORAGE_KEY, next)
    return next
  } catch {
    return `web-fallback-${Date.now()}`
  }
}

export function buildFcmDevicePayload(fcmToken: string): FcmDevicePayload {
  return {
    fcm_token: fcmToken.trim(),
    device_type: WEB_DEVICE_TYPE,
    device_id: getOrCreateWebDeviceId(),
  }
}
