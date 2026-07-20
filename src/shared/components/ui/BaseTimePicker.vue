<script setup lang="ts">
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
}

const props = withDefaults(defineProps<BaseTimePickerProps>(), {
  size: 'md',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const { t } = useI18n()
const inputId = computed(() => props.id ?? useId())

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

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
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
      class="relative flex items-center overflow-hidden rounded-xl border bg-[#fafbfa] transition-all duration-200"
      :class="cn(
        !error && 'border-border focus-within:border-ibbil-green focus-within:bg-white focus-within:ring-2 focus-within:ring-ibbil-green/15',
        error && 'border-danger ring-2 ring-danger/10',
        disabled && 'pointer-events-none opacity-50',
      )"
    >
      <input
        :id="inputId"
        type="time"
        :value="modelValue"
        :min="min"
        :max="max"
        :disabled="disabled"
        :required="required"
        :placeholder="placeholderText"
        :aria-invalid="!!error || undefined"
        :aria-required="required || undefined"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        class="min-w-0 flex-1 appearance-none border-0 bg-transparent text-foreground outline-none focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed"
        :class="cn(sizeClasses[size], 'pe-10')"
        @input="onInput"
        @blur="emit('blur', $event)"
      >

      <Icon
        name="lucide:clock"
        class="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ibbil-green"
        aria-hidden="true"
      />
    </div>

    <p v-if="hint && !error" :id="`${inputId}-hint`" class="text-xs text-foreground-muted">
      {{ hint }}
    </p>
    <p v-if="error" :id="`${inputId}-error`" class="text-xs text-danger" role="alert">
      {{ error }}
    </p>
  </div>
</template>
