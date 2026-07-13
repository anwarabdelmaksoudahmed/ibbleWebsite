<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import { dayjs } from '@shared/utils/formatters'

const { locale, locales } = useI18n()
const { isSwitchingLocale } = useLocaleSwitch()

const htmlDir = computed(() => {
  return locales.value.find((item: LocaleObject) => item.code === locale.value)?.dir ?? 'ltr'
})

watch(
  locale,
  (newLocale) => {
    dayjs.locale(newLocale)
  },
  { immediate: true },
)

useHead({
  htmlAttrs: {
    lang: locale,
    dir: htmlDir,
  },
})
</script>

<template>
  <div
    class="locale-shell min-h-screen"
    :class="{ 'is-locale-switching': isSwitchingLocale }"
    :dir="htmlDir"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <BaseToastContainer />
    <BaseConfirmDialog />
    <PaymentModalHost />
    <LocaleProgressBar />
  </div>
</template>
