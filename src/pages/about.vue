<script setup lang="ts">
import { CONTACT_INFO } from '@shared/constants/contact'

definePageMeta({ layout: 'site' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()

const pageUrl = computed(
  () => `${runtimeConfig.public.appUrl}${localePath('/about')}`,
)

useSeoMeta({
  title: () => t('site.about.seoTitle'),
  description: () => t('site.about.seoDescription'),
  ogTitle: () => t('site.about.seoTitle'),
  ogDescription: () => t('site.about.seoDescription'),
  ogType: 'website',
  ogUrl: () => pageUrl.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('site.about.seoTitle'),
  twitterDescription: () => t('site.about.seoDescription'),
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: t('site.about.title'),
        description: t('site.about.seoDescription'),
        url: pageUrl.value,
        inLanguage: locale.value,
        mainEntity: {
          '@type': 'Organization',
          name: t('auth.platformName'),
          url: runtimeConfig.public.appUrl,
          description: t('site.about.lead'),
          email: CONTACT_INFO.email,
          telephone: CONTACT_INFO.phone,
          areaServed: {
            '@type': 'Country',
            name: 'Saudi Arabia',
          },
        },
      }),
    },
  ],
}))
</script>

<template>
  <div>
    <AboutNewsTickerSection />

    <AboutSection />
    <HomeStatsSection />
  </div>
</template>
