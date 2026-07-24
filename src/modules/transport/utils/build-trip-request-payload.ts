import type { CreateTransportTripRequestApiPayload } from '@modules/transport/types/api.types'
import type { TransportDeliveryFormValues } from '@modules/transport/schemas/register.schema'
import type { TransportVehicleType } from '@modules/transport/types'

export type BuildTripRequestInput = {
  delivery: TransportDeliveryFormValues
  vehicleType: TransportVehicleType
}

function formatPoint(lat: number, lng: number): string {
  // Match backend examples: "21.5291073, 39.1610619"
  return `${lat}, ${lng}`
}

function toIsoDateTime(date: string, time: string): string {
  const local = new Date(`${date}T${time}:00`)
  if (Number.isNaN(local.getTime())) {
    return `${date}T${time}:00.000Z`
  }
  return local.toISOString()
}

function calcPrice(distanceKm: number, kilometerPrice: number): string {
  const price = Math.round(distanceKm * kilometerPrice * 100) / 100
  return price.toFixed(2)
}

/**
 * Minimal create body aligned with the trip-request response shape.
 * Avoid extra keys — Nest `forbidNonWhitelisted` returns 422 for unknown properties.
 */
export function buildCreateTripRequestPayload(
  input: BuildTripRequestInput,
): CreateTransportTripRequestApiPayload {
  const { delivery, vehicleType } = input
  const distanceKm = Number(delivery.distanceKm)

  if (
    delivery.originLat == null ||
    delivery.originLng == null ||
    delivery.destinationLat == null ||
    delivery.destinationLng == null
  ) {
    throw new Error('Missing route coordinates')
  }

  return {
    userName: delivery.name.trim(),
    phone: delivery.phone.trim(),
    countryCode: delivery.countryCode.trim(),
    dateTime: toIsoDateTime(delivery.transportDate, delivery.transportTime),
    startPoint: formatPoint(delivery.originLat, delivery.originLng),
    endPoint: formatPoint(delivery.destinationLat, delivery.destinationLng),
    startAddress: delivery.origin.trim(),
    endAddress: delivery.destination.trim(),
    price: calcPrice(distanceKm, vehicleType.kilometerPrice),
    vehicleTypeId: Number(vehicleType.id),
  }
}
