import {
  DEFAULT_COUNTRY,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DEFAULT_REGION,
  DEFAULT_ROUTE_STROKE,
  GOOGLE_MAPS_SCRIPT_ID,
  PLACE_AUTOCOMPLETE_FIELDS,
} from '@shared/maps/constants/defaults'
import type {
  AutocompleteBindOptions,
  DrivingRouteResult,
  GoogleMapsServiceConfig,
  LatLngLiteral,
  MapCreateOptions,
  PlaceSelection,
} from '@shared/maps/types'
import { formatDistanceKm } from '@shared/maps/utils/formatters'

/**
 * Framework-agnostic Google Maps service.
 * Safe to copy into another project — no Nuxt/Vue imports.
 */
export class GoogleMapsService {
  private loadPromise: Promise<typeof google.maps> | null = null
  private readonly config: Required<
    Pick<GoogleMapsServiceConfig, 'apiKey' | 'language' | 'region' | 'country'>
  > &
    GoogleMapsServiceConfig

  constructor(config: GoogleMapsServiceConfig) {
    if (!config.apiKey) {
      throw new Error('GoogleMapsService: apiKey is required')
    }

    this.config = {
      language: 'ar',
      region: DEFAULT_REGION,
      country: DEFAULT_COUNTRY,
      defaultCenter: DEFAULT_MAP_CENTER,
      defaultZoom: DEFAULT_MAP_ZOOM,
      routeStrokeColor: DEFAULT_ROUTE_STROKE,
      ...config,
    }
  }

  get defaultCenter(): LatLngLiteral {
    return this.config.defaultCenter ?? DEFAULT_MAP_CENTER
  }

  get routeStrokeColor(): string {
    return this.config.routeStrokeColor ?? DEFAULT_ROUTE_STROKE
  }

  isBrowser(): boolean {
    return typeof window !== 'undefined'
  }

  isReady(): boolean {
    return Boolean(this.isBrowser() && window.google?.maps?.places && window.google.maps.Map)
  }

  async ensureLoaded(): Promise<typeof google.maps> {
    if (!this.isBrowser()) {
      throw new Error('Google Maps can only be loaded in the browser')
    }

    if (this.isReady()) {
      return window.google.maps
    }

    if (this.loadPromise) return this.loadPromise

    this.loadPromise = this.loadSdk()
      .then((maps) => maps)
      .catch((error) => {
        this.loadPromise = null
        throw error
      })

    return this.loadPromise
  }

  async createMap(
    container: HTMLElement,
    options: MapCreateOptions = {},
  ): Promise<google.maps.Map> {
    const maps = await this.ensureLoaded()

    return new maps.Map(container, {
      center: options.center ?? this.defaultCenter,
      zoom: options.zoom ?? this.config.defaultZoom ?? DEFAULT_MAP_ZOOM,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'cooperative',
      clickableIcons: false,
      styles: options.styles ?? [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    })
  }

  async createDirectionsRenderer(
    map: google.maps.Map,
    polylineColor = this.routeStrokeColor,
  ): Promise<{
    service: google.maps.DirectionsService
    renderer: google.maps.DirectionsRenderer
  }> {
    await this.ensureLoaded()

    const service = new google.maps.DirectionsService()
    const renderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: polylineColor,
        strokeOpacity: 0.9,
        strokeWeight: 5,
      },
    })

    return { service, renderer }
  }

  createWaypointMarker(
    map: google.maps.Map,
    place: PlaceSelection,
    kind: 'origin' | 'destination',
  ): google.maps.Marker {
    const label = kind === 'origin' ? 'A' : 'B'
    const fillColor = kind === 'origin' ? '#2d533d' : '#d4a044'

    return new google.maps.Marker({
      map,
      position: place.location,
      title: place.label,
      label: {
        text: label,
        color: '#ffffff',
        fontWeight: '700',
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    })
  }

  /**
   * Attach Places Autocomplete to an input. Returns a disposer.
   */
  async bindAutocomplete(
    input: HTMLInputElement,
    onSelect: (place: PlaceSelection | null) => void,
    options: AutocompleteBindOptions = {},
  ): Promise<() => void> {
    const maps = await this.ensureLoaded()

    const autocomplete = new maps.places.Autocomplete(input, {
      fields: options.fields ?? [...PLACE_AUTOCOMPLETE_FIELDS],
      componentRestrictions: {
        country: (options.country ?? this.config.country).toLowerCase(),
      },
      types: options.types ?? ['geocode'],
    })

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      const location = place.geometry?.location

      if (!place.place_id || !location) {
        onSelect(null)
        return
      }

      onSelect({
        label: (place.formatted_address || place.name || '').trim(),
        placeId: place.place_id,
        location: { lat: location.lat(), lng: location.lng() },
      })
    })

    return () => {
      google.maps.event.removeListener(listener)
    }
  }

  async getDrivingRoute(
    origin: LatLngLiteral,
    destination: LatLngLiteral,
  ): Promise<DrivingRouteResult> {
    await this.ensureLoaded()

    const service = new google.maps.DirectionsService()
    const directions = await service.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
      region: this.config.region,
      provideRouteAlternatives: false,
    })

    const leg = directions.routes[0]?.legs[0]
    const distanceMeters = leg?.distance?.value ?? 0

    if (distanceMeters <= 0) {
      throw new Error('NO_ROUTE')
    }

    return {
      distanceMeters,
      distanceKm: formatDistanceKm(distanceMeters),
      durationText: leg?.duration?.text || '',
      directions,
    }
  }

  clearDirections(renderer: google.maps.DirectionsRenderer, map: google.maps.Map | null): void {
    renderer.setMap(null)
    if (map) renderer.setMap(map)
  }

  fitBounds(
    map: google.maps.Map,
    points: LatLngLiteral[],
    padding = 64,
  ): void {
    if (!points.length) {
      map.setCenter(this.defaultCenter)
      map.setZoom(this.config.defaultZoom ?? DEFAULT_MAP_ZOOM)
      return
    }

    if (points.length === 1) {
      map.panTo(points[0]!)
      map.setZoom(10)
      return
    }

    const bounds = new google.maps.LatLngBounds()
    for (const point of points) bounds.extend(point)
    map.fitBounds(bounds, padding)
  }

  private async loadSdk(): Promise<typeof google.maps> {
    if (typeof window.google?.maps?.importLibrary === 'function') {
      return this.importLibraries(window.google.maps)
    }

    await this.injectScript()
    const maps = await this.waitForNamespace()
    return this.importLibraries(maps)
  }

  private buildScriptUrl(): string {
    const url = new URL('https://maps.googleapis.com/maps/api/js')
    url.searchParams.set('key', this.config.apiKey)
    url.searchParams.set('v', 'weekly')
    url.searchParams.set('loading', 'async')
    url.searchParams.set('language', this.config.language)
    url.searchParams.set('region', this.config.region)
    return url.toString()
  }

  private injectScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null

      if (existing) {
        if (typeof window.google?.maps?.importLibrary === 'function') {
          resolve()
          return
        }
        existing.addEventListener('load', () => resolve(), { once: true })
        existing.addEventListener(
          'error',
          () => reject(new Error('Failed to load Google Maps')),
          { once: true },
        )
        return
      }

      const script = document.createElement('script')
      script.id = GOOGLE_MAPS_SCRIPT_ID
      script.src = this.buildScriptUrl()
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => {
        script.remove()
        reject(new Error('Failed to load Google Maps'))
      }
      document.head.appendChild(script)
    })
  }

  private async waitForNamespace(timeoutMs = 15_000): Promise<typeof google.maps> {
    const started = Date.now()

    while (Date.now() - started < timeoutMs) {
      if (typeof window.google?.maps?.importLibrary === 'function') {
        return window.google.maps
      }
      await new Promise((r) => setTimeout(r, 40))
    }

    throw new Error('Timed out waiting for Google Maps')
  }

  private async importLibraries(maps: typeof google.maps): Promise<typeof google.maps> {
    await Promise.all([
      maps.importLibrary('maps'),
      maps.importLibrary('places'),
      maps.importLibrary('routes'),
    ])
    return maps
  }
}

let singleton: GoogleMapsService | null = null
let singletonFingerprint = ''

function fingerprint(config: GoogleMapsServiceConfig): string {
  return [config.apiKey, config.language ?? '', config.region ?? '', config.country ?? ''].join('|')
}

/** App-wide singleton — call from a Nuxt composable with runtime config. */
export function createGoogleMapsService(config: GoogleMapsServiceConfig): GoogleMapsService {
  const next = fingerprint(config)
  if (singleton && singletonFingerprint === next) return singleton

  singleton = new GoogleMapsService(config)
  singletonFingerprint = next
  return singleton
}

export function getGoogleMapsService(): GoogleMapsService {
  if (!singleton) {
    throw new Error('GoogleMapsService is not initialized. Call createGoogleMapsService() first.')
  }
  return singleton
}
