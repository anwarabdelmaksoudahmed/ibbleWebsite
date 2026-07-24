import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from 'firebase/messaging'
import {
  readFirebasePublicConfig,
  type FirebasePublicConfig,
} from '@shared/firebase/config'

const FCM_TOKEN_CACHE_KEY = 'ibble:fcm-web-token'

let app: FirebaseApp | null = null
let messaging: Messaging | null = null
let messagingSupported: boolean | null = null
/** Single-flight lock — concurrent getToken() races close Firebase IndexedDB. */
let tokenInFlight: Promise<string | null> | null = null

function getFirebaseApp(config: FirebasePublicConfig): FirebaseApp {
  if (app) return app
  app = getApps()[0] ?? initializeApp(config)
  return app
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isIndexedDbClosingError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  const name = error instanceof Error ? error.name : ''
  return (
    name === 'InvalidStateError' ||
    /database connection is closing/i.test(message) ||
    /IDBDatabase/i.test(message)
  )
}

function resetFirebaseMessagingInstance(): void {
  messaging = null
}

export function readCachedFcmToken(): string | null {
  if (!import.meta.client) return null
  try {
    const cached = localStorage.getItem(FCM_TOKEN_CACHE_KEY)?.trim()
    return cached || null
  } catch {
    return null
  }
}

export function writeCachedFcmToken(token: string): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(FCM_TOKEN_CACHE_KEY, token.trim())
    sessionStorage.setItem(FCM_TOKEN_CACHE_KEY, token.trim())
  } catch {
    // ignore quota / private mode
  }
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!import.meta.client) return null

  if (messagingSupported == null) {
    messagingSupported = await isSupported()
  }
  if (!messagingSupported) {
    console.warn('[FCM] messaging isSupported() = false')
    return null
  }

  const runtimeConfig = useRuntimeConfig()
  const config = readFirebasePublicConfig(runtimeConfig.public)
  if (!config) {
    console.warn('[FCM] Firebase public config incomplete (check NUXT_PUBLIC_FIREBASE_*)')
    return null
  }

  if (!messaging) {
    messaging = getMessaging(getFirebaseApp(config))
  }
  return messaging
}

async function waitForServiceWorker(
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorkerRegistration> {
  if (registration.active) return registration

  const pending = registration.installing || registration.waiting
  if (pending) {
    await new Promise<void>((resolve) => {
      if (pending.state === 'activated') {
        resolve()
        return
      }
      pending.addEventListener('statechange', () => {
        if (pending.state === 'activated') resolve()
      })
    })
  }

  await navigator.serviceWorker.ready
  return registration
}

async function createFcmRegistrationToken(): Promise<string | null> {
  if (!import.meta.client) return null

  if (!window.isSecureContext) {
    console.warn(
      '[FCM] insecure context — use http://localhost (not a LAN IP) so the browser can create a token',
    )
    return null
  }

  if (typeof Notification === 'undefined') {
    console.warn('[FCM] Notification API unavailable')
    return null
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('[FCM] serviceWorker unavailable')
    return null
  }

  const instance = await getFirebaseMessaging()
  if (!instance) return null

  const runtimeConfig = useRuntimeConfig()
  const config = readFirebasePublicConfig(runtimeConfig.public)
  if (!config) return null

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    console.log('[FCM] Notification permission result:', permission)
  }

  if (Notification.permission !== 'granted') {
    console.warn(
      '[FCM] Notification permission is',
      Notification.permission,
      '— allow notifications then try again',
    )
    return null
  }

  let registration: ServiceWorkerRegistration
  try {
    registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    })
    registration = await waitForServiceWorker(registration)
    console.log('[FCM] Service worker ready:', registration.scope)
  } catch (err) {
    console.error('[FCM] Service worker register failed', err)
    return null
  }

  const requestToken = async (withVapid: boolean, messagingInstance: Messaging) => {
    return getToken(messagingInstance, {
      ...(withVapid && config.vapidKey ? { vapidKey: config.vapidKey } : {}),
      serviceWorkerRegistration: registration,
    })
  }

  const maxAttempts = 4
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const messagingInstance =
        attempt === 1 ? instance : (await getFirebaseMessaging()) ?? instance

      let token = await requestToken(true, messagingInstance)
      if (typeof token !== 'string' || !token.trim()) {
        console.warn('[FCM] getToken() returned empty value:', token)
        return readCachedFcmToken()
      }

      token = token.trim()
      writeCachedFcmToken(token)
      console.log('[FCM] Token created successfully, length:', token.length)
      return token
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[FCM] getToken() failed (attempt ${attempt}/${maxAttempts}):`, err)

      if (isIndexedDbClosingError(err) && attempt < maxAttempts) {
        console.warn('[FCM] IndexedDB closing race — reset messaging and retry')
        resetFirebaseMessagingInstance()
        await delay(200 * attempt)
        continue
      }

      if (/token-subscribe-failed|authentication credential/i.test(message) && config.vapidKey) {
        console.warn('[FCM] VAPID rejected — retrying without custom vapidKey')
        try {
          const messagingInstance = (await getFirebaseMessaging()) ?? instance
          const retry = await requestToken(false, messagingInstance)
          if (typeof retry === 'string' && retry.trim()) {
            const token = retry.trim()
            writeCachedFcmToken(token)
            console.log('[FCM] Token created with default VAPID, length:', token.length)
            return token
          }
        } catch (retryErr) {
          console.error('[FCM] Retry without custom VAPID failed:', retryErr)
        }
      }

      const cached = readCachedFcmToken()
      if (cached) {
        console.log('[FCM] Falling back to cached token after getToken failure')
        return cached
      }
      return null
    }
  }

  return readCachedFcmToken()
}

export type GetFirebaseMessagingTokenOptions = {
  /** When true, return localStorage token immediately and skip a fresh getToken(). */
  preferCache?: boolean
}

/**
 * Creates (or reuses in-flight) an FCM web token.
 * Concurrent callers share one promise to avoid IndexedDB "connection is closing" races.
 */
export async function getFirebaseMessagingToken(
  options?: GetFirebaseMessagingTokenOptions,
): Promise<string | null> {
  if (!import.meta.client) return null

  if (options?.preferCache) {
    const cached = readCachedFcmToken()
    if (cached) {
      console.log('[FCM] preferCache hit, length:', cached.length)
      return cached
    }
  }

  if (tokenInFlight) {
    console.log('[FCM] joining in-flight getToken()')
    return tokenInFlight
  }

  tokenInFlight = createFcmRegistrationToken().finally(() => {
    tokenInFlight = null
  })
  return tokenInFlight
}

/**
 * Best-effort token for login: fresh token with timeout, then localStorage cache.
 * Empty token is almost never account-related — it is browser permission / SW / secure context.
 */
export async function resolveFirebaseMessagingTokenForLogin(
  timeoutMs = 10_000,
): Promise<string | null> {
  if (!import.meta.client) return null

  try {
    const fresh = await Promise.race([
      getFirebaseMessagingToken(),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), timeoutMs)
      }),
    ])
    if (fresh) return fresh
  } catch (err) {
    console.warn('[FCM] fresh token before login failed', err)
  }

  const cached = readCachedFcmToken()
  if (cached) {
    console.log('[FCM] Using cached fcmToken for login payload, length:', cached.length)
    return cached
  }

  console.warn(
    '[FCM] No fcm_token for login. Check: Allow notifications + http://localhost + SW active.',
    {
      permission: typeof Notification !== 'undefined' ? Notification.permission : 'n/a',
      isSecureContext: window.isSecureContext,
      href: window.location.href,
    },
  )
  return null
}

/** Warm SW + permission + token while user fills the login form. */
export function prefetchFirebaseMessagingToken(): void {
  if (!import.meta.client) return
  void getFirebaseMessagingToken().catch((err) => {
    console.warn('[FCM] prefetch failed', err)
  })
}

export async function subscribeFirebaseForegroundMessages(
  handler: (payload: MessagePayload) => void,
): Promise<() => void> {
  const instance = await getFirebaseMessaging()
  if (!instance) return () => undefined
  return onMessage(instance, handler)
}

export type TransportPushPayload = {
  offerId?: string
  tripRequestId?: string
  tripId?: string
  status?: string
  type?: string
  price?: string
  distance?: number
  raw?: Record<string, unknown>
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function pick(source: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return undefined
}

/**
 * Legacy website stores the offer payload in `notification.body` as JSON:
 * `{ data: { offer_id, tripRequestId, price, ... } }`
 */
export function parseTransportPushPayload(
  payload: MessagePayload | null | undefined,
): TransportPushPayload {
  console.log('[FCM] raw message', payload)
  const dataBag = asRecord(payload?.data) ?? {}
  const fromData = parseTransportPushData(dataBag)

  let fromBody: TransportPushPayload = {}
  const bodyText = payload?.notification?.body
  if (typeof bodyText === 'string' && bodyText.trim()) {
    try {
      const parsed = JSON.parse(bodyText) as unknown
      const root = asRecord(parsed)
      const nested = asRecord(root?.data) ?? root
      if (nested) fromBody = parseTransportPushData(nested)
      if (root?.type != null && !fromBody.type) {
        fromBody.type = String(root.type)
      }
    } catch {
      // not JSON — ignore
    }
  }

  const parsed = {
    offerId: fromBody.offerId || fromData.offerId,
    tripRequestId: fromBody.tripRequestId || fromData.tripRequestId,
    tripId: fromBody.tripId || fromData.tripId,
    status: fromBody.status || fromData.status,
    type: fromBody.type || fromData.type,
    price: fromBody.price || fromData.price,
    distance: fromBody.distance ?? fromData.distance,
    raw: fromBody.raw || fromData.raw,
  }
  console.log('[FCM] parsed transport payload', parsed)
  return parsed
}

export function parseTransportPushData(
  data: Record<string, unknown> | null | undefined,
): TransportPushPayload {
  const source = data ?? {}
  const nested = asRecord(source.data) ?? source

  const distanceRaw = nested.distance ?? source.distance
  const distance =
    typeof distanceRaw === 'number'
      ? distanceRaw
      : typeof distanceRaw === 'string' && distanceRaw.trim()
        ? Number(distanceRaw)
        : undefined

  const parsed = {
    offerId: pick(nested, 'offerId', 'offer_id', 'offerID', 'OfferId'),
    tripRequestId: pick(
      nested,
      'tripRequestId',
      'trip_request_id',
      'tripRequestID',
      'requestId',
      'request_id',
    ),
    tripId: pick(nested, 'tripId', 'trip_id', 'TripId'),
    status: pick(nested, 'status'),
    type: pick(nested, 'type', 'event', 'notificationType'),
    price: pick(nested, 'price'),
    distance: Number.isFinite(distance) ? distance : undefined,
    raw: nested,
  }
  console.log('[FCM] parsed push data', { source, parsed })
  return parsed
}
