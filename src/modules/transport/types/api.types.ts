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

