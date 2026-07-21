<script setup lang="ts">
import type { PlaceSelection } from '@shared/maps/types'
import { useGoogleMaps } from '@shared/maps/composables/useGoogleMaps'
import { cn } from '@shared/utils/cn'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    placeholder?: string
    hint?: string
    error?: string
    required?: boolean
    disabled?: boolean
    icon?: string
    id?: string
    country?: string
    types?: string[]
  }>(),
  {
    required: false,
    disabled: false,
    icon: 'lucide:map-pin',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [place: PlaceSelection | null]
  blur: []
}>()

const inputId = computed(() => props.id ?? useId())
const inputRef = ref<HTMLInputElement | null>(null)
const selectedPlaceId = ref<string | null>(null)
const isBound = ref(false)

const { ensureLoaded } = useGoogleMaps({
  country: props.country,
})

let disposeAutocomplete: (() => void) | null = null

async function bindAutocomplete() {
  if (!import.meta.client || !inputRef.value || isBound.value) return

  const mapsService = await ensureLoaded()
  if (!mapsService || !inputRef.value) return

  disposeAutocomplete = await mapsService.bindAutocomplete(
    inputRef.value,
    (place) => {
      if (!place) {
        selectedPlaceId.value = null
        emit('select', null)
        return
      }

      selectedPlaceId.value = place.placeId
      emit('update:modelValue', place.label)
      emit('select', place)
    },
    {
      country: props.country,
      types: props.types,
    },
  )

  isBound.value = true
}

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (selectedPlaceId.value) {
    selectedPlaceId.value = null
    emit('select', null)
  }
  emit('update:modelValue', value)
}

function clearSelection() {
  selectedPlaceId.value = null
}

defineExpose({ clearSelection, inputRef })

onMounted(() => {
  void bindAutocomplete()
})

onBeforeUnmount(() => {
  disposeAutocomplete?.()
  disposeAutocomplete = null
})
</script>

<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-semibold text-ibbil-green"
    >
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <div
      class="relative flex overflow-hidden rounded-xl border bg-[#fafbfa] transition-all focus-within:border-ibbil-green focus-within:bg-white focus-within:ring-2 focus-within:ring-ibbil-green/15"
      :class="error ? 'border-danger' : 'border-border'"
    >
      <span
        class="flex shrink-0 items-center ps-3.5 text-ibbil-green/70"
        aria-hidden="true"
      >
        <Icon :name="icon" class="size-4" />
      </span>

      <input
        :id="inputId"
        ref="inputRef"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        autocomplete="off"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        :class="
          cn(
            'min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 py-3 text-sm text-foreground shadow-none outline-none ring-0',
            'placeholder:text-foreground-muted focus:outline-none focus:ring-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )
        "
        @input="onInput"
        @blur="emit('blur')"
      >

      <span
        v-if="selectedPlaceId"
        class="flex shrink-0 items-center pe-3 text-success"
        aria-hidden="true"
      >
        <Icon name="lucide:circle-check" class="size-4" />
      </span>
    </div>

    <p v-if="hint && !error" :id="`${inputId}-hint`" class="text-xs text-foreground-muted">
      {{ hint }}
    </p>
    <p v-if="error" :id="`${inputId}-error`" class="text-xs text-danger" role="alert">
      {{ error }}
    </p>
  </div>
</template>
