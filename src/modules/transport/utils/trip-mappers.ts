import type {
  TransportTripApiDto,
  TransportTripsApiResponse,
} from '@modules/transport/types/api.types'
import type {
  TransportTrip,
  TransportTripDriver,
  TransportTripVehicle,
  TransportTripsPage,
} from '@modules/transport/types/internal.types'

function toId(value: unknown): string {
  return value == null ? '' : String(value)
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

function toTrimmed(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
}

function toImageUrl(...candidates: unknown[]): string {
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue
    const trimmed = candidate.trim()
    if (!trimmed) continue

    try {
      const url = new URL(trimmed)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') continue
      if (!url.hostname.includes('.') && url.hostname !== 'localhost') continue
      if (url.hostname === 'example.com' || url.hostname.endsWith('.example.com')) continue
      return trimmed
    } catch {
      // not a valid URL
    }
  }
  return ''
}

function metersToKm(meters: number | null): number | null {
  if (meters == null) return null
  return Math.round((meters / 1000) * 10) / 10
}

function mapDriver(dto: TransportTripApiDto['driver']): TransportTripDriver {
  return {
    id: toId(dto?.id),
    name: toTrimmed(dto?.name),
    phone: toTrimmed(dto?.phone),
    countryCode: toTrimmed(dto?.countryCode),
    avatar: toImageUrl(dto?.avatar),
  }
}

function mapVehicle(dto: TransportTripApiDto): TransportTripVehicle {
  return {
    id: toId(dto.vehicle?.id ?? dto.vehicleId),
    model: toTrimmed(dto.vehicle?.model),
    plateNumber: toTrimmed(dto.vehicle?.plateNumber),
    year: toId(dto.vehicle?.year),
  }
}

export function mapTransportTrip(dto: TransportTripApiDto): TransportTrip {
  const vehicleName =
    toTrimmed(dto.vehicle_name) ||
    toTrimmed(dto.vehicleType?.name) ||
    toTrimmed(dto.vehicle?.model)

  return {
    id: toId(dto.id),
    status: toTrimmed(dto.status).toLowerCase() || 'upcoming',
    distanceKm: metersToKm(toNullableNumber(dto.distance)),
    camelCount: Math.max(0, Math.round(toNumber(dto.noOfCamels))),
    startAddress: toTrimmed(dto.startAddress),
    endAddress: toTrimmed(dto.endAddress),
    dateTime: toTrimmed(dto.dateTime),
    price: toNumber(dto.price),
    vehicleImage: toImageUrl(
      dto.vehicle_image,
      dto.vehicle?.featuredImage,
      dto.vehicle?.images,
      dto.vehicleType?.image,
    ),
    vehicleName,
    vehicle: mapVehicle(dto),
    driver: mapDriver(dto.driver),
  }
}

export function mapTransportTripsPage(
  response: TransportTripsApiResponse,
): TransportTripsPage {
  const meta = response.meta
  return {
    items: (response.data ?? []).map(mapTransportTrip),
    count: toNumber(meta?.totalItems ?? meta?.itemCount),
    totalPages: Math.max(1, toNumber(meta?.totalPages) || 1),
    currentPage: Math.max(1, toNumber(meta?.currentPage) || 1),
    itemsPerPage: Math.max(1, toNumber(meta?.itemsPerPage) || 10),
  }
}
