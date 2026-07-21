import type {
  VeterinaryDoctorApiDto,
  VeterinaryDoctorsApiResponse,
} from '@modules/veterinary/types/api.types'
import type {
  VeterinaryDoctor,
  VeterinaryDoctorsPage,
  VeterinaryWeekdayName,
} from '@modules/veterinary/types/internal.types'

const WEEKDAYS: VeterinaryWeekdayName[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

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

function parseIsActive(value: unknown): boolean {
  if (value === true || value === 1 || value === '1') return true
  if (value === false || value === 0 || value === '0') return false
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }
  return Boolean(value)
}

function normalizeWeekday(value: unknown): VeterinaryWeekdayName | null {
  const day = toTrimmed(value)
  if (!day) return null
  const match = WEEKDAYS.find((entry) => entry.toLowerCase() === day.toLowerCase())
  return match ?? null
}

export function mapVeterinaryDoctor(dto: VeterinaryDoctorApiDto): VeterinaryDoctor {
  const prices = dto.prices ?? {}

  return {
    id: toId(dto.id),
    userId: toId(dto.user_id),
    clinicId: toId(dto.clinic_id),
    clinicName: toTrimmed(dto.clinic_name),
    type: toTrimmed(dto.type),
    description: toTrimmed(dto.description),
    fullName: toTrimmed(dto.full_name),
    email: toTrimmed(dto.email),
    phone: toTrimmed(dto.primary_phone_number),
    countryCode: toTrimmed(dto.country_code),
    clinicAddress: toTrimmed(dto.clinic_address),
    cityId: toId(dto.city_id),
    examineMethod: toTrimmed(dto.examine_method),
    examinationDuration: toTrimmed(dto.examination_duration) || '01:00:00',
    workTimes: (dto.work_times ?? [])
      .map((entry) => {
        const day = normalizeWeekday(entry.day)
        if (!day) return null

        return {
          day,
          isActive: parseIsActive(entry.is_active),
          workingPeriods: (entry.working_periods ?? [])
            .map((period) => ({
              from: toTrimmed(period.from),
              to: toTrimmed(period.to),
            }))
            .filter((period) => period.from && period.to),
        }
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry != null),
    prices: {
      clinicExamine: toNumber(prices.clinic_examine),
      outdoorExamine: toNumber(prices.outdoor_examine),
      consulting: toNumber(prices.consulting),
    },
    personalPicture: toTrimmed(dto.personal_picture),
    totalStars: dto.total_stars == null ? null : toNumber(dto.total_stars),
    examinationsCount: toNumber(dto.examinations_count),
  }
}

export function mapVeterinaryDoctorsPage(response: VeterinaryDoctorsApiResponse): VeterinaryDoctorsPage {
  const meta = response.meta

  return {
    items: (response.data ?? []).map(mapVeterinaryDoctor),
    count: toNumber(meta?.totalItems ?? meta?.itemCount),
    totalPages: Math.max(1, toNumber(meta?.totalPages) || 1),
    currentPage: Math.max(1, toNumber(meta?.currentPage) || 1),
    itemsPerPage: Math.max(1, toNumber(meta?.itemsPerPage) || 10),
  }
}

export function getDoctorPriceForService(
  doctor: VeterinaryDoctor,
  serviceType: 'clinic' | 'fieldVisit',
): number {
  return serviceType === 'clinic' ? doctor.prices.clinicExamine : doctor.prices.outdoorExamine
}

export function getDoctorTypeLabelKey(doctor: VeterinaryDoctor): string {
  if (doctor.type === 'individual') return 'site.veterinary.book.doctor.typeIndividual'
  if (doctor.clinicName) return 'site.veterinary.book.doctor.typeEmployed'
  return 'site.veterinary.book.doctor.typeEmployed'
}

export function getDoctorSubtitle(doctor: VeterinaryDoctor, t: (key: string) => string): string {
  if (doctor.type === 'individual') return t('site.veterinary.book.doctor.typeIndividual')
  return doctor.clinicName || t('site.veterinary.book.doctor.typeEmployed')
}
