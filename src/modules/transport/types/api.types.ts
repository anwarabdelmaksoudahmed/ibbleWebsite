export type TransportTripVehicleApiDto = {
  id?: number | string | null
  featuredImage?: string | null
  images?: string | null
  model?: string | null
  plateNumber?: string | null
  year?: number | string | null
}

export type TransportTripVehicleTypeApiDto = {
  image?: string | null
  name?: string | null
}

export type TransportTripDriverApiDto = {
  id?: number | string | null
  name?: string | null
  phone?: string | null
  countryCode?: string | null
  avatar?: string | null
}

export type TransportTripApiDto = {
  id: number | string
  vehicleId?: number | string | null
  vehicle?: TransportTripVehicleApiDto | null
  status?: string | null
  distance?: string | number | null
  noOfCamels?: number | string | null
  startAddress?: string | null
  endAddress?: string | null
  dateTime?: string | null
  vehicleType?: TransportTripVehicleTypeApiDto | null
  driver?: TransportTripDriverApiDto | null
  price?: string | number | null
  vehicle_image?: string | null
  vehicle_name?: string | null
}

export type TransportTripsApiMeta = {
  totalItems?: number
  itemCount?: number
  itemsPerPage?: number
  totalPages?: number
  currentPage?: number
}

export type TransportTripsApiResponse = {
  message?: string
  data?: TransportTripApiDto[]
  meta?: TransportTripsApiMeta
  status?: number
}

export type TransportTripsQueryParams = {
  page?: number
  status?: string
}

export type TransportAllowedVehicleTypeTranslationApiDto = {
  id?: number | string | null
  name?: string | null
  allowedVehicleTypeId?: number | string | null
  lang?: string | null
}

export type TransportAllowedVehicleTypeApiDto = {
  id: number | string
  name?: string | null
  status?: number | string | null
  translations?: TransportAllowedVehicleTypeTranslationApiDto[] | null
  image?: string | null
  kilometerPrice?: string | number | null
  capacity?: number | string | null
  numberOfVehicles?: number | string | null
  numberOfTrips?: number | string | null
}

export type TransportAllowedVehicleTypesApiResponse = {
  message?: string
  data?: TransportAllowedVehicleTypeApiDto[]
  meta?: TransportTripsApiMeta
  status?: number
}

export type TransportAllowedVehicleTypesQueryParams = {
  /** Active types only — API expects `filters[status]=1` */
  status?: number | string
}

export type CreateTransportTripRequestApiPayload = {
  userName: string
  phone: string
  countryCode: string
  dateTime: string
  startPoint: string
  endPoint: string
  startAddress: string
  endAddress: string
  price: string
  vehicleTypeId: number
}

export type TransportTripRequestApiDto = {
  id: number | string
  status?: string | null
  dateTime?: string | null
  userName?: string | null
  phone?: string | null
  price?: string | number | null
  startPoint?: string | null
  endPoint?: string | null
  startAddress?: string | null
  endAddress?: string | null
  distance?: string | number | null
  allowedVehicleTypeId?: number | string | null
  created_at?: string | null
}

export type TransportTripRequestApiResponse = {
  message?: string
  data?: TransportTripRequestApiDto
  status?: number
}

export type TransportOfferApiDto = {
  id: number | string
  status?: string | null
  price?: string | number | null
  tripRequestId?: number | string | null
  driverId?: number | string | null
  driverName?: string | null
  vehicleId?: number | string | null
  vehicleName?: string | null
  vehicleImage?: string | null
  created_at?: string | null
}

export type TransportOffersApiResponse = {
  message?: string
  data?: TransportOfferApiDto[] | TransportOfferApiDto
  meta?: TransportTripsApiMeta
  status?: number
}

export type AcceptTransportOfferApiResponse = {
  message?: string
  data?: {
    id?: number | string
    vehicleId?: number | string | null
    status?: string | null
    distance?: string | number | null
    price?: string | number | null
  }
  status?: number
}

export type AcceptTransportOfferApiPayload = {
  tripRequestId: number | string
  status: 'accepted' | 'rejected'
  distance: number
}

export type RegisterFcmTokenApiPayload = {
  fcm_token: string
  device_type: string
  device_id: string
}

export type PayTransportTripApiPayload = {
  payment_method_id: number
  PIN_code?: string
}

/** Wallet settles immediately. */
export type PayTransportTripWalletApiResponse = {
  message?: string
  data?: {
    id?: number | string
    status?: string | null
  }
  status?: number
}

/**
 * Card payments return HyperPay initiation fields (same shape as marketplace / insurance).
 */
export type PayTransportTripCardApiResponse = {
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

export type PayTransportTripApiResponse =
  | PayTransportTripCardApiResponse
  | PayTransportTripWalletApiResponse

export type TransportVehicleApiDto = {
  id?: number | string
  model?: string | null
  year?: string | number | null
  plateNumber?: string | null
  images?: string[] | null
}

export type TransportVehicleApiResponse = {
  message?: string
  data?: TransportVehicleApiDto
  status?: number
}

