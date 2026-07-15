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

const sizeClasses: Record<ComponentSize, string> = {
  xs: 'text-xs px-2 py-1.5',
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-3.5 py-3',
  lg: 'text-base px-4 py-3',
  xl: 'text-lg px-4 py-3.5',
}

const hasPrefix = computed(() => !!slots.prefix)
const hasSuffix = computed(() => !!slots.suffix)
const hasAffix = computed(() => hasPrefix.value || hasSuffix.value)

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
      'relative flex overflow-hidden rounded-xl border bg-[#fafbfa] transition-all focus-within:border-ibbil-green focus-within:bg-white focus-within:ring-2 focus-within:ring-ibbil-green/15',
    !hasAffix.value && 'relative',
    props.wrapperClass,
    hasAffix.value && (props.error ? 'border-danger' : !props.wrapperClass && 'border-border'),
  ),
)

const inputClasses = computed(() =>
  cn(
    hasAffix.value
      ? 'min-w-0 flex-1 appearance-none border-0 bg-transparent text-foreground shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:text-foreground-muted disabled:cursor-not-allowed disabled:opacity-50'
      : 'w-full appearance-none rounded-xl border bg-[#fafbfa] text-foreground outline-none transition-all placeholder:text-foreground-muted focus:border-ibbil-green focus:bg-white focus:outline-none focus:ring-2 focus:ring-ibbil-green/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    !hasAffix.value && (props.error ? 'border-danger' : 'border-border'),
    hasSuffix.value && 'pe-11',
    sizeClasses[props.size],
    props.inputClass,
    attrs.class as string | undefined,
  ),
)

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
      <slot name="prefix" />

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

      <div v-if="loading" class="absolute top-1/2 -translate-y-1/2 end-3">
        <BaseLoader size="sm" />
      </div>

      <div
        v-if="hasSuffix"
        class="absolute top-1/2 -translate-y-1/2 end-2.5 flex items-center"
      >
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
