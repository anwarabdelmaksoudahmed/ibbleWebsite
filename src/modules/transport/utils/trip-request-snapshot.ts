import type { TransportTripRequest } from '@modules/transport/types'
import { sessionStorageHelper } from '@shared/utils/storage'

const STORAGE_KEY = 'ibble:transport-trip-request-snapshot'

export type TransportTripRequestSnapshot = Pick<
  TransportTripRequest,
  'id' | 'status' | 'dateTime' | 'userName' | 'phone' | 'price' | 'startAddress' | 'endAddress'
> & {
  distanceMeters: number
}

export function saveTripRequestSnapshot(request: TransportTripRequestSnapshot): void {
  sessionStorageHelper.set(STORAGE_KEY, request)
}

export function readTripRequestSnapshot(id: string): TransportTripRequestSnapshot | null {
  const raw = sessionStorageHelper.get<TransportTripRequestSnapshot>(STORAGE_KEY)
  if (!raw || String(raw.id) !== String(id)) return null
  return raw
}

export function clearTripRequestSnapshot(): void {
  sessionStorageHelper.remove(STORAGE_KEY)
}
