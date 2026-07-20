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
