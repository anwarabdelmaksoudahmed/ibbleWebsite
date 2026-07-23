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
