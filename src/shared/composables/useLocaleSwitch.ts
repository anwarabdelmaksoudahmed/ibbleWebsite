import type { LocaleObject } from '@nuxtjs/i18n'

export type LocaleCode = 'ar' | 'en'

const isSwitchingLocale = ref(false)
const pendingLocale = ref<LocaleCode | null>(null)

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function prefersReducedMotion(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

async function runViewTransition(update: () => Promise<void>): Promise<void> {
  if (!import.meta.client || prefersReducedMotion()) {
    await update()
    return
  }

  const doc = document as Document & {
    startViewTransition?: (callback: () => Promise<void> | void) => { finished: Promise<void> }
  }

  if (typeof doc.startViewTransition !== 'function') {
    await update()
    return
  }

  try {
    const transition = doc.startViewTransition(update)
    await transition.finished.catch(() => undefined)
  } catch {
    await update()
  }
}

function getLocaleMeta(locales: LocaleObject[], code: string) {
  return locales.find((item) => item.code === code)
}

/**
 * Enterprise-style locale switching (Airbnb / Booking pattern):
 * fast navigation, thin progress cue, no blocking modal, scroll preserved.
 */
export function useLocaleSwitch() {
  const { locale, locales, setLocale, t } = useI18n()
  const switchLocalePath = useSwitchLocalePath()
  const toast = useToast()

  const otherLocale = computed(() => {
    return locales.value.find((item: LocaleObject) => item.code !== locale.value) ?? null
  })

  const currentLocaleMeta = computed(() => {
    return getLocaleMeta(locales.value as LocaleObject[], locale.value) ?? null
  })

  const currentDir = computed(() => currentLocaleMeta.value?.dir ?? 'ltr')

  function prefetchLocale(target: LocaleCode) {
    if (!import.meta.client || target === locale.value) return
    const path = switchLocalePath(target)
    if (typeof path === 'string') {
      void preloadRouteComponents(path).catch(() => undefined)
    }
  }

  async function applyLocale(target: LocaleCode) {
    const scrollY = window.scrollY
    pendingLocale.value = target

    await setLocale(target)
    await navigateTo(switchLocalePath(target), { replace: true })
    await nextTick()

    window.scrollTo(0, scrollY)
  }

  async function switchTo(target: string) {
    if (!import.meta.client) return
    if (isSwitchingLocale.value) return
    if (target === locale.value) return
    if (target !== 'ar' && target !== 'en') return

    isSwitchingLocale.value = true
    pendingLocale.value = target
    document.documentElement.classList.add('locale-switching')

    const reduced = prefersReducedMotion()

    try {
      // Brief settle — enterprise UIs stay snappy, not theatrical
      if (!reduced) await wait(60)

      await runViewTransition(async () => {
        await applyLocale(target)
      })

      if (!reduced) await wait(80)
    } catch {
      toast.error(t('site.locale.switchFailed'))
    } finally {
      document.documentElement.classList.remove('locale-switching')
      pendingLocale.value = null
      isSwitchingLocale.value = false
    }
  }

  async function switchLanguage() {
    if (!otherLocale.value) return
    await switchTo(otherLocale.value.code)
  }

  return {
    locale,
    locales,
    otherLocale,
    currentLocaleMeta,
    currentDir,
    isSwitchingLocale: readonly(isSwitchingLocale),
    pendingLocale: readonly(pendingLocale),
    prefetchLocale,
    switchTo,
    switchLanguage,
  }
}
