import type { VeterinaryReservedTimeApiDto } from '@modules/veterinary/types/api.types'
import type {
  VeterinaryAppointmentDay,
  VeterinaryAppointmentSlot,
  VeterinaryDoctor,
  VeterinaryDoctorWorkPeriod,
  VeterinaryWeekdayName,
} from '@modules/veterinary/types/internal.types'

const JS_DAY_TO_WEEKDAY: VeterinaryWeekdayName[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Normalize API times like "2:30" / "02:30:00" to "HH:mm" for slots and reserved-times matching. */
export function normalizeTimeString(time: string): string {
  const trimmed = time.trim()
  if (!trimmed) return ''

  const parts = trimmed.split(':').map((part) => Number(part))
  if (!parts.length || parts.some((part) => !Number.isFinite(part))) return trimmed

  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return `${pad(hours)}:${pad(minutes)}`
}

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseDurationToMinutes(duration: string): number {
  const parts = duration.split(':').map((part) => Number(part))
  if (parts.length >= 2 && parts.every((part) => Number.isFinite(part))) {
    const hours = parts[0] ?? 0
    const minutes = parts[1] ?? 0
    const seconds = parts[2] ?? 0
    return hours * 60 + minutes + Math.floor(seconds / 60)
  }
  return 60
}

export function parseTimeToMinutes(time: string): number {
  const normalized = normalizeTimeString(time)
  const parts = normalized.split(':').map((part) => Number(part))
  const [hours = 0, minutes = 0] = parts
  return hours * 60 + minutes
}

export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${pad(hours)}:${pad(mins)}`
}

export function formatSlotLabel(from: string, to: string, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const toDate = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const date = new Date()
    date.setHours(hours ?? 0, minutes ?? 0, 0, 0)
    return date
  }

  return `${formatter.format(toDate(from))} – ${formatter.format(toDate(to))}`
}

export function generateSlotsForPeriod(
  period: VeterinaryDoctorWorkPeriod,
  durationMinutes: number,
): VeterinaryAppointmentSlot[] {
  const from = normalizeTimeString(period.from)
  const to = normalizeTimeString(period.to)
  if (!from || !to) return []

  const start = parseTimeToMinutes(from)
  const end = parseTimeToMinutes(to)
  if (end <= start) return []

  const slots: VeterinaryAppointmentSlot[] = []
  let cursor = start

  while (cursor + durationMinutes <= end) {
    const slotFrom = formatMinutesToTime(cursor)
    const slotTo = formatMinutesToTime(cursor + durationMinutes)
    slots.push({ from: slotFrom, to: slotTo, label: `${slotFrom} – ${slotTo}` })
    cursor += durationMinutes
  }

  // Some doctors have examination_duration longer than a working_period window.
  // Fall back to the full period as one bookable slot (matches legacy behaviour).
  if (!slots.length) {
    slots.push({ from, to, label: `${from} – ${to}` })
  }

  return slots
}

export function dayHasBookableSlots(doctor: VeterinaryDoctor, day: VeterinaryWeekdayName): boolean {
  const workDay = doctor.workTimes.find((entry) => entry.day === day && entry.isActive)
  if (!workDay?.workingPeriods.length) return false

  const durationMinutes = parseDurationToMinutes(doctor.examinationDuration)
  return workDay.workingPeriods.some(
    (period) => generateSlotsForPeriod(period, durationMinutes).length > 0,
  )
}

export function getUpcomingAvailableDays(
  doctor: VeterinaryDoctor,
  daysAhead = 28,
  fromDate = new Date(),
): VeterinaryAppointmentDay[] {
  const days: VeterinaryAppointmentDay[] = []
  const cursor = new Date(fromDate)
  cursor.setHours(12, 0, 0, 0)

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const date = new Date(cursor)
    date.setDate(cursor.getDate() + offset)
    const weekday = JS_DAY_TO_WEEKDAY[date.getDay()]!

    if (!dayHasBookableSlots(doctor, weekday)) continue

    days.push({
      day: weekday,
      date: formatLocalDate(date),
      label: weekday,
      isToday: offset === 0,
    })
  }

  return days
}

export function generateDaySlots(
  doctor: VeterinaryDoctor,
  day: VeterinaryWeekdayName,
  locale: string,
): VeterinaryAppointmentSlot[] {
  const workDay = doctor.workTimes.find((entry) => entry.day === day && entry.isActive)
  if (!workDay) return []

  const durationMinutes = parseDurationToMinutes(doctor.examinationDuration)
  const slots = workDay.workingPeriods.flatMap((period) =>
    generateSlotsForPeriod(period, durationMinutes),
  )

  return slots.map((slot) => ({
    ...slot,
    label: formatSlotLabel(slot.from, slot.to, locale),
  }))
}

function normalizeReservedRange(entry: VeterinaryReservedTimeApiDto): string | null {
  const from = entry.from ? normalizeTimeString(entry.from) : ''
  const to = entry.to ? normalizeTimeString(entry.to) : ''
  if (from && to) return `${from}-${to}`
  if (from) return from
  return entry.time?.trim() || null
}

export function filterAvailableSlots(
  slots: VeterinaryAppointmentSlot[],
  reserved: VeterinaryReservedTimeApiDto[],
): VeterinaryAppointmentSlot[] {
  if (!reserved.length) return slots

  const reservedKeys = new Set(
    reserved
      .map(normalizeReservedRange)
      .filter((value): value is string => Boolean(value)),
  )

  return slots.filter((slot) => {
    const key = `${normalizeTimeString(slot.from)}-${normalizeTimeString(slot.to)}`
    const normalizedFrom = normalizeTimeString(slot.from)

    return !reservedKeys.has(key)
      && !reservedKeys.has(normalizedFrom)
      && !reservedKeys.has(slot.from)
      && !reservedKeys.has(`${slot.from}-${slot.to}`)
  })
}

export function summarizeDayPeriod(
  doctor: VeterinaryDoctor,
  day: VeterinaryWeekdayName,
  locale: string,
): string {
  const slots = generateDaySlots(doctor, day, locale)
  if (!slots.length) return ''
  const first = slots[0]!
  const last = slots[slots.length - 1]!
  return formatSlotLabel(first.from, last.to, locale)
}
