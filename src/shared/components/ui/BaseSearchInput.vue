<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { APP_CONFIG } from '@shared/constants/app-config'
import { debounce } from '@shared/utils/debounce'
import { cn } from '@shared/utils/cn'

export type BaseSearchInputProps = {
  modelValue?: string
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  size?: ComponentSize
  disabled?: boolean
  loading?: boolean
  clearable?: boolean
  required?: boolean
  id?: string
  /** Accessible name when no visible label is provided */
  ariaLabel?: string
  /** Delay before emitting search / model updates. `0` disables debounce. */
  debounceMs?: number
  rootClass?: string
  labelClass?: string
  wrapperClass?: string
  inputClass?: string
}

const props = withDefaults(defineProps<BaseSearchInputProps>(), {
  modelValue: '',
  size: 'md',
  disabled: false,
  loading: false,
  clearable: true,
  required: false,
  debounceMs: APP_CONFIG.DEBOUNCE_MS,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  /** Debounced search commit with an AbortSignal for the latest request */
  search: [query: string, signal: AbortSignal]
  clear: []
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const { t } = useI18n()
const inputId = computed(() => props.id ?? useId())
const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const localValue = ref(String(props.modelValue ?? ''))

let abortController: AbortController | null = null

const hasValue = computed(() => localValue.value.length > 0)
const showClear = computed(
  () => props.clearable && hasValue.value && !props.loading && !props.disabled,
)

const sizeConfig: Record<
  ComponentSize,
  { shell: string; input: string; icon: string; iconBox: string; clear: string }
> = {
  xs: {
    shell: 'min-h-7',
    input: 'py-1 pe-1.5 text-xs',
    icon: 'size-3.5',
    iconBox: 'ps-2 pe-1.5',
    clear: 'size-5',
  },
  sm: {
    shell: 'min-h-9',
    input: 'py-2 pe-2 text-sm',
    icon: 'size-4',
    iconBox: 'ps-2.5 pe-2',
    clear: 'size-6',
  },
  md: {
    shell: 'min-h-11',
    input: 'py-2.5 pe-2.5 text-sm',
    icon: 'size-4',
    iconBox: 'ps-3 pe-2',
    clear: 'size-7',
  },
  lg: {
    shell: 'min-h-12',
    input: 'py-3 pe-3 text-base',
    icon: 'size-[1.125rem]',
    iconBox: 'ps-3.5 pe-2.5',
    clear: 'size-8',
  },
  xl: {
    shell: 'min-h-14',
    input: 'py-3.5 pe-3.5 text-lg',
    icon: 'size-5',
    iconBox: 'ps-4 pe-3',
    clear: 'size-9',
  },
}

const config = computed(() => sizeConfig[props.size])

const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const rootClasses = computed(() => cn('space-y-1.5', props.rootClass))

const labelClasses = computed(() =>
  cn('block text-sm font-semibold text-ibbil-green', props.labelClass),
)

const shellClasses = computed(() =>
  cn(
    'group/search relative flex w-full items-center overflow-hidden rounded-xl border bg-[#fafbfa]',
    'transition-[border-color,box-shadow,background-color,transform] duration-200 ease-out',
    config.value.shell,
    isFocused.value && !props.error && 'border-ibbil-green bg-white ring-2 ring-ibbil-green/15',
    !isFocused.value && !props.error && 'border-border hover:border-ibbil-green/40',
    props.error && 'border-danger ring-2 ring-danger/10',
    props.disabled && 'pointer-events-none opacity-50',
    isFocused.value && !props.disabled && 'scale-[1.005]',
    props.wrapperClass,
  ),
)

const iconBoxClasses = computed(() =>
  cn(
    'pointer-events-none flex shrink-0 items-center justify-center self-stretch',
    config.value.iconBox,
  ),
)

const iconClasses = computed(() =>
  cn(
    'shrink-0 text-foreground-muted transition-[color,transform] duration-200 ease-out',
    config.value.icon,
    isFocused.value && 'scale-110 text-ibbil-green',
    hasValue.value && !isFocused.value && 'text-ibbil-green/70',
  ),
)

const inputClasses = computed(() =>
  cn(
    'min-w-0 flex-1 appearance-none border-0 bg-transparent text-foreground shadow-none outline-none',
    'placeholder:text-foreground-muted disabled:cursor-not-allowed',
    'transition-colors duration-200',
    config.value.input,
    props.inputClass,
    attrs.class as string | undefined,
  ),
)

const clearButtonClasses = computed(() =>
  cn(
    'inline-flex shrink-0 items-center justify-center rounded-lg text-foreground-muted',
    'transition-[color,background-color,transform] duration-150 ease-out',
    'hover:bg-ibbil-green/10 hover:text-ibbil-green active:scale-95',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green/40',
    'me-1.5',
    config.value.clear,
  ),
)

function abortPending() {
  abortController?.abort()
  abortController = null
}

function commitSearch(value: string) {
  abortPending()
  abortController = new AbortController()
  emit('update:modelValue', value)
  emit('search', value, abortController.signal)
}

const scheduleSearch = debounce((value: string) => {
  commitSearch(value)
}, props.debounceMs)

watch(
  () => props.modelValue,
  (value) => {
    const next = String(value ?? '')
    if (next !== localValue.value) {
      localValue.value = next
    }
  },
)

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  localValue.value = value

  if (props.debounceMs <= 0) {
    commitSearch(value)
    return
  }

  scheduleSearch(value)
}

function onFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function onBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}

function clear() {
  scheduleSearch.cancel()
  localValue.value = ''
  commitSearch('')
  emit('clear')
  nextTick(() => inputRef.value?.focus())
}

onBeforeUnmount(() => {
  scheduleSearch.cancel()
  abortPending()
})

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  inputEl: inputRef,
  abort: abortPending,
})
</script>

<template>
  <div :class="rootClasses">
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <div :class="shellClasses">
      <span :class="iconBoxClasses" aria-hidden="true">
        <Icon name="lucide:search" :class="iconClasses" />
      </span>

      <input
        :id="inputId"
        ref="inputRef"
        v-bind="inputAttrs"
        type="search"
        role="searchbox"
        :value="localValue"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        :required="required"
        :aria-label="ariaLabel ?? (label ? undefined : placeholder ?? t('common.search'))"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        :class="inputClasses"
        autocomplete="off"
        enterkeyhint="search"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      >

      <div class="flex shrink-0 items-center gap-0.5 pe-0.5">
        <div v-if="loading" class="flex items-center justify-center pe-2" :class="config.clear">
          <BaseLoader size="sm" />
        </div>

        <Transition name="search-clear">
          <button
            v-if="showClear"
            type="button"
            :class="clearButtonClasses"
            :aria-label="t('common.clearSearch')"
            @mousedown.prevent
            @click="clear"
          >
            <Icon name="lucide:x" class="size-3.5" aria-hidden="true" />
          </button>
        </Transition>
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

<style scoped>
input[type='search']::-webkit-search-cancel-button,
input[type='search']::-webkit-search-decoration {
  appearance: none;
}

.search-clear-enter-active,
.search-clear-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.search-clear-enter-from,
.search-clear-leave-to {
  opacity: 0;
  transform: scale(0.75);
}

@media (prefers-reduced-motion: reduce) {
  .group\/search,
  .search-clear-enter-active,
  .search-clear-leave-active {
    transition: none !important;
  }

  .group\/search {
    transform: none !important;
  }
}
</style>
