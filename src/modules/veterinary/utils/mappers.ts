import type {
  VeterinaryReservationApiDto,
  VeterinaryReservationsApiResponse,
} from '@modules/veterinary/types/api.types'
import type {
  VeterinaryReservation,
  VeterinaryReservationDoctor,
  VeterinaryReservationsPage,
} from '@modules/veterinary/types/internal.types'

function toId(value: unknown): string {
  return value == null ? '' : String(value)
}

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function toTrimmed(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
}

function mapTimeLabel(time: VeterinaryReservationApiDto['time']): string {
  if (time == null) return ''
  if (typeof time === 'string') return time.trim()

  if (typeof time === 'object' && !Array.isArray(time)) {
    const record = time as Record<string, unknown>
    const candidates = [
      record.label,
      record.time,
      record.slot,
      record.start,
      record.from,
      record.date,
      record.datetime,
    ]
      .map(toTrimmed)
      .filter(Boolean)

    const start = candidates[0]
    if (!start) return ''

    const end = toTrimmed(record.end ?? record.to)
    if (end && start !== end) {
      return `${start} – ${end}`
    }
    return start
  }

  return ''
}

function mapDoctor(
  dto: VeterinaryReservationApiDto['doctor'],
): VeterinaryReservationDoctor {
  return {
    fullName: toTrimmed(dto?.full_name),
    clinicAddress: toTrimmed(dto?.clinic_address),
    subtitle: toTrimmed(dto?.subtitle),
    examineMethod: toTrimmed(dto?.examine_method),
  }
}

export function mapVeterinaryReservation(
  dto: VeterinaryReservationApiDto,
): VeterinaryReservation {
  const invoice = toTrimmed(dto.invoice)

  return {
    id: toId(dto.id),
    clinicId: toId(dto.clinic_id),
    clinicName: toTrimmed(dto.clinic_name),
    timeLabel: mapTimeLabel(dto.time),
    customerId: toId(dto.customer_id),
    customerPhone: toTrimmed(dto.customer_phone),
    customerName: toTrimmed(dto.customer_name),
    customerNationalId: toTrimmed(dto.customer_national_id),
    price: toNumber(dto.price),
    currency: toTrimmed(dto.currency) || 'SAR',
    invoiceUrl: invoice || null,
    diagnosis: toTrimmed(dto.diagnosis),
    prescription: toTrimmed(dto.prescription),
    serviceType: toTrimmed(dto.service_type),
    status: toTrimmed(dto.status).toLowerCase() || 'pending',
    attended: dto.attended == null ? null : Boolean(dto.attended),
    isPaid: Boolean(dto.is_paid),
    depositAmount: toNumber(dto.deposit_amount),
    commissionAmount: toNumber(dto.commission_amount),
    createdAt: toTrimmed(dto.created_at),
    doctor: mapDoctor(dto.doctor),
  }
}

export function mapVeterinaryReservationsPage(
  response: VeterinaryReservationsApiResponse,
): VeterinaryReservationsPage {
  const meta = response.meta
  return {
    items: (response.data ?? []).map(mapVeterinaryReservation),
    count: toNumber(meta?.totalItems ?? meta?.itemCount),
    totalPages: Math.max(1, toNumber(meta?.totalPages) || 1),
    currentPage: Math.max(1, toNumber(meta?.currentPage) || 1),
    itemsPerPage: Math.max(1, toNumber(meta?.itemsPerPage) || 10),
  }
}
