<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BaseTextareaProps = {
  modelValue?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  size?: ComponentSize
  rows?: number
  disabled?: boolean
  loading?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<BaseTextareaProps>(), {
  size: 'md',
  rows: 4,
  disabled: false,
  loading: false,
  required: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const inputId = computed(() => props.id ?? useId())
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-foreground">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <textarea
      :id="inputId"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled || loading"
      :required="required"
      :aria-invalid="!!error"
      :class="cn(
        'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground',
        'placeholder:text-foreground-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-danger' : 'border-border',
      )"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="hint && !error" class="text-xs text-foreground-muted">{{ hint }}</p>
    <p v-if="error" class="text-xs text-danger" role="alert">{{ error }}</p>
  </div>
</template>
