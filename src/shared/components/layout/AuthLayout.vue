<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()

const features = [
  { icon: 'lucide:shield-check', key: 'secure' },
  { icon: 'lucide:store', key: 'marketplace' },
  { icon: 'lucide:layers', key: 'services' },
] as const
</script>

<template>
  <div class="relative flex min-h-screen overflow-hidden bg-[#f5f6f4]">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,160,68,0.12),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(45,83,61,0.08),_transparent_45%)]" />

    <div class="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row lg:items-stretch">
      <aside class="relative flex flex-col justify-between overflow-hidden bg-ibbil-green px-6 py-8 text-white sm:px-10 lg:w-[46%] lg:px-12 lg:py-12">
        <div
          class="pointer-events-none absolute inset-0 opacity-[0.08]"
          style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        />
        <div class="pointer-events-none absolute -start-16 -top-16 h-56 w-56 rounded-full bg-ibbil-gold/20 blur-3xl" />
        <div class="pointer-events-none absolute -bottom-20 -end-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div class="relative flex items-center justify-between gap-3">
          <SiteLogo light size="md" />
          <div class="flex items-center gap-2">
            <LocaleSwitcher variant="auth" />
            <NuxtLinkLocale
              :to="ROUTES.HOME"
              class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/90 transition-colors hover:bg-white/20"
            >
              <Icon name="lucide:arrow-right" class="h-3.5 w-3.5 rtl:rotate-180" />
              {{ t('site.nav.home') }}
            </NuxtLinkLocale>
          </div>
        </div>

        <div class="relative my-10 space-y-5 lg:my-0">
          <p class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-ibbil-gold">
            <Icon name="lucide:sparkles" class="h-3.5 w-3.5" />
            {{ t('site.home.badge') }}
          </p>
          <h1 class="max-w-md text-2xl font-bold leading-snug sm:text-3xl lg:text-4xl">
            {{ t('auth.hero.title') }}
          </h1>
          <p class="max-w-sm text-sm leading-relaxed text-white/75 sm:text-base">
            {{ t('auth.hero.subtitle') }}
          </p>

          <ul class="hidden space-y-3 pt-2 lg:block">
            <li
              v-for="feature in features"
              :key="feature.key"
              class="flex items-start gap-3 rounded-xl bg-white/5 px-3 py-2.5 backdrop-blur-sm"
            >
              <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ibbil-gold/20 text-ibbil-gold">
                <Icon :name="feature.icon" class="h-4 w-4" />
              </span>
              <span>
                <span class="block text-sm font-semibold">{{ t(`site.home.highlights.${feature.key}.title`) }}</span>
                <span class="block text-xs text-white/65">{{ t(`site.home.highlights.${feature.key}.text`) }}</span>
              </span>
            </li>
          </ul>
        </div>

        <p class="relative hidden text-xs text-white/50 lg:block">
          {{ t('auth.hero.rights') }} © {{ new Date().getFullYear() }}
        </p>
      </aside>

      <section class="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:py-12">
        <div class="w-full max-w-md">
          <slot />
        </div>
      </section>
    </div>
  </div>
</template>
