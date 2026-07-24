import type { TransportAllowedVehicleTypeApiDto } from '@modules/transport/types/api.types'
import type { TransportVehicleType } from '@modules/transport/types/internal.types'

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

function toImageUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') return ''
    if (url.hostname === 'example.com' || url.hostname.endsWith('.example.com')) return ''
    return trimmed
  } catch {
    return ''
  }
}

function resolveName(dto: TransportAllowedVehicleTypeApiDto, locale: string): string {
  const normalizedLocale = locale.trim().toLowerCase()
  const translations = Array.isArray(dto.translations) ? dto.translations : []
  const match = translations.find(
    (item) => toTrimmed(item.lang).toLowerCase() === normalizedLocale,
  )
  return toTrimmed(match?.name) || toTrimmed(dto.name)
}

export function mapTransportVehicleType(
  dto: TransportAllowedVehicleTypeApiDto,
  locale: string,
): TransportVehicleType | null {
  const id = toId(dto.id)
  const name = resolveName(dto, locale)
  if (!id || !name) return null

  return {
    id,
    name,
    image: toImageUrl(dto.image),
    capacity: Math.max(0, Math.round(toNumber(dto.capacity))),
    kilometerPrice: toNumber(dto.kilometerPrice),
  }
}

export function mapTransportVehicleTypes(
  items: TransportAllowedVehicleTypeApiDto[] | null | undefined,
  locale: string,
): TransportVehicleType[] {
  if (!Array.isArray(items)) return []
  return items
    .map((dto) => mapTransportVehicleType(dto, locale))
    .filter((item): item is TransportVehicleType => item != null)
}
