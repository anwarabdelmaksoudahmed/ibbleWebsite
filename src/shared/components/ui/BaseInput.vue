<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { INPUT_SIZE_CLASSES } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BaseInputProps = {
  modelValue?: string | number
  type?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  size?: ComponentSize
  disabled?: boolean
  loading?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<BaseInputProps>(), {
  type: 'text',
  size: 'md',
  disabled: false,
  loading: false,
  required: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()

const inputId = computed(() => props.id ?? useId())

const classes = computed(() =>
  cn(
    'w-full rounded-lg border bg-surface text-foreground transition-colors',
    'placeholder:text-foreground-muted',
    'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
    props.error ? 'border-danger' : 'border-border',
    INPUT_SIZE_CLASSES[props.size],
  ),
)
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-foreground">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        :class="classes"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <div v-if="loading" class="absolute top-1/2 right-3 -translate-y-1/2">
        <BaseLoader size="sm" />
      </div>
    </div>
    <p v-if="hint && !error" :id="`${inputId}-hint`" class="text-xs text-foreground-muted">{{ hint }}</p>
    <p v-if="error" :id="`${inputId}-error`" class="text-xs text-danger" role="alert">{{ error }}</p>
  </div>
</template>
