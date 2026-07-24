import type {
  AcceptTransportOfferApiResponse,
  TransportOfferApiDto,
  TransportOffersApiResponse,
  TransportTripRequestApiDto,
  TransportTripRequestApiResponse,
} from '@modules/transport/types/api.types'
import type {
  AcceptedTransportTrip,
  TransportOffer,
  TransportTripRequest,
} from '@modules/transport/types/internal.types'

function toId(value: unknown): string {
  return value == null ? '' : String(value)
}

function toTrimmed(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
}

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function toImageUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') return ''
    return trimmed
  } catch {
    return ''
  }
}

export function mapTransportTripRequest(
  dto: TransportTripRequestApiDto | null | undefined,
): TransportTripRequest | null {
  if (!dto?.id) return null

  return {
    id: toId(dto.id),
    status: toTrimmed(dto.status).toLowerCase() || 'pending',
    dateTime: toTrimmed(dto.dateTime),
    userName: toTrimmed(dto.userName),
    phone: toTrimmed(dto.phone),
    price: toNumber(dto.price),
    startPoint: toTrimmed(dto.startPoint),
    endPoint: toTrimmed(dto.endPoint),
    startAddress: toTrimmed(dto.startAddress),
    endAddress: toTrimmed(dto.endAddress),
    distanceMeters: toNullableNumber(dto.distance),
  }
}

export function mapTransportTripRequestResponse(
  response: TransportTripRequestApiResponse,
): TransportTripRequest {
  const mapped = mapTransportTripRequest(response.data)
  if (!mapped) {
    throw new Error(response.message || 'Invalid trip request response')
  }
  return mapped
}

export function mapTransportOffer(dto: TransportOfferApiDto): TransportOffer | null {
  const id = toId(dto.id)
  if (!id) return null

  return {
    id,
    status: toTrimmed(dto.status).toLowerCase() || 'pending',
    price: toNumber(dto.price),
    tripRequestId: toId(dto.tripRequestId),
    driverName: toTrimmed(dto.driverName) || '—',
    vehicleName: toTrimmed(dto.vehicleName),
    vehicleImage: toImageUrl(dto.vehicleImage),
  }
}

export function mapTransportOffersResponse(
  response: TransportOffersApiResponse,
): TransportOffer[] {
  const raw = response.data
  const list = Array.isArray(raw) ? raw : raw ? [raw] : []
  return list
    .map(mapTransportOffer)
    .filter((item): item is TransportOffer => item != null)
}

export function mapAcceptedTransportTrip(
  response: AcceptTransportOfferApiResponse,
): AcceptedTransportTrip {
  const dto = response.data
  return {
    id: toId(dto?.id),
    vehicleId: toId(dto?.vehicleId),
    status: toTrimmed(dto?.status).toLowerCase() || 'upcoming',
    distanceMeters: toNullableNumber(dto?.distance),
    price: toNumber(dto?.price),
    message: toTrimmed(response.message) || 'trip is created successfully',
  }
}
