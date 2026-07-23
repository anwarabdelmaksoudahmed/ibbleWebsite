<script setup lang="ts">
import type { NewsTickerItem } from '@shared/types/news-ticker.types'
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()

const NEWS_KEYS = [
  { key: 'insurance', href: ROUTES.INSURANCE, icon: 'lucide:heart-handshake' },
  { key: 'transport', href: ROUTES.TRANSPORT, icon: 'lucide:truck' },
  { key: 'stores', href: ROUTES.STORES.ROOT, icon: 'lucide:store' },
  { key: 'veterinary', href: '/services/veterinary', icon: 'lucide:stethoscope' },
  { key: 'permits', href: '/services/permits', icon: 'lucide:shield-check' },
  { key: 'join', href: ROUTES.JOIN, icon: 'lucide:user-plus' },
  { key: 'vision', icon: 'lucide:sparkles' },
] as const

const items = computed<NewsTickerItem[]>(() =>
  NEWS_KEYS.map((entry) => ({
    id: entry.key,
    label: t(`site.about.newsTicker.items.${entry.key}`),
    href: 'href' in entry ? entry.href : undefined,
    icon: entry.icon,
  })),
)
</script>

<template>
  <section
    class="relative overflow-hidden bg-ibbil-green text-white"
    :aria-label="t('site.about.newsTicker.ariaLabel')"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(212,160,68,0.12),transparent_55%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-ibbil-gold/35 to-transparent"
      aria-hidden="true"
    />

    <div class="relative mx-auto flex max-w-7xl items-stretch gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5 lg:px-6">
      <div
        class="flex shrink-0 items-center gap-2 border-e border-white/15 pe-3 sm:pe-4"
        aria-hidden="true"
      >
        <!-- <span class="relative flex size-2">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-ibbil-gold/60 opacity-60" />
          <span class="relative inline-flex size-2 rounded-full bg-ibbil-gold" />
        </span> -->
        <!-- <span class="whitespace-nowrap text-xs font-bold tracking-wide text-ibbil-gold uppercase sm:text-sm">
          {{ t('site.about.newsTicker.label') }}
        </span> -->
      </div>

      <BaseNewsTicker
        :items="items"
        :duration="48"
      />
    </div>
  </section>
</template>
