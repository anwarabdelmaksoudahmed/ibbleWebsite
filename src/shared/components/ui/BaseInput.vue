<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
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
  /** Classes for the outer field wrapper */
  rootClass?: string
  /** Classes for the label */
  labelClass?: string
  /** Classes for the input / control wrapper (border shell when affixes are used) */
  wrapperClass?: string
  /** Classes merged onto the native input */
  inputClass?: string
}

const props = withDefaults(defineProps<BaseInputProps>(), {
  type: 'text',
  size: 'md',
  disabled: false,
  loading: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const slots = useSlots()
const inputId = computed(() => props.id ?? useId())

const sizeClasses: Record<ComponentSize, { text: string; py: string; px: string }> = {
  xs: { text: 'text-xs', py: 'py-1.5', px: 'px-2' },
  sm: { text: 'text-sm', py: 'py-2', px: 'px-3' },
  md: { text: 'text-sm', py: 'py-3', px: 'px-3.5' },
  lg: { text: 'text-base', py: 'py-3', px: 'px-4' },
  xl: { text: 'text-lg', py: 'py-3.5', px: 'px-4' },
}

const sizeStartPadding: Record<ComponentSize, string> = {
  xs: 'ps-2',
  sm: 'ps-3',
  md: 'ps-3.5',
  lg: 'ps-4',
  xl: 'ps-4',
}

const sizeEndPadding: Record<ComponentSize, string> = {
  xs: 'pe-2',
  sm: 'pe-3',
  md: 'pe-3.5',
  lg: 'pe-4',
  xl: 'pe-4',
}

const hasPrefix = computed(() => !!slots.prefix)
const hasSuffix = computed(() => !!slots.suffix)
const hasAffix = computed(() => hasPrefix.value || hasSuffix.value || props.loading)
const hasEndAffix = computed(() => hasSuffix.value || props.loading)

const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const rootClasses = computed(() => cn('space-y-1.5', props.rootClass))

const labelClasses = computed(() =>
  cn('block text-sm font-semibold text-ibbil-green', props.labelClass),
)

const wrapperClasses = computed(() =>
  cn(
    hasAffix.value &&
      'relative flex items-center rounded-xl border bg-[#fafbfa] transition-all focus-within:border-ibbil-green focus-within:bg-white focus-within:ring-2 focus-within:ring-ibbil-green/15',
    !hasAffix.value && 'relative',
    props.wrapperClass,
    hasAffix.value && (props.error ? 'border-danger' : !props.wrapperClass && 'border-border'),
  ),
)

const inputClasses = computed(() => {
  const size = sizeClasses[props.size]

  return cn(
    hasAffix.value
      ? 'min-w-0 flex-1 appearance-none border-0 bg-transparent text-foreground shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:text-foreground-muted disabled:cursor-not-allowed disabled:opacity-50'
      : 'w-full appearance-none rounded-xl border bg-[#fafbfa] text-foreground outline-none transition-all placeholder:text-foreground-muted focus:border-ibbil-green focus:bg-white focus:outline-none focus:ring-2 focus:ring-ibbil-green/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    !hasAffix.value && (props.error ? 'border-danger' : 'border-border'),
    size.text,
    size.py,
    hasAffix.value
      ? cn(
          hasPrefix.value ? 'ps-2' : sizeStartPadding[props.size],
          hasEndAffix.value ? 'pe-1' : sizeEndPadding[props.size],
        )
      : size.px,
    props.inputClass,
    attrs.class as string | undefined,
  )
})

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div :class="rootClasses">
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <div :class="wrapperClasses">
      <div
        v-if="hasPrefix"
        class="flex shrink-0 items-center ps-3 text-foreground-muted"
      >
        <slot name="prefix" />
      </div>

      <input
        :id="inputId"
        v-bind="inputAttrs"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        :class="inputClasses"
        @input="onInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      >

      <div
        v-if="hasSuffix || loading"
        class="flex shrink-0 items-center gap-1.5 pe-2.5 text-foreground-muted"
      >
        <BaseLoader v-if="loading" size="sm" />
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="hint && !error" :id="`${inputId}-hint`" class="text-xs text-foreground-muted">
      {{ hint }}
    </p>
    <p v-if="error" :id="`${inputId}-error`" class="text-xs text-danger" role="alert">
      {{ error }}
    </p>

    <slot name="hint" :error="error" :hint="hint" />
  </div>
</template>
