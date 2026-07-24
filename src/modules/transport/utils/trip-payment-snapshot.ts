import { sessionStorageHelper } from '@shared/utils/storage'

const STORAGE_KEY = 'ibble:transport-trip-payment-snapshot'
export const TRANSPORT_PAY_WINDOW_MS = 15 * 60 * 1000

export type TransportTripPaymentSnapshot = {
  tripId: string
  vehicleId: string
  price: number
  /** Epoch ms — payment must complete before this. */
  expiresAt: number
}

export function saveTripPaymentSnapshot(
  input: Omit<TransportTripPaymentSnapshot, 'expiresAt'> & { expiresAt?: number },
): void {
  const snapshot: TransportTripPaymentSnapshot = {
    tripId: String(input.tripId),
    vehicleId: String(input.vehicleId || ''),
    price: Number(input.price) || 0,
    expiresAt: input.expiresAt ?? Date.now() + TRANSPORT_PAY_WINDOW_MS,
  }
  sessionStorageHelper.set(STORAGE_KEY, snapshot)
}

export function readTripPaymentSnapshot(tripId: string): TransportTripPaymentSnapshot | null {
  const raw = sessionStorageHelper.get<TransportTripPaymentSnapshot>(STORAGE_KEY)
  if (!raw || String(raw.tripId) !== String(tripId)) return null
  return raw
}

/** Latest pending payment (used to reopen register wizard on step 3). */
export function readLatestTripPaymentSnapshot(): TransportTripPaymentSnapshot | null {
  const raw = sessionStorageHelper.get<TransportTripPaymentSnapshot>(STORAGE_KEY)
  if (!raw?.tripId) return null
  if (raw.expiresAt && raw.expiresAt <= Date.now()) {
    sessionStorageHelper.remove(STORAGE_KEY)
    return null
  }
  return raw
}

export function clearTripPaymentSnapshot(): void {
  sessionStorageHelper.remove(STORAGE_KEY)
}
