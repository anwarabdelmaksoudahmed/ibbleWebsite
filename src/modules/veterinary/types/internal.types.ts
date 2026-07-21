export type VeterinaryReservationDoctor = {
  fullName: string
  clinicAddress: string
  subtitle: string
  examineMethod: string
}

export type VeterinaryReservation = {
  id: string
  clinicId: string
  clinicName: string
  timeLabel: string
  customerId: string
  customerPhone: string
  customerName: string
  customerNationalId: string
  price: number
  currency: string
  invoiceUrl: string | null
  diagnosis: string
  prescription: string
  serviceType: string
  status: string
  attended: boolean | null
  isPaid: boolean
  depositAmount: number
  commissionAmount: number
  createdAt: string
  doctor: VeterinaryReservationDoctor
}

export type VeterinaryReservationsPage = {
  items: VeterinaryReservation[]
  count: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
}

export type VeterinaryWeekdayName =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'

export type VeterinaryDoctorWorkPeriod = {
  from: string
  to: string
}

export type VeterinaryDoctorWorkTime = {
  day: VeterinaryWeekdayName
  isActive: boolean
  workingPeriods: VeterinaryDoctorWorkPeriod[]
}

export type VeterinaryDoctorPrices = {
  clinicExamine: number
  outdoorExamine: number
  consulting: number
}

export type VeterinaryDoctor = {
  id: string
  userId: string
  clinicId: string
  clinicName: string
  type: string
  description: string
  fullName: string
  email: string
  phone: string
  countryCode: string
  clinicAddress: string
  cityId: string
  examineMethod: string
  examinationDuration: string
  workTimes: VeterinaryDoctorWorkTime[]
  prices: VeterinaryDoctorPrices
  personalPicture: string
  totalStars: number | null
  examinationsCount: number
}

export type VeterinaryDoctorsPage = {
  items: VeterinaryDoctor[]
  count: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
}

export type VeterinaryAppointmentDay = {
  day: VeterinaryWeekdayName
  date: string
  label: string
  isToday: boolean
}

export type VeterinaryAppointmentSlot = {
  from: string
  to: string
  label: string
}

export type VeterinaryPaymentMethodId = 'card' | 'wallet'

export type VeterinaryBookingPaymentForm = {
  customerName: string
  customerPhone: string
  countryCode: string
  address: string
  paymentMethod: VeterinaryPaymentMethodId | ''
}
