<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { INPUT_SIZE_CLASSES } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'
import { formatDate } from '@shared/utils/formatters'

export type BaseDatePickerProps = {
  modelValue?: string
  label?: string
  hint?: string
  error?: string
  size?: ComponentSize
  disabled?: boolean
  min?: string
  max?: string
  id?: string
}

const props = withDefaults(defineProps<BaseDatePickerProps>(), {
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const inputId = computed(() => props.id ?? useId())

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  return formatDate(props.modelValue)
})
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-foreground">{{ label }}</label>
    <input
      :id="inputId"
      type="date"
      :value="modelValue"
      :disabled="disabled"
      :min="min"
      :max="max"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
      :title="displayValue"
      :class="cn(
        'w-full rounded-lg border bg-surface text-foreground',
        'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-danger' : 'border-border',
        INPUT_SIZE_CLASSES[size],
      )"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <p v-if="hint && !error" :id="`${inputId}-hint`" class="text-xs text-foreground-muted">{{ hint }}</p>
    <p v-if="error" :id="`${inputId}-error`" class="text-xs text-danger" role="alert">{{ error }}</p>
  </div>
</template>
