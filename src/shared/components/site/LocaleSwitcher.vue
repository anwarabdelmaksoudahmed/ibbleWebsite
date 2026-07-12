<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import { onClickOutside } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    variant?: 'header' | 'auth' | 'mobile'
  }>(),
  {
    variant: 'header',
  },
)

const { t } = useI18n()
const {
  locale,
  locales,
  currentLocaleMeta,
  isSwitchingLocale,
  prefetchLocale,
  switchTo,
} = useLocaleSwitch()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

onClickOutside(rootRef, () => {
  open.value = false
})

const options = computed(() => {
  return (locales.value as LocaleObject[]).map((item) => ({
    code: item.code as 'ar' | 'en',
    name: item.name ?? item.code,
    native: item.code === 'ar' ? 'العربية' : 'English',
    region: item.code === 'ar' ? 'المملكة العربية السعودية' : 'United States',
    flag: item.code === 'ar' ? '🇸🇦' : '🇬🇧',
  }))
})

const triggerLabel = computed(() => {
  return currentLocaleMeta.value?.name ?? locale.value
})

const triggerFlag = computed(() => (locale.value === 'ar' ? '🇸🇦' : '🇬🇧'))

watch(isSwitchingLocale, (busy) => {
  if (busy) open.value = false
})

function toggle() {
  if (isSwitchingLocale.value) return
  open.value = !open.value
}

async function selectLocale(code: 'ar' | 'en') {
  if (code === locale.value) {
    open.value = false
    return
  }
  open.value = false
  await switchTo(code)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}
</script>

<template>
  <div
    ref="rootRef"
    class="locale-menu"
    :class="[
      `locale-menu--${props.variant}`,
      { 'is-open': open, 'is-busy': isSwitchingLocale },
    ]"
    @keydown="onKeydown"
  >
    <button
      type="button"
      class="locale-menu__trigger"
      :aria-expanded="open"
      :aria-haspopup="true"
      :aria-busy="isSwitchingLocale"
      :aria-label="t('site.locale.chooser')"
      :disabled="isSwitchingLocale"
      @click="toggle"
    >
      <Icon
        v-if="isSwitchingLocale"
        name="lucide:loader-2"
        class="locale-menu__spinner"
      />
      <span v-else class="locale-menu__flag" aria-hidden="true">{{ triggerFlag }}</span>
      <span class="locale-menu__label">{{ triggerLabel }}</span>
      <Icon name="lucide:chevron-down" class="locale-menu__chevron" />
    </button>

    <Transition name="locale-menu-panel">
      <div
        v-if="open"
        class="locale-menu__panel"
        role="listbox"
        :aria-label="t('site.locale.chooser')"
      >
        <p class="locale-menu__heading">{{ t('site.locale.chooser') }}</p>
        <button
          v-for="option in options"
          :key="option.code"
          type="button"
          class="locale-menu__item"
          :class="{ 'is-active': locale === option.code }"
          role="option"
          :aria-selected="locale === option.code"
          @mouseenter="prefetchLocale(option.code)"
          @focus="prefetchLocale(option.code)"
          @click="selectLocale(option.code)"
        >
          <span class="locale-menu__item-flag" aria-hidden="true">{{ option.flag }}</span>
          <span class="locale-menu__item-text">
            <span class="locale-menu__item-name">{{ option.native }}</span>
            <span class="locale-menu__item-region">{{ option.region }}</span>
          </span>
          <Icon
            v-if="locale === option.code"
            name="lucide:check"
            class="locale-menu__check"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>
