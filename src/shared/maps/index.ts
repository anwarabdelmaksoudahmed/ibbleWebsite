export type {
  AutocompleteBindOptions,
  DrivingRouteResult,
  GoogleMapsServiceConfig,
  LatLngLiteral,
  MapCreateOptions,
  PlaceSelection,
} from '@shared/maps/types'

export {
  DEFAULT_COUNTRY,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DEFAULT_REGION,
  DEFAULT_ROUTE_STROKE,
} from '@shared/maps/constants/defaults'

export { formatDistanceKm } from '@shared/maps/utils/formatters'

export {
  GoogleMapsService,
  createGoogleMapsService,
  getGoogleMapsService,
} from '@shared/maps/services/google-maps.service'

export { useGoogleMaps } from '@shared/maps/composables/useGoogleMaps'
