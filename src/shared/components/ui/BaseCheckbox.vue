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
  rootClass?: string
  labelClass?: string
  inputClass?: string
}

const props = withDefaults(defineProps<BaseCheckboxProps>(), {
  modelValue: false,
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const inputId = computed(() => props.id ?? useId())

const boxSizeClass = computed(() => ({
  xs: 'size-3.5 rounded',
  sm: 'size-4 rounded',
  md: 'size-4 rounded-md',
  lg: 'size-5 rounded-md',
  xl: 'size-5 rounded-md',
}[props.size]))

const iconSizeClass = computed(() => ({
  xs: 'size-2.5',
  sm: 'size-3',
  md: 'size-3',
  lg: 'size-3.5',
  xl: 'size-3.5',
}[props.size]))

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <div :class="cn('space-y-1', rootClass)">
    <label
      :for="inputId"
      :class="cn(
        'group inline-flex cursor-pointer items-start gap-2.5',
        disabled && 'cursor-not-allowed opacity-60',
      )"
    >
      <span class="relative mt-0.5 inline-flex shrink-0">
        <input
          :id="inputId"
          type="checkbox"
          :checked="modelValue"
          :disabled="disabled"
          :aria-invalid="!!error || undefined"
          :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
          :class="cn(
            'peer absolute inset-0 z-10 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed',
            inputClass,
          )"
          @change="onChange"
        >
        <span
          :class="cn(
            'pointer-events-none inline-flex items-center justify-center border-2 transition-all duration-150',
            modelValue
              ? 'border-ibbil-green bg-ibbil-green text-white shadow-sm shadow-ibbil-green/20'
              : error
                ? 'border-danger bg-[#fafbfa]'
                : 'border-border bg-[#fafbfa] group-hover:border-ibbil-green/45',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-ibbil-green/25 peer-focus-visible:ring-offset-2',
            boxSizeClass,
          )"
          aria-hidden="true"
        >
          <Icon
            name="lucide:check"
            :class="cn(
              'stroke-[3] text-white transition-all duration-150',
              iconSizeClass,
              modelValue ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
            )"
          />
        </span>
      </span>
      <span
        v-if="label || $slots.label"
        :class="cn('select-none text-sm leading-snug text-foreground-muted', labelClass)"
      >
        <slot name="label">{{ label }}</slot>
      </span>
    </label>
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
    >
      {{ error }}
    </p>
  </div>
</template>
