<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { useFloatingListbox } from '@shared/composables/useFloatingListbox'
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
  searchable?: boolean
  searchPlaceholder?: string
  id?: string
  rootClass?: string
  labelClass?: string
  wrapperClass?: string
  triggerClass?: string
}

const props = withDefaults(defineProps<BaseSelectProps>(), {
  size: 'md',
  disabled: false,
  loading: false,
  required: false,
  searchable: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()

const slots = useSlots()
const { t } = useI18n()
const inputId = computed(() => props.id ?? useId())

const searchQuery = ref('')

const hasPrefix = computed(() => !!slots.prefix)

const sizeClasses: Record<ComponentSize, string> = {
  xs: 'text-xs py-1.5',
  sm: 'text-sm py-2',
  md: 'text-sm py-2.5',
  lg: 'text-base py-3',
  xl: 'text-lg py-3.5',
}

const isDisabled = computed(() => props.disabled || props.loading)

const showSearch = computed(
  () => props.searchable && props.options.length > 0,
)

const selectedOption = computed(() =>
  props.options.find((option) => String(option.value) === String(props.modelValue)),
)

const displayLabel = computed(
  () => selectedOption.value?.label ?? props.placeholder ?? '',
)

const hasValue = computed(() => selectedOption.value !== undefined)

const filteredOptions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query || !showSearch.value) return props.options

  return props.options.filter((option) =>
    option.label.toLowerCase().includes(query),
  )
})

const {
  isOpen,
  highlightedIndex,
  activeDescendantId,
  rootRef,
  triggerRef,
  searchRef,
  listRef,
  panelRef,
  panelStyle,
  toggleDropdown,
  onListKeydown,
  onTriggerKeydown,
  setHighlightedIndex,
  selectItem,
} = useFloatingListbox<SelectOption>({
  isDisabled,
  items: filteredOptions,
  isItemDisabled: (option) => !!option.disabled,
  getSelectedIndex: () =>
    filteredOptions.value.findIndex(
      (option) => String(option.value) === String(props.modelValue),
    ),
  getOptionId: (option) => `${inputId.value}-option-${option.value}`,
  onSelect: (option) => emit('update:modelValue', option.value),
  focusSearchOnOpen: showSearch,
  onClose: () => {
    searchQuery.value = ''
  },
})

const shellClasses = computed(() =>
  cn(
    'relative flex items-center overflow-visible rounded-xl border bg-[#fafbfa] transition-all duration-200',
    isOpen.value && !props.error && 'border-ibbil-green bg-white ring-2 ring-ibbil-green/15',
    !isOpen.value && !props.error && 'border-border hover:border-ibbil-green/40',
    props.error && 'border-danger ring-2 ring-danger/10',
    isDisabled.value && 'pointer-events-none opacity-50',
    props.wrapperClass,
  ),
)

const triggerClasses = computed(() =>
  cn(
    'flex min-w-0 flex-1 items-center gap-2 border-0 bg-transparent text-start outline-none',
    'focus-visible:outline-none disabled:cursor-not-allowed',
    hasPrefix.value ? 'ps-2 pe-9' : 'px-3.5 pe-9',
    sizeClasses[props.size],
    !hasValue.value && 'text-foreground-muted',
    props.triggerClass,
  ),
)

const resolvedSearchPlaceholder = computed(
  () => props.searchPlaceholder ?? t('common.search'),
)

function getOptionId(option: SelectOption) {
  return `${inputId.value}-option-${option.value}`
}

function isSelected(option: SelectOption) {
  return String(option.value) === String(props.modelValue)
}

function onOptionMouseEnter(option: SelectOption, index: number) {
  setHighlightedIndex(index)
}
</script>

<template>
  <div ref="rootRef" :class="cn('space-y-1.5', rootClass)">
    <label
      v-if="label"
      :for="inputId"
      :class="cn('block text-sm font-semibold text-ibbil-green', labelClass)"
    >
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <div :class="shellClasses">
      <button
        :id="inputId"
        ref="triggerRef"
        type="button"
        role="combobox"
        :class="triggerClasses"
        :disabled="isDisabled"
        :aria-label="label || displayLabel"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        :aria-controls="isOpen ? `${inputId}-listbox` : undefined"
        :aria-activedescendant="activeDescendantId"
        :aria-autocomplete="showSearch ? 'list' : 'none'"
        :aria-invalid="!!error"
        :aria-required="required"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        @click="toggleDropdown"
        @keydown="onTriggerKeydown"
      >
        <span
          v-if="hasPrefix"
          class="flex shrink-0 items-center text-ibbil-green/70"
        >
          <slot name="prefix" />
        </span>

        <span class="min-w-0 flex-1 truncate">
          {{ displayLabel }}
        </span>
      </button>

      <div
        v-if="loading"
        class="pointer-events-none absolute top-1/2 -translate-y-1/2 end-8"
      >
        <BaseLoader size="sm" />
      </div>

      <Icon
        name="lucide:chevron-down"
        class="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-foreground-muted transition-transform duration-200 end-3"
        :class="isOpen && 'rotate-180 text-ibbil-green'"
        aria-hidden="true"
      />

      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-if="isOpen"
            ref="panelRef"
            :style="panelStyle"
            class="overflow-hidden rounded-xl border border-border bg-white shadow-[0_16px_40px_-16px_rgba(45,83,61,0.45)]"
            role="presentation"
            @keydown="onListKeydown"
          >
            <div v-if="showSearch" class="border-b border-border p-2">
              <div class="relative">
                <Icon
                  name="lucide:search"
                  class="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-foreground-muted"
                  aria-hidden="true"
                />
                <input
                  :id="`${inputId}-search`"
                  ref="searchRef"
                  v-model="searchQuery"
                  type="search"
                  autocomplete="off"
                  role="searchbox"
                  :placeholder="resolvedSearchPlaceholder"
                  :aria-label="resolvedSearchPlaceholder"
                  :aria-controls="`${inputId}-listbox`"
                  class="w-full rounded-lg border border-border bg-[#fafbfa] py-2 pe-2.5 ps-8 text-sm outline-none transition-colors placeholder:text-foreground-muted focus:border-ibbil-green focus:bg-white focus:ring-2 focus:ring-ibbil-green/15"
                  @keydown.stop="onListKeydown"
                >
              </div>
            </div>

            <ul
              :id="`${inputId}-listbox`"
              ref="listRef"
              role="listbox"
              :aria-label="label || displayLabel"
              class="base-select-scroll max-h-60 overflow-auto p-1"
            >
              <li
                v-if="!filteredOptions.length"
                class="px-3 py-4 text-center text-sm text-foreground-muted"
                role="presentation"
              >
                <slot name="empty">
                  {{ t('common.noResults') }}
                </slot>
              </li>

              <li
                v-for="(option, index) in filteredOptions"
                :id="getOptionId(option)"
                :key="`${option.value}-${index}`"
                :data-option-index="index"
                role="option"
                :aria-selected="isSelected(option)"
                :aria-disabled="option.disabled || undefined"
                class="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors"
                :class="[
                  isSelected(option)
                    ? 'bg-ibbil-green/10 font-semibold text-ibbil-green'
                    : 'text-foreground hover:bg-[#f3f5f3]',
                  option.disabled && 'cursor-not-allowed opacity-50',
                  index === highlightedIndex && !isSelected(option) && !option.disabled && 'bg-[#f3f5f3]',
                ]"
                @mousedown.prevent="selectItem(option, index)"
                @mouseenter="onOptionMouseEnter(option, index)"
              >
                <slot
                  name="option"
                  :option="option"
                  :selected="isSelected(option)"
                  :highlighted="index === highlightedIndex"
                  :index="index"
                >
                  <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
                  <Icon
                    v-if="isSelected(option)"
                    name="lucide:check"
                    class="size-3.5 shrink-0 text-ibbil-green"
                    aria-hidden="true"
                  />
                </slot>
              </li>
            </ul>
          </div>
        </Transition>
      </Teleport>
    </div>

    <p v-if="hint && !error" :id="`${inputId}-hint`" class="text-xs text-foreground-muted">
      {{ hint }}
    </p>
    <p v-if="error" :id="`${inputId}-error`" class="text-xs text-danger" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.base-select-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(45, 83, 61, 0.25) transparent;
}

.base-select-scroll::-webkit-scrollbar {
  width: 6px;
}

.base-select-scroll::-webkit-scrollbar-thumb {
  background: rgba(45, 83, 61, 0.25);
  border-radius: 999px;
}

input[type='search']::-webkit-search-cancel-button {
  appearance: none;
}
</style>
