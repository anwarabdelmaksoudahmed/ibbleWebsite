<script setup lang="ts">
import { APP_CONFIG } from '@shared/constants/app-config'
import {
  SITE_FOOTER_POLICIES,
  SITE_FOOTER_SERVICES,
  SITE_FOOTER_STORES,
} from '@shared/constants/site-nav'

const { t } = useI18n()
const year = new Date().getFullYear()

const socialLinks = [
  {
    icon: 'simple-icons:whatsapp',
    label: 'WhatsApp',
    href: `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}`,
  },
  { icon: 'carbon:logo-facebook', label: 'Facebook', href: '#' },
  { icon: 'carbon:logo-instagram', label: 'Instagram', href: '#' },
  { icon: 'carbon:logo-linkedin', label: 'LinkedIn', href: '#' },
  { icon: 'carbon:logo-x', label: 'X', href: '#' },
]
</script>

<template>
  <footer class="mt-auto bg-ibbil-green text-white">
    <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
      <div class="space-y-4 sm:col-span-2 lg:col-span-1">
        <SiteLogo light size="lg" />
        <p class="max-w-sm text-sm leading-relaxed text-white/75">
          {{ t('site.footer.description') }}
        </p>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="social in socialLinks"
            :key="social.label"
            :href="social.href"
            :target="social.href.startsWith('http') ? '_blank' : undefined"
            :rel="social.href.startsWith('http') ? 'noopener noreferrer' : undefined"
            :aria-label="social.label"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-ibbil-gold hover:text-ibbil-green-dark"
          >
            <Icon :name="social.icon" class="h-4 w-4" />
          </a>
        </div>
      </div>

      <div>
        <h3 class="mb-4 text-sm font-bold text-ibbil-gold">{{ t('site.nav.stores') }}</h3>
        <ul class="space-y-2.5">
          <li v-for="item in SITE_FOOTER_STORES" :key="item.key">
            <NuxtLinkLocale :to="item.to" class="text-sm text-white/75 transition-colors hover:text-white">
              {{ t(item.key) }}
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="mb-4 text-sm font-bold text-ibbil-gold">{{ t('site.nav.services') }}</h3>
        <ul class="space-y-2.5">
          <li v-for="item in SITE_FOOTER_SERVICES" :key="item.key">
            <NuxtLinkLocale :to="item.to" class="text-sm text-white/75 transition-colors hover:text-white">
              {{ t(item.key) }}
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="mb-4 text-sm font-bold text-ibbil-gold">{{ t('site.footer.policies') }}</h3>
        <ul class="space-y-2.5">
          <li v-for="item in SITE_FOOTER_POLICIES" :key="item.key">
            <NuxtLinkLocale :to="item.to" class="text-sm text-white/75 transition-colors hover:text-white">
              {{ t(item.key) }}
            </NuxtLinkLocale>
          </li>
        </ul>
        <div class="mt-6 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-xs text-white/70">
          {{ t('site.footer.vision') }}
        </div>
      </div>
    </div>

    <div class="border-t border-white/10">
      <p class="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-white/60 lg:px-6">
        {{ t('auth.hero.rights') }} {{ t('auth.platformName') }} {{ year }}
      </p>
    </div>
  </footer>
</template>
