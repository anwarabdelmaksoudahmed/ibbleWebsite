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
  /** Classes for the outer field wrapper */
  rootClass?: string
  /** Classes for the label */
  labelClass?: string
  /** Classes merged onto the native textarea */
  textareaClass?: string
}

const props = withDefaults(defineProps<BaseTextareaProps>(), {
  size: 'md',
  rows: 4,
  disabled: false,
  loading: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const inputId = computed(() => props.id ?? useId())

const sizeClasses: Record<ComponentSize, string> = {
  xs: 'text-xs px-2 py-1.5',
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-3.5 py-3',
  lg: 'text-base px-4 py-3',
  xl: 'text-lg px-4 py-3.5',
}

const textareaAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const rootClasses = computed(() => cn('space-y-1.5', props.rootClass))

const labelClasses = computed(() =>
  cn('block text-sm font-semibold text-ibbil-green', props.labelClass),
)

const textareaClasses = computed(() =>
  cn(
    'w-full appearance-none rounded-xl border bg-[#fafbfa] text-foreground outline-none transition-all',
    'placeholder:text-foreground-muted focus:border-ibbil-green focus:bg-white focus:outline-none focus:ring-2 focus:ring-ibbil-green/15 focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
    props.error ? 'border-danger' : 'border-border',
    sizeClasses[props.size],
    props.textareaClass,
    attrs.class as string | undefined,
  ),
)
</script>

<template>
  <div :class="rootClasses">
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>
    <textarea
      :id="inputId"
      v-bind="textareaAttrs"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled || loading"
      :required="required"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
      :class="textareaClasses"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    <p v-if="hint && !error" :id="`${inputId}-hint`" class="text-xs text-foreground-muted">
      {{ hint }}
    </p>
    <p v-if="error" :id="`${inputId}-error`" class="text-xs text-danger" role="alert">
      {{ error }}
    </p>
  </div>
</template>
