<script setup lang="ts">
import { stripLocalePrefix } from '@shared/utils/locale-path'

const props = defineProps<{
  titleKey?: string
}>()

const { t } = useI18n()
const route = useRoute()

const resolvedTitle = computed(() => {
  if (props.titleKey) return t(props.titleKey)

  const map: Record<string, string> = {
    '/about': 'site.nav.about',
    '/contact': 'site.nav.contact',
    '/stores': 'site.nav.stores',
    '/services': 'site.nav.services',
    '/services/insurance': 'site.nav.insurance',
    '/services/transport': 'site.nav.transport',
    '/services/veterinary': 'site.nav.veterinary',
    '/services/permits': 'site.nav.permits',
    '/media': 'site.nav.media',
    '/cart': 'site.nav.cart',
    '/terms': 'site.footer.terms',
    '/privacy': 'site.footer.privacy',
  }

  const path = stripLocalePrefix(route.path)
  return t(map[path] ?? 'site.comingSoon.title')
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16 text-center lg:px-6 lg:py-24">
    <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ibbil-green/10 text-ibbil-green">
      <Icon name="lucide:construction" class="h-8 w-8" />
    </div>
    <h1 class="text-2xl font-bold text-ibbil-green sm:text-3xl">{{ resolvedTitle }}</h1>
    <p class="mx-auto mt-3 max-w-md text-foreground-muted">{{ t('site.comingSoon.description') }}</p>
    <NuxtLinkLocale
      to="/"
      class="mt-8 inline-flex rounded-xl bg-ibbil-green px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ibbil-green-dark"
    >
      {{ t('site.nav.home') }}
    </NuxtLinkLocale>
  </div>
</template>
