<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import type { ComponentSize } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BaseTimePickerProps = {
  modelValue?: string
  label?: string
  hint?: string
  error?: string
  size?: ComponentSize
  disabled?: boolean
  required?: boolean
  min?: string
  max?: string
  id?: string
  placeholder?: string
  minuteStep?: number
}

const props = withDefaults(defineProps<BaseTimePickerProps>(), {
  size: 'md',
  disabled: false,
  required: false,
  minuteStep: 5,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const { t } = useI18n()
const inputId = computed(() => props.id ?? useId())
const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({})
const hourListRef = ref<HTMLElement | null>(null)
const minuteListRef = ref<HTMLElement | null>(null)

const sizeClasses: Record<ComponentSize, string> = {
  xs: 'text-xs px-2 py-1.5',
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-3.5 py-3',
  lg: 'text-base px-4 py-3',
  xl: 'text-lg px-4 py-3.5',
}

const placeholderText = computed(
  () => props.placeholder || t('common.timePicker.placeholder'),
)

const selectedHour = ref<number | null>(null)
const selectedMinute = ref<number | null>(null)

const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = computed(() => {
  const step = props.minuteStep
  return Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step)
})

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue
})

function parseModelValue() {
  if (!props.modelValue) {
    selectedHour.value = null
    selectedMinute.value = null
    return
  }
  const parts = props.modelValue.split(':').map(Number)
  selectedHour.value = parts[0] ?? null
  selectedMinute.value = parts[1] ?? null
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function isTimeDisabled(h: number, m: number): boolean {
  const time = `${pad(h)}:${pad(m)}`
  if (props.min && time < props.min) return true
  if (props.max && time > props.max) return true
  return false
}

function selectHour(h: number) {
  selectedHour.value = h
  const minute = selectedMinute.value ?? 0
  if (!isTimeDisabled(h, minute)) {
    emitValue(h, minute)
  }
}

function selectMinute(m: number) {
  const hour = selectedHour.value ?? 0
  selectedMinute.value = m
  if (!isTimeDisabled(hour, m)) {
    emitValue(hour, m)
  }
}

function emitValue(h: number, m: number) {
  emit('update:modelValue', `${pad(h)}:${pad(m)}`)
}

function scrollToSelected() {
  nextTick(() => {
    const hourEl = hourListRef.value?.querySelector('[data-selected="true"]') as HTMLElement
    const minuteEl = minuteListRef.value?.querySelector('[data-selected="true"]') as HTMLElement
    hourEl?.scrollIntoView({ block: 'center', behavior: 'instant' })
    minuteEl?.scrollIntoView({ block: 'center', behavior: 'instant' })
  })
}

onClickOutside(rootRef, () => closePanel(), { ignore: [panelRef] })

watch(isOpen, async (open) => {
  if (!open) return
  parseModelValue()
  await nextTick()
  updatePanelPosition()
  scrollToSelected()
})

watch(() => props.modelValue, () => {
  if (!isOpen.value) parseModelValue()
})

function updatePanelPosition() {
  const trigger = triggerRef.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  const width = Math.min(Math.max(rect.width, 220), window.innerWidth - 16)
  let left = rect.left
  if (left + width > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - width - 8)
  }
  const panelHeight = 280
  const gap = 6
  const spaceBelow = window.innerHeight - rect.bottom - gap
  const preferUp = spaceBelow < panelHeight && rect.top > spaceBelow

  panelStyle.value = preferUp
    ? { position: 'fixed', left: `${left}px`, width: `${width}px`, bottom: `${window.innerHeight - rect.top + gap}px`, top: 'auto', zIndex: '80' }
    : { position: 'fixed', left: `${left}px`, width: `${width}px`, top: `${rect.bottom + gap}px`, bottom: 'auto', zIndex: '80' }
}

function openPanel() {
  if (props.disabled) return
  isOpen.value = true
}

function closePanel() {
  if (!isOpen.value) return
  isOpen.value = false
}

function togglePanel() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function onTriggerBlur(event: FocusEvent) {
  emit('blur', event)
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closePanel()
    return
  }
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    openPanel()
  }
}

if (import.meta.client) {
  useEventListener(window, 'resize', () => {
    if (isOpen.value) updatePanelPosition()
  })
  useEventListener(window, 'scroll', () => {
    if (isOpen.value) updatePanelPosition()
  }, true)
}
</script>

<template>
  <div ref="rootRef" class="space-y-1.5">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-semibold text-ibbil-green"
    >
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <div
      class="relative flex items-center overflow-visible rounded-xl border bg-[#fafbfa] transition-all duration-200"
      :class="cn(
        isOpen && !error && 'border-ibbil-green bg-white ring-2 ring-ibbil-green/15',
        !isOpen && !error && 'border-border hover:border-ibbil-green/40',
        error && 'border-danger ring-2 ring-danger/10',
        disabled && 'pointer-events-none opacity-50',
      )"
    >
      <button
        :id="inputId"
        ref="triggerRef"
        type="button"
        class="flex min-w-0 flex-1 items-center gap-2 border-0 bg-transparent text-start outline-none focus-visible:outline-none"
        :class="cn(sizeClasses[size], 'pe-10', !displayValue && 'text-foreground-muted')"
        :disabled="disabled"
        :aria-label="label || placeholderText"
        :aria-expanded="isOpen"
        aria-haspopup="dialog"
        :aria-controls="isOpen ? `${inputId}-panel` : undefined"
        :aria-invalid="!!error || undefined"
        :aria-required="required || undefined"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        @click="togglePanel"
        @blur="onTriggerBlur"
        @keydown="onTriggerKeydown"
      >
        <span class="min-w-0 flex-1 truncate">
          {{ displayValue || placeholderText }}
        </span>
      </button>

      <Icon
        name="lucide:clock"
        class="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ibbil-green"
        aria-hidden="true"
      />
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="isOpen"
          :id="`${inputId}-panel`"
          ref="panelRef"
          :style="panelStyle"
          class="overflow-hidden rounded-xl border border-border bg-white shadow-[0_16px_40px_-16px_rgba(45,83,61,0.45)]"
          role="dialog"
          :aria-label="label || placeholderText"
        >
          <div class="flex h-64">
            <!-- Hours -->
            <div
              ref="hourListRef"
              class="flex-1 overflow-y-auto border-e border-border"
              role="listbox"
              :aria-label="t('common.timePicker.hour')"
            >
              <div class="sticky top-0 z-10 bg-white/90 px-2 py-2 text-center text-[11px] font-semibold text-foreground-muted backdrop-blur-sm">
                {{ t('common.timePicker.hour') }}
              </div>
              <div class="px-1.5 pb-2">
                <button
                  v-for="h in hours"
                  :key="h"
                  type="button"
                  role="option"
                  :data-selected="selectedHour === h"
                  :aria-selected="selectedHour === h"
                  class="mb-0.5 flex w-full items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors"
                  :class="cn(
                    selectedHour === h && 'bg-ibbil-green text-white',
                    selectedHour !== h && 'text-foreground hover:bg-ibbil-green/10',
                  )"
                  @click="selectHour(h)"
                >
                  {{ pad(h) }}
                </button>
              </div>
            </div>

            <!-- Minutes -->
            <div
              ref="minuteListRef"
              class="flex-1 overflow-y-auto"
              role="listbox"
              :aria-label="t('common.timePicker.minute')"
            >
              <div class="sticky top-0 z-10 bg-white/90 px-2 py-2 text-center text-[11px] font-semibold text-foreground-muted backdrop-blur-sm">
                {{ t('common.timePicker.minute') }}
              </div>
              <div class="px-1.5 pb-2">
                <button
                  v-for="m in minutes"
                  :key="m"
                  type="button"
                  role="option"
                  :data-selected="selectedMinute === m"
                  :aria-selected="selectedMinute === m"
                  class="mb-0.5 flex w-full items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors"
                  :class="cn(
                    selectedMinute === m && 'bg-ibbil-green text-white',
                    selectedMinute !== m && 'text-foreground hover:bg-ibbil-green/10',
                  )"
                  :disabled="selectedHour !== null && isTimeDisabled(selectedHour, m)"
                  @click="selectMinute(m)"
                >
                  {{ pad(m) }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <p v-if="hint && !error" :id="`${inputId}-hint`" class="text-xs text-foreground-muted">
      {{ hint }}
    </p>
    <p v-if="error" :id="`${inputId}-error`" class="text-xs text-danger" role="alert">
      {{ error }}
    </p>
  </div>
</template>
