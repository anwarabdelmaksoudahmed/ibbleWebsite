<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BaseCheckboxProps = {
  modelValue?: boolean
  label?: string
  hint?: string
  error?: string
  size?: ComponentSize
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<BaseCheckboxProps>(), {
  modelValue: false,
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const inputId = computed(() => props.id ?? useId())

const sizeClass = computed(() => ({
  xs: 'size-3.5',
  sm: 'size-4',
  md: 'size-4',
  lg: 'size-5',
  xl: 'size-5',
}[props.size]))
</script>

<template>
  <div class="space-y-1">
    <label :for="inputId" class="inline-flex cursor-pointer items-start gap-2">
      <input
        :id="inputId"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :aria-invalid="!!error"
        :class="cn('mt-0.5 rounded border-border text-primary-600 focus:ring-primary-500', sizeClass)"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      >
      <span v-if="label" class="text-sm text-foreground">{{ label }}</span>
    </label>
    <p v-if="hint && !error" class="text-xs text-foreground-muted">{{ hint }}</p>
    <p v-if="error" class="text-xs text-danger" role="alert">{{ error }}</p>
  </div>
</template>
