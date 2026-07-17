<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import type { ComponentSize } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'
import { dayjs } from '@shared/utils/formatters'

export type BaseDatePickerProps = {
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
}

type DayCell = {
  key: string
  iso: string
  day: number
  inCurrentMonth: boolean
  disabled: boolean
  selected: boolean
  isToday: boolean
}

const props = withDefaults(defineProps<BaseDatePickerProps>(), {
  size: 'md',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const { t, locale } = useI18n()

const inputId = computed(() => props.id ?? useId())
const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

const sizeClasses: Record<ComponentSize, string> = {
  xs: 'text-xs px-2 py-1.5',
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-3.5 py-3',
  lg: 'text-base px-4 py-3',
  xl: 'text-lg px-4 py-3.5',
}

const intlLocale = computed(() => (locale.value === 'ar' ? 'ar-SA' : 'en-SA'))

const viewCursor = ref(dayjs(props.modelValue || undefined).startOf('month'))

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  return new Intl.DateTimeFormat(intlLocale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dayjs(props.modelValue).toDate())
})

const placeholderText = computed(
  () => props.placeholder || t('common.datePicker.placeholder'),
)

const monthTitle = computed(() =>
  new Intl.DateTimeFormat(intlLocale.value, {
    month: 'long',
    year: 'numeric',
  }).format(viewCursor.value.toDate()),
)

const weekdayLabels = computed(() => {
  const formatter = new Intl.DateTimeFormat(intlLocale.value, { weekday: 'short' })
  // Week starts Sunday to match native date inputs commonly used here.
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(2024, 0, 7 + index))
    return formatter.format(date)
  })
})

const todayIso = computed(() => dayjs().format('YYYY-MM-DD'))

const calendarDays = computed<DayCell[]>(() => {
  const start = viewCursor.value.startOf('month')
  const startWeekday = start.day() // 0=Sun
  const gridStart = start.subtract(startWeekday, 'day')

  return Array.from({ length: 42 }, (_, index) => {
    const date = gridStart.add(index, 'day')
    const iso = date.format('YYYY-MM-DD')
    const disabled =
      (Boolean(props.min) && iso < props.min!) ||
      (Boolean(props.max) && iso > props.max!)

    return {
      key: iso,
      iso,
      day: date.date(),
      inCurrentMonth: date.month() === viewCursor.value.month(),
      disabled,
      selected: iso === props.modelValue,
      isToday: iso === todayIso.value,
    }
  })
})

onClickOutside(rootRef, () => closePanel(), { ignore: [panelRef] })

watch(isOpen, async (open) => {
  if (!open) return
  viewCursor.value = dayjs(props.modelValue || undefined).startOf('month')
  await nextTick()
  updatePanelPosition()
})

watch(
  () => props.modelValue,
  (value) => {
    if (value && !isOpen.value) {
      viewCursor.value = dayjs(value).startOf('month')
    }
  },
)

function updatePanelPosition() {
  const trigger = triggerRef.value
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const width = Math.min(Math.max(rect.width, 288), window.innerWidth - 16)
  let left = rect.left
  if (left + width > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - width - 8)
  }

  const panelHeight = 340
  const gap = 6
  const spaceBelow = window.innerHeight - rect.bottom - gap
  const preferUp = spaceBelow < panelHeight && rect.top > spaceBelow

  panelStyle.value = preferUp
    ? {
        position: 'fixed',
        left: `${left}px`,
        width: `${width}px`,
        bottom: `${window.innerHeight - rect.top + gap}px`,
        top: 'auto',
        zIndex: '80',
      }
    : {
        position: 'fixed',
        left: `${left}px`,
        width: `${width}px`,
        top: `${rect.bottom + gap}px`,
        bottom: 'auto',
        zIndex: '80',
      }
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

function prevMonth() {
  viewCursor.value = viewCursor.value.subtract(1, 'month')
}

function nextMonth() {
  viewCursor.value = viewCursor.value.add(1, 'month')
}

function selectDay(cell: DayCell) {
  if (cell.disabled) return
  emit('update:modelValue', cell.iso)
  closePanel()
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
        :aria-controls="isOpen ? `${inputId}-calendar` : undefined"
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
        name="lucide:calendar"
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
          :id="`${inputId}-calendar`"
          ref="panelRef"
          :style="panelStyle"
          class="overflow-hidden rounded-xl border border-border bg-white p-3 shadow-[0_16px_40px_-16px_rgba(45,83,61,0.45)]"
          role="dialog"
          :aria-label="label || placeholderText"
        >
          <div class="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              class="inline-flex size-8 items-center justify-center rounded-lg text-ibbil-green transition-colors hover:bg-ibbil-green/10"
              :aria-label="t('common.datePicker.prevMonth')"
              @click="prevMonth"
            >
              <DirectionalArrow direction="back" variant="chevron" size="sm" />
            </button>

            <p class="text-sm font-bold text-ibbil-green">
              {{ monthTitle }}
            </p>

            <button
              type="button"
              class="inline-flex size-8 items-center justify-center rounded-lg text-ibbil-green transition-colors hover:bg-ibbil-green/10"
              :aria-label="t('common.datePicker.nextMonth')"
              @click="nextMonth"
            >
              <DirectionalArrow variant="chevron" size="sm" />
            </button>
          </div>

          <div class="mb-1 grid grid-cols-7 gap-1">
            <span
              v-for="(weekday, weekdayIndex) in weekdayLabels"
              :key="weekdayIndex"
              class="py-1 text-center text-[11px] font-semibold text-foreground-muted"
            >
              {{ weekday }}
            </span>
          </div>

          <div class="grid grid-cols-7 gap-1" role="grid">
            <button
              v-for="cell in calendarDays"
              :key="cell.key"
              type="button"
              class="inline-flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-colors"
              :class="cn(
                cell.selected && 'bg-ibbil-green text-white hover:bg-ibbil-green-dark',
                !cell.selected && cell.isToday && 'ring-1 ring-ibbil-gold/70 text-ibbil-green',
                !cell.selected && !cell.isToday && cell.inCurrentMonth && 'text-foreground hover:bg-ibbil-green/10',
                !cell.selected && !cell.inCurrentMonth && 'text-foreground-muted/50 hover:bg-surface-muted',
                cell.disabled && 'cursor-not-allowed opacity-35 hover:bg-transparent',
              )"
              :disabled="cell.disabled"
              :aria-pressed="cell.selected"
              :aria-current="cell.isToday ? 'date' : undefined"
              @click="selectDay(cell)"
            >
              {{ cell.day }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <p
      v-if="hint && !error"
      :id="`${inputId}-hint`"
      class="text-xs text-foreground-muted"
    >
      {{ hint }}
    </p>
    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="text-xs text-danger"
      role="alert"
      data-validation-error
    >
      {{ error }}
    </p>
  </div>
</template>
