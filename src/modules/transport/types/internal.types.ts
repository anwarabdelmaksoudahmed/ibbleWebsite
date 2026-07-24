export type TransportTripDriver = {
  id: string
  name: string
  phone: string
  countryCode: string
  avatar: string
}

export type TransportTripVehicle = {
  id: string
  model: string
  plateNumber: string
  year: string
}

export type TransportTrip = {
  id: string
  status: string
  distanceKm: number | null
  camelCount: number
  startAddress: string
  endAddress: string
  dateTime: string
  price: number
  vehicleImage: string
  vehicleName: string
  vehicle: TransportTripVehicle
  driver: TransportTripDriver
}

export type TransportTripsPage = {
  items: TransportTrip[]
  count: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
}

export type TransportVehicleType = {
  id: string
  name: string
  image: string
  capacity: number
  kilometerPrice: number
}
