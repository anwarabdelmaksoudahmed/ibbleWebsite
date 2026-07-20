export type VeterinaryReservationDoctorApiDto = {
  full_name?: string | null
  clinic_address?: string | null
  subtitle?: string | null
  examine_method?: string | null
}

export type VeterinaryReservationApiDto = {
  id: string | number
  clinic_id?: string | number | null
  time?: Record<string, unknown> | string | null
  customer_id?: string | number | null
  customer_phone?: string | null
  customer_name?: string | null
  customer_national_id?: string | null
  price?: string | number | null
  transaction_id?: string | number | null
  invoice?: string | null
  payment_details?: unknown | null
  diagnosis?: string | null
  attachments?: unknown | null
  prescription?: string | null
  service_type?: string | null
  currency?: string | null
  status?: string | null
  attended?: boolean | null
  is_paid?: boolean | null
  commission_amount?: string | number | null
  deposit_amount?: string | number | null
  payment_method_id?: string | number | null
  created_at?: string | null
  doctor?: VeterinaryReservationDoctorApiDto | null
  clinic_name?: string | null
}

export type VeterinaryReservationsApiMeta = {
  totalItems?: number
  itemCount?: number
  itemsPerPage?: number
  totalPages?: number
  currentPage?: number
}

export type VeterinaryReservationsApiResponse = {
  data?: VeterinaryReservationApiDto[]
  meta?: VeterinaryReservationsApiMeta
}

export type VeterinaryReservationsQueryParams = {
  page?: number
  status?: string
}

export type VeterinaryDoctorWorkingPeriodApiDto = {
  from?: string | null
  to?: string | null
}

export type VeterinaryDoctorWorkTimeApiDto = {
  day?: string | null
  is_active?: boolean | null
  working_periods?: VeterinaryDoctorWorkingPeriodApiDto[] | null
  max_appointments?: number | null
}

export type VeterinaryDoctorPricesApiDto = {
  clinic_examine?: string | number | null
  outdoor_examine?: string | number | null
  consulting?: string | number | null
}

export type VeterinaryDoctorApiDto = {
  id?: string | number | null
  user_id?: string | number | null
  clinic_id?: string | number | null
  slug?: string | null
  status?: string | null
  type?: string | null
  description?: string | null
  is_active?: number | boolean | null
  city_id?: string | number | null
  full_name?: string | null
  email?: string | null
  primary_phone_number?: string | null
  secondary_phone_number?: string | null
  country_code?: string | null
  clinic_address?: string | null
  clinic_name?: string | null
  allow_clinic_examine?: number | boolean | null
  allow_outdoor_examine?: number | boolean | null
  allow_consulting?: number | boolean | null
  examine_method?: string | null
  examination_duration?: string | null
  work_times?: VeterinaryDoctorWorkTimeApiDto[] | null
  prices?: VeterinaryDoctorPricesApiDto | null
  subtitle?: string | null
  examinations_count?: number | null
  fees?: number | null
  personal_picture?: string | null
  total_stars?: number | null
}

export type VeterinaryDoctorsApiMeta = {
  totalItems?: number
  itemCount?: number
  itemsPerPage?: number
  totalPages?: number
  currentPage?: number
}

export type VeterinaryDoctorsApiResponse = {
  data?: VeterinaryDoctorApiDto[]
  meta?: VeterinaryDoctorsApiMeta
}

export type VeterinaryDoctorsQueryParams = {
  page?: number
  limit?: number
  allow_clinic_examine?: 0 | 1
  allow_outdoor_examine?: 0 | 1
}

export type VeterinaryReservedTimeApiDto = {
  from?: string | null
  to?: string | null
  time?: string | null
}

export type VeterinaryReservedTimesApiResponse = {
  data?: VeterinaryReservedTimeApiDto[]
  canReserve?: boolean
}

export type CreateVeterinaryReservationApiRequest = {
  doctor_id: string | number
  service_type: 'clinic_examine' | 'outdoor_examine'
  date: string
  day: string
  from: string
  to: string
  payment_method_id: number
  customer_name: string
  customer_phone: string
  country_code?: string
  address?: string
  PIN_code?: string
}

export type CreateVeterinaryReservationRecordApiResponse = {
  id?: string | number
  message?: string
  invoice?: string | null
  [key: string]: unknown
}

export type CreateVeterinaryReservationCardApiResponse = {
  message?: string
  amount: number
  currency: string
  payment_type: string
  merchant_transaction_id: number | string
  description: string
  module: string
  payment_method_id: number | string
  address: {
    customer_email: string
    country: string
    state: string
    street1: string
    postcode: string
    first_name: string
    last_name: string
  }
  invoice?: unknown | null
}

export type CreateVeterinaryReservationApiResponse =
  | CreateVeterinaryReservationCardApiResponse
  | CreateVeterinaryReservationRecordApiResponse
