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
