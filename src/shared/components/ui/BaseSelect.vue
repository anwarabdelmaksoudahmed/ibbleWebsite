<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { INPUT_SIZE_CLASSES } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type SelectOption = { label: string; value: string | number; disabled?: boolean }

export type BaseSelectProps = {
  modelValue?: string | number
  options: SelectOption[]
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

const props = withDefaults(defineProps<BaseSelectProps>(), {
  size: 'md',
  disabled: false,
  loading: false,
  required: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()
const inputId = computed(() => props.id ?? useId())
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-foreground">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <select
      :id="inputId"
      :value="modelValue"
      :disabled="disabled || loading"
      :required="required"
      :aria-invalid="!!error"
      :class="cn(
        'w-full rounded-lg border bg-surface text-foreground',
        'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-danger' : 'border-border',
        INPUT_SIZE_CLASSES[size],
      )"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="hint && !error" class="text-xs text-foreground-muted">{{ hint }}</p>
    <p v-if="error" class="text-xs text-danger" role="alert">{{ error }}</p>
  </div>
</template>
