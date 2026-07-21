import type { LatLngLiteral } from '@shared/maps/types'

/** Default map center — Riyadh, Saudi Arabia */
export const DEFAULT_MAP_CENTER: LatLngLiteral = {
  lat: 24.7136,
  lng: 46.6753,
}

export const DEFAULT_MAP_ZOOM = 5
export const DEFAULT_COUNTRY = 'sa'
export const DEFAULT_REGION = 'SA'
export const DEFAULT_ROUTE_STROKE = '#2d533d'

export const GOOGLE_MAPS_SCRIPT_ID = 'ibble-google-maps-js'

export const PLACE_AUTOCOMPLETE_FIELDS = [
  'formatted_address',
  'geometry',
  'name',
  'place_id',
] as const
