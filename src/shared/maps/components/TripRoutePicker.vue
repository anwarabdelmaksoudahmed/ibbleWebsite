<script setup lang="ts">
import PlaceAutocomplete from '@shared/maps/components/PlaceAutocomplete.vue'
import { useGoogleMaps } from '@shared/maps/composables/useGoogleMaps'
import type { PlaceSelection } from '@shared/maps/types'

const props = withDefaults(
  defineProps<{
    origin: string
    destination: string
    distanceKm: string
    originError?: string
    destinationError?: string
    distanceError?: string
    originLabel?: string
    destinationLabel?: string
    distanceLabel?: string
    originPlaceholder?: string
    destinationPlaceholder?: string
    distancePlaceholder?: string
    originHint?: string
    destinationHint?: string
    distanceHint?: string
    autoDistanceHint?: string
    mapLabel?: string
    calculatingLabel?: string
    swapLabel?: string
    loadErrorLabel?: string
    noRouteLabel?: string
    kmUnit?: string
    required?: boolean
    country?: string
    /** stacked: fields above map; split: form + tall map side-by-side from lg */
    layout?: 'stacked' | 'split'
    showSwap?: boolean
    distanceReadonly?: boolean
  }>(),
  {
    required: true,
    layout: 'stacked',
    showSwap: true,
    distanceReadonly: false,
  },
)

const emit = defineEmits<{
  'update:origin': [value: string]
  'update:destination': [value: string]
  'update:distanceKm': [value: string | number]
  'origin-blur': []
  'destination-blur': []
  'distance-blur': []
}>()

const { t } = useI18n()
const { ensureLoaded, isLoading, loadError, isReady, defaultCenter } = useGoogleMaps({
  country: props.country,
})

const mapEl = ref<HTMLElement | null>(null)
const originPlace = ref<PlaceSelection | null>(null)
const destinationPlace = ref<PlaceSelection | null>(null)
const isCalculating = ref(false)
const routeError = ref('')
const isDistanceAuto = ref(false)
const routeDurationText = ref('')

let map: google.maps.Map | null = null
let directionsService: google.maps.DirectionsService | null = null
let directionsRenderer: google.maps.DirectionsRenderer | null = null
let originMarker: google.maps.Marker | null = null
let destinationMarker: google.maps.Marker | null = null
let calculateToken = 0

const showMap = computed(() => isReady.value && !loadError.value)

const labels = computed(() => ({
  origin: props.originLabel || t('maps.origin'),
  destination: props.destinationLabel || t('maps.destination'),
  distance: props.distanceLabel || t('maps.distance'),
  originPlaceholder: props.originPlaceholder || t('maps.originPlaceholder'),
  destinationPlaceholder: props.destinationPlaceholder || t('maps.destinationPlaceholder'),
  distancePlaceholder: props.distancePlaceholder || t('maps.distancePlaceholder'),
  originHint: props.originHint || t('maps.originHint'),
  destinationHint: props.destinationHint || t('maps.destinationHint'),
  distanceHint: props.distanceHint || t('maps.distanceHint'),
  autoDistanceHint: props.autoDistanceHint || t('maps.autoDistance'),
  mapLabel: props.mapLabel || t('maps.mapLabel'),
  calculating: props.calculatingLabel || t('maps.calculating'),
  swap: props.swapLabel || t('maps.swap'),
  loadError: props.loadErrorLabel || t('maps.loadError'),
  noRoute: props.noRouteLabel || t('maps.noRoute'),
  kmUnit: props.kmUnit || t('maps.kmUnit'),
}))

async function initMap() {
  if (!import.meta.client || !mapEl.value || map) return

  const mapsService = await ensureLoaded()
  if (!mapsService || !mapEl.value) return

  map = await mapsService.createMap(mapEl.value)
  const directions = await mapsService.createDirectionsRenderer(map)
  directionsService = directions.service
  directionsRenderer = directions.renderer
}

function clearMarkers() {
  originMarker?.setMap(null)
  destinationMarker?.setMap(null)
  originMarker = null
  destinationMarker = null
}

async function clearRouteOverlay() {
  if (!directionsRenderer) return
  const mapsService = await ensureLoaded()
  mapsService?.clearDirections(directionsRenderer, map)
}

async function upsertMarker(kind: 'origin' | 'destination', place: PlaceSelection | null) {
  if (!map) return

  if (!place) {
    if (kind === 'origin') {
      originMarker?.setMap(null)
      originMarker = null
    } else {
      destinationMarker?.setMap(null)
      destinationMarker = null
    }
    return
  }

  const existing = kind === 'origin' ? originMarker : destinationMarker
  if (existing) {
    existing.setPosition(place.location)
    existing.setTitle(place.label)
    return
  }

  const mapsService = await ensureLoaded()
  if (!mapsService || !map) return

  const marker = mapsService.createWaypointMarker(map, place, kind)
  if (kind === 'origin') originMarker = marker
  else destinationMarker = marker
}

async function fitViewport() {
  const mapsService = await ensureLoaded()
  if (!mapsService || !map) return

  if (originPlace.value && destinationPlace.value) return

  const points = [originPlace.value?.location, destinationPlace.value?.location].filter(
    Boolean,
  ) as Array<{ lat: number; lng: number }>

  mapsService.fitBounds(map, points.length ? points : [defaultCenter])
}

async function calculateRoute() {
  const token = ++calculateToken
  routeError.value = ''
  routeDurationText.value = ''

  if (!originPlace.value || !destinationPlace.value) {
    await clearRouteOverlay()
    await upsertMarker('origin', originPlace.value)
    await upsertMarker('destination', destinationPlace.value)
    await fitViewport()
    if (isDistanceAuto.value) {
      isDistanceAuto.value = false
      emit('update:distanceKm', '')
    }
    return
  }

  if (!directionsService || !directionsRenderer || !map) {
    await initMap()
  }

  const mapsService = await ensureLoaded()
  if (!mapsService || !directionsService || !directionsRenderer || !map) return

  isCalculating.value = true
  await upsertMarker('origin', originPlace.value)
  await upsertMarker('destination', destinationPlace.value)

  try {
    const route = await mapsService.getDrivingRoute(
      originPlace.value.location,
      destinationPlace.value.location,
    )

    if (token !== calculateToken) return

    directionsRenderer.setDirections(route.directions)
    isDistanceAuto.value = true
    emit('update:distanceKm', route.distanceKm)
    emit('distance-blur')
    routeDurationText.value = route.durationText
  } catch {
    if (token !== calculateToken) return
    await clearRouteOverlay()
    mapsService.fitBounds(map, [
      originPlace.value.location,
      destinationPlace.value.location,
    ])
    routeError.value = labels.value.noRoute
  } finally {
    if (token === calculateToken) isCalculating.value = false
  }
}

function onOriginSelect(place: PlaceSelection | null) {
  originPlace.value = place
  if (place) emit('origin-blur')
  void calculateRoute()
}

function onDestinationSelect(place: PlaceSelection | null) {
  destinationPlace.value = place
  if (place) emit('destination-blur')
  void calculateRoute()
}

function onDistanceInput(value: string | number) {
  isDistanceAuto.value = false
  emit('update:distanceKm', value)
}

function swapPoints() {
  const nextOrigin = props.destination
  const nextDestination = props.origin
  const nextOriginPlace = destinationPlace.value
  const nextDestinationPlace = originPlace.value

  emit('update:origin', nextOrigin)
  emit('update:destination', nextDestination)
  originPlace.value = nextOriginPlace
  destinationPlace.value = nextDestinationPlace
  void calculateRoute()
}

onMounted(async () => {
  await ensureLoaded()
  await nextTick()
  if (showMap.value) await initMap()
})

watch(showMap, async (ready) => {
  if (ready) {
    await nextTick()
    await initMap()
  }
})

onBeforeUnmount(() => {
  calculateToken += 1
  clearMarkers()
  directionsRenderer?.setMap(null)
  directionsRenderer = null
  directionsService = null
  map = null
})
</script>

<template>
  <div
    :class="
      layout === 'split'
        ? 'grid gap-6 lg:grid-cols-2 lg:items-stretch'
        : 'space-y-4'
    "
  >
    <div class="space-y-4">
      <slot name="before" />

      <div
        v-if="loadError"
        class="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-3 text-sm text-foreground"
        role="status"
      >
        <Icon name="lucide:map" class="mt-0.5 size-4 shrink-0 text-ibbil-gold" aria-hidden="true" />
        <p>{{ labels.loadError }}</p>
      </div>

      <div class="relative space-y-3">
        <PlaceAutocomplete
          :model-value="origin"
          :label="labels.origin"
          :placeholder="labels.originPlaceholder"
          :hint="labels.originHint"
          :error="originError"
          :country="country"
          icon="lucide:circle-dot"
          :required="required"
          @update:model-value="emit('update:origin', $event)"
          @select="onOriginSelect"
          @blur="emit('origin-blur')"
        />

        <div v-if="showSwap" class="flex justify-center">
          <BaseButton
            type="button"
            variant="ghost"
            size="sm"
            class="!rounded-full !px-3 !py-2 text-ibbil-green hover:bg-ibbil-green/10"
            :aria-label="labels.swap"
            :disabled="!origin && !destination"
            @click="swapPoints"
          >
            <Icon name="lucide:arrow-up-down" class="size-4" aria-hidden="true" />
            <span class="text-xs font-semibold">{{ labels.swap }}</span>
          </BaseButton>
        </div>

        <PlaceAutocomplete
          :model-value="destination"
          :label="labels.destination"
          :placeholder="labels.destinationPlaceholder"
          :hint="labels.destinationHint"
          :error="destinationError"
          :country="country"
          icon="lucide:map-pinned"
          :required="required"
          @update:model-value="emit('update:destination', $event)"
          @select="onDestinationSelect"
          @blur="emit('destination-blur')"
        />
      </div>

      <BaseInput
        v-if="layout === 'split'"
        :model-value="distanceKm"
        inputmode="decimal"
        autocomplete="off"
        :label="labels.distance"
        :placeholder="labels.distancePlaceholder"
        :hint="isDistanceAuto ? labels.autoDistanceHint : labels.distanceHint"
        :error="distanceError"
        :loading="isCalculating"
        :required="required"
        :disabled="distanceReadonly"
        @update:model-value="onDistanceInput"
        @blur="emit('distance-blur')"
      >
        <template #suffix>
          <span class="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted">
            <Icon
              v-if="isDistanceAuto"
              name="lucide:sparkles"
              class="size-3.5 text-ibbil-green"
              aria-hidden="true"
            />
            {{ labels.kmUnit }}
          </span>
        </template>
      </BaseInput>
    </div>

    <div
      v-if="showMap || isLoading"
      class="overflow-hidden rounded-2xl border border-ibbil-green/15 bg-[#eef2ef]"
      :class="layout === 'split' ? 'min-h-[280px] lg:min-h-full' : undefined"
    >
      <div
        class="flex items-center justify-between gap-2 border-b border-ibbil-green/10 bg-white/80 px-3.5 py-2.5 dark:bg-surface"
      >
        <div class="flex items-center gap-2 text-sm font-semibold text-ibbil-green">
          <Icon name="lucide:route" class="size-4" aria-hidden="true" />
          {{ labels.mapLabel }}
        </div>
        <p
          v-if="isCalculating || isLoading"
          class="flex items-center gap-1.5 text-xs text-foreground-muted"
        >
          <BaseLoader size="sm" />
          {{ labels.calculating }}
        </p>
        <p
          v-else-if="routeDurationText"
          class="text-xs font-medium text-foreground-muted"
        >
          {{ routeDurationText }}
        </p>
      </div>

      <div
        ref="mapEl"
        class="w-full"
        :class="layout === 'split' ? 'h-[280px] sm:h-[360px] lg:h-[min(100%,560px)] lg:min-h-[480px]' : 'h-56 sm:h-64'"
        role="img"
        :aria-label="labels.mapLabel"
      />
    </div>

    <template v-if="layout === 'stacked'">
      <p
        v-if="routeError"
        class="text-sm text-danger"
        role="alert"
      >
        {{ routeError }}
      </p>

      <BaseInput
        :model-value="distanceKm"
        inputmode="decimal"
        autocomplete="off"
        :label="labels.distance"
        :placeholder="labels.distancePlaceholder"
        :hint="isDistanceAuto ? labels.autoDistanceHint : labels.distanceHint"
        :error="distanceError"
        :loading="isCalculating"
        :required="required"
        :disabled="distanceReadonly"
        @update:model-value="onDistanceInput"
        @blur="emit('distance-blur')"
      >
        <template #suffix>
          <span class="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted">
            <Icon
              v-if="isDistanceAuto"
              name="lucide:sparkles"
              class="size-3.5 text-ibbil-green"
              aria-hidden="true"
            />
            {{ labels.kmUnit }}
          </span>
        </template>
      </BaseInput>
    </template>

    <p
      v-if="routeError && layout === 'split'"
      class="text-sm text-danger lg:col-span-2"
      role="alert"
    >
      {{ routeError }}
    </p>
  </div>
</template>
