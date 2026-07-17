export type LatLngLiteral = {
  lat: number
  lng: number
}

export type PlaceSelection = {
  label: string
  placeId: string
  location: LatLngLiteral
}

export type GoogleMapsServiceConfig = {
  apiKey: string
  language?: string
  region?: string
  /** ISO 3166-1 Alpha-2, e.g. `sa` */
  country?: string
  defaultCenter?: LatLngLiteral
  defaultZoom?: number
  routeStrokeColor?: string
}

export type AutocompleteBindOptions = {
  country?: string
  types?: string[]
  fields?: string[]
}

export type DrivingRouteResult = {
  distanceMeters: number
  distanceKm: string
  durationText: string
  directions: google.maps.DirectionsResult
}

export type MapCreateOptions = {
  center?: LatLngLiteral
  zoom?: number
  styles?: google.maps.MapTypeStyle[]
}
