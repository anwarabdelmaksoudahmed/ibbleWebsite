import type { TransportPushPayload } from '@shared/firebase/messaging'

export type TransportSseOfferPayload = TransportPushPayload & {
  source: 'sse'
  driverName?: string
  vehiclePlate?: string
  vehicleModel?: string
  vehicleYear?: string
  companyName?: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function pickString(source: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return undefined
}


export function parseTransportSseData(rawData: string): {
  eventName: string
  payload: TransportSseOfferPayload | null
  raw: unknown
} {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawData) as unknown
  } catch (error) {
    console.warn('[TransportSSE] data is not JSON', { rawData, error })
    return { eventName: 'unknown', payload: null, raw: rawData }
  }

  const root = asRecord(parsed)
  if (!root) {
    return { eventName: 'unknown', payload: null, raw: parsed }
  }

  const eventName =
    pickString(root, 'event', 'type', 'name') ||
    'message'

  const nested = asRecord(root.data) ?? root
  const driver = asRecord(nested.driver)
  const vehicle = asRecord(nested.vehicle)
  const company = asRecord(nested.company)

  const offerId = pickString(nested, 'offer_id', 'offerId', 'offerID', 'id')
  const tripRequestId = pickString(
    nested,
    'tripRequestId',
    'trip_request_id',
    'requestId',
    'request_id',
  )
  const tripId = pickString(nested, 'tripId', 'trip_id')
  const price = pickString(nested, 'price')
  const status = pickString(nested, 'status')
  const type = pickString(nested, 'type') || eventName
  const distanceRaw = nested.distance
  const distance =
    typeof distanceRaw === 'number'
      ? distanceRaw
      : typeof distanceRaw === 'string' && distanceRaw.trim()
        ? Number(distanceRaw)
        : undefined

  const driverName =
    (driver ? pickString(driver, 'name') : undefined) ||
    pickString(nested, 'driverName', 'driver_name')

  const payload: TransportSseOfferPayload = {
    source: 'sse',
    offerId,
    tripRequestId,
    tripId,
    price,
    status,
    type,
    distance: Number.isFinite(distance) ? distance : undefined,
    driverName,
    vehiclePlate: vehicle ? pickString(vehicle, 'plateNumber', 'plate_number', 'plate') : undefined,
    vehicleModel: vehicle ? pickString(vehicle, 'model') : undefined,
    vehicleYear: vehicle ? pickString(vehicle, 'year') : undefined,
    companyName: company ? pickString(company, 'name') : undefined,
    message: pickString(nested, 'message', 'body', 'title'),
    reason: pickString(nested, 'reason'),
    raw: nested,
  }

  console.log('[TransportSSE] parsed payload', { eventName, payload })
  return { eventName, payload, raw: parsed }
}

export function isNewOfferSseEvent(eventName: string, payload: TransportSseOfferPayload | null): boolean {
  if (!payload?.offerId) return false
  const haystack = `${eventName} ${payload.type || ''} ${payload.status || ''}`.toLowerCase()
  return (
    haystack.includes('new_offer') ||
    haystack.includes('offer') ||
    // Bare offer object with offer_id and no reject status
    Boolean(payload.offerId && !haystack.includes('reject') && !haystack.includes('cancel'))
  )
}

export function isDriverRejectionSseEvent(
  eventName: string,
  payload: TransportSseOfferPayload | null,
): boolean {
  const haystack = `${eventName} ${payload?.type || ''} ${payload?.status || ''} ${payload?.message || ''} ${payload?.reason || ''}`.toLowerCase()
  return (
    haystack.includes('reject') ||
    haystack.includes('refuse') ||
    haystack.includes('decline') ||
    haystack.includes('withdraw') ||
    haystack.includes('رفض')
  )
}
