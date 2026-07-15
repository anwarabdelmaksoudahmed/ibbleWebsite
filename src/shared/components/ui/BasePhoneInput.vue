<script setup lang="ts">
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  findCountryByApiCode,
  type CountryCodeOption,
} from '@shared/constants/country-codes'
import { useFloatingListbox } from '@shared/composables/useFloatingListbox'
import type { ComponentSize } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BasePhoneInputProps = {
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  countryError?: string
  size?: ComponentSize
  disabled?: boolean
  loading?: boolean
  required?: boolean
  id?: string
  maxLength?: number
  countries?: CountryCodeOption[]
  countryAriaLabel?: string
  rootClass?: string
  labelClass?: string
  wrapperClass?: string
  inputClass?: string
}

const props = withDefaults(defineProps<BasePhoneInputProps>(), {
  size: 'md',
  disabled: false,
  loading: false,
  required: false,
  maxLength: 15,
  countries: () => COUNTRY_CODES,
})

const emit = defineEmits<{
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  'country-change': [country: CountryCodeOption]
}>()

defineOptions({ inheritAttrs: false })

const phone = defineModel<string>('phone', { default: '' })
const countryCode = defineModel<string>('countryCode', {
  default: DEFAULT_COUNTRY_CODE.apiCode,
})

const { t } = useI18n()
const attrs = useAttrs()
const inputId = computed(() => props.id ?? useId())
const countrySelectId = computed(() => `${inputId.value}-country`)

const isPhoneFocused = ref(false)
const searchQuery = ref('')

const PANEL_WIDTH_PX = 320

const countryList = computed(() =>
  props.countries.length ? props.countries : COUNTRY_CODES,
)

const filteredCountries = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return countryList.value

  const normalizedQuery = query.replace(/\s+/g, '')

  return countryList.value.filter((country) => {
    const label = country.label.toLowerCase()
    const dial = country.dialCode.toLowerCase().replace(/\s+/g, '')
    const api = country.apiCode.toLowerCase()
    const dialDigits = dial.replace(/\D/g, '')
    const queryDigits = normalizedQuery.replace(/\D/g, '')

    return (
      label.includes(query) ||
      dial.includes(normalizedQuery) ||
      api.includes(normalizedQuery) ||
      (queryDigits.length > 0 && dialDigits.includes(queryDigits))
    )
  })
})

const selectedCountry = computed(
  (): CountryCodeOption =>
    countryList.value.find((country) => country.apiCode === countryCode.value) ??
    findCountryByApiCode(countryCode.value),
)

const resolvedPlaceholder = computed(
  () => props.placeholder || selectedCountry.value.example,
)

const sizePadding: Record<ComponentSize, string> = {
  xs: 'py-2',
  sm: 'py-2.5',
  md: 'py-3',
  lg: 'py-3.5',
  xl: 'py-4',
}

const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const hasError = computed(() => Boolean(props.error || props.countryError))
const isDisabled = computed(() => props.disabled || props.loading)

const rootClasses = computed(() => cn('space-y-1.5', props.rootClass))

const labelClasses = computed(() =>
  cn('block text-sm font-semibold text-ibbil-green', props.labelClass),
)

const shellBase =
  'rounded-xl border bg-[#fafbfa] transition-all duration-200 outline-none'

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
} = useFloatingListbox<CountryCodeOption>({
  isDisabled,
  items: filteredCountries,
  getSelectedIndex: () =>
    filteredCountries.value.findIndex(
      (country) => country.apiCode === countryCode.value,
    ),
  getOptionId: (country) => `${inputId.value}-option-${country.apiCode}`,
  onSelect: (country) => {
    countryCode.value = country.apiCode
    emit('country-change', country)
    nextTick(() => {
      document.getElementById(inputId.value)?.focus()
    })
  },
  panelWidth: PANEL_WIDTH_PX,
  focusSearchOnOpen: true,
  onClose: () => {
    searchQuery.value = ''
  },
})

const countryShellClasses = computed(() =>
  cn(
    shellBase,
    'relative shrink-0 overflow-visible',
    isOpen.value && !hasError.value && 'border-ibbil-green bg-white ring-2 ring-ibbil-green/15',
    !isOpen.value && !props.countryError && 'border-border hover:border-ibbil-green/40',
    props.countryError && 'border-danger ring-2 ring-danger/10',
    isDisabled.value && 'pointer-events-none opacity-50',
  ),
)

const phoneShellClasses = computed(() =>
  cn(
    shellBase,
    'relative flex min-w-0 flex-1 items-center overflow-hidden',
    isPhoneFocused.value && !props.error && 'border-ibbil-green bg-white ring-2 ring-ibbil-green/15',
    !isPhoneFocused.value && !props.error && 'border-border hover:border-ibbil-green/40',
    props.error && 'border-danger ring-2 ring-danger/10',
    isDisabled.value && 'pointer-events-none opacity-50',
    props.wrapperClass,
  ),
)

function sanitizePhone(value: string | number) {
  return String(value).replace(/\D/g, '').slice(0, props.maxLength)
}

function onPhoneInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  const cleaned = sanitizePhone(raw)
  phone.value = cleaned
  if (raw !== cleaned) {
    ;(event.target as HTMLInputElement).value = cleaned
  }
}

function onPhoneKeydown(event: KeyboardEvent) {
  if (event.code === 'Space' && !(event.target as HTMLInputElement).value) {
    event.preventDefault()
  }
  if (event.key.toLowerCase() === 'e') {
    event.preventDefault()
  }
}

function onPhoneFocus(event: FocusEvent) {
  isPhoneFocused.value = true
  emit('focus', event)
}

function onPhoneBlur(event: FocusEvent) {
  isPhoneFocused.value = false
  emit('blur', event)
}

function getCountryOptionId(country: CountryCodeOption) {
  return `${inputId.value}-option-${country.apiCode}`
}

function isCountrySelected(country: CountryCodeOption) {
  return country.apiCode === countryCode.value
}

const resolvedCountryAriaLabel = computed(
  () => props.countryAriaLabel || t('auth.countryCode'),
)
</script>

<template>
  <div ref="rootRef" :class="rootClasses">
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <div class="flex items-stretch gap-2.5" dir="ltr">
      <div :class="countryShellClasses">
        <button
          :id="countrySelectId"
          ref="triggerRef"
          type="button"
          role="combobox"
          class="flex h-full w-full items-center gap-2 px-3 text-sm font-semibold text-foreground"
          :class="sizePadding[size]"
          :disabled="isDisabled"
          :aria-label="resolvedCountryAriaLabel"
          :aria-expanded="isOpen"
          aria-haspopup="listbox"
          :aria-controls="isOpen ? `${inputId}-listbox` : undefined"
          :aria-activedescendant="activeDescendantId"
          aria-autocomplete="list"
          :aria-invalid="!!countryError"
          @click="toggleDropdown"
          @keydown="onTriggerKeydown"
        >
          <span class="text-lg leading-none" aria-hidden="true">{{ selectedCountry.flag }}</span>
          <span class="tabular-nums text-ibbil-green">{{ selectedCountry.dialCode }}</span>
          <Icon
            name="lucide:chevron-down"
            class="ms-0.5 h-3.5 w-3.5 shrink-0 text-foreground-muted transition-transform duration-200"
            :class="isOpen && 'rotate-180 text-ibbil-green'"
            aria-hidden="true"
          />
        </button>

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
              <div class="border-b border-border p-2">
                <div class="relative">
                  <Icon
                    name="lucide:search"
                    class="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted"
                    aria-hidden="true"
                  />
                  <input
                    :id="`${inputId}-country-search`"
                    ref="searchRef"
                    v-model="searchQuery"
                    type="search"
                    autocomplete="off"
                    role="searchbox"
                    :placeholder="t('common.search')"
                    :aria-label="t('common.search')"
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
                :aria-label="resolvedCountryAriaLabel"
                class="phone-country-scroll max-h-56 overflow-auto p-1"
              >
                <li
                  v-if="!filteredCountries.length"
                  class="px-3 py-4 text-center text-sm text-foreground-muted"
                  role="presentation"
                >
                  {{ t('common.noResults') }}
                </li>

                <li
                  v-for="(country, index) in filteredCountries"
                  :id="getCountryOptionId(country)"
                  :key="country.apiCode"
                  :data-option-index="index"
                  role="option"
                  :aria-selected="isCountrySelected(country)"
                  class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors"
                  :class="[
                    isCountrySelected(country)
                      ? 'bg-ibbil-green/10 font-semibold text-ibbil-green'
                      : 'text-foreground hover:bg-[#f3f5f3]',
                    index === highlightedIndex && !isCountrySelected(country) && 'bg-[#f3f5f3]',
                  ]"
                  @mousedown.prevent="selectItem(country, index)"
                  @mouseenter="setHighlightedIndex(index)"
                >
                  <span class="text-base leading-none" aria-hidden="true">{{ country.flag }}</span>
                  <span class="min-w-0 flex-1 truncate">{{ country.label }}</span>
                  <span class="shrink-0 tabular-nums font-semibold text-ibbil-green">
                    {{ country.dialCode }}
                  </span>
                  <Icon
                    v-if="isCountrySelected(country)"
                    name="lucide:check"
                    class="h-3.5 w-3.5 shrink-0 text-ibbil-green"
                    aria-hidden="true"
                  />
                </li>
              </ul>
            </div>
          </Transition>
        </Teleport>
      </div>

      <div :class="phoneShellClasses">
        <input
          :id="inputId"
          v-bind="inputAttrs"
          type="tel"
          inputmode="numeric"
          autocomplete="tel-national"
          :value="phone"
          :placeholder="resolvedPlaceholder"
          :disabled="isDisabled"
          :required="required"
          :maxlength="maxLength"
          :aria-invalid="!!error"
          :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
          :class="cn(
            'min-w-0 flex-1 appearance-none border-0 bg-transparent px-3.5 text-sm text-foreground shadow-none',
            'outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none',
            'placeholder:text-foreground-muted disabled:cursor-not-allowed',
            'tabular-nums tracking-wide',
            sizePadding[size],
            props.inputClass,
            attrs.class as string | undefined,
          )"
          @input="onPhoneInput"
          @keydown="onPhoneKeydown"
          @blur="onPhoneBlur"
          @focus="onPhoneFocus"
        >

        <div v-if="loading" class="pe-3">
          <BaseLoader size="sm" />
        </div>
      </div>
    </div>

    <p v-if="error" :id="`${inputId}-error`" class="text-xs text-danger" role="alert">
      {{ error }}
    </p>
    <p v-else-if="countryError" class="text-xs text-danger" role="alert">
      {{ countryError }}
    </p>
    <p
      v-else-if="hint"
      :id="`${inputId}-hint`"
      class="text-xs text-foreground-muted"
    >
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
.phone-country-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(45, 83, 61, 0.25) transparent;
}

.phone-country-scroll::-webkit-scrollbar {
  width: 6px;
}

.phone-country-scroll::-webkit-scrollbar-thumb {
  background: rgba(45, 83, 61, 0.25);
  border-radius: 999px;
}

input[type='search']::-webkit-search-cancel-button {
  appearance: none;
}
</style>
