<script setup lang="ts">
import { CONTACT_INFO } from '@shared/constants/contact'
import { ROUTES } from '@shared/constants/routes'

definePageMeta({ layout: 'site' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()

const pageUrl = computed(
  () => `${runtimeConfig.public.appUrl}${localePath(ROUTES.SERVICES)}`,
)

useSeoMeta({
  title: () => t('site.services.seoTitle'),
  description: () => t('site.services.seoDescription'),
  ogTitle: () => t('site.services.seoTitle'),
  ogDescription: () => t('site.services.seoDescription'),
  ogType: 'website',
  ogUrl: () => pageUrl.value,
  ogImage: () => `${runtimeConfig.public.appUrl}/images/services/transport.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('site.services.seoTitle'),
  twitterDescription: () => t('site.services.seoDescription'),
  twitterImage: () => `${runtimeConfig.public.appUrl}/images/services/transport.jpg`,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: t('site.services.seoTitle'),
        description: t('site.services.seoDescription'),
        url: pageUrl.value,
        inLanguage: locale.value,
        isPartOf: {
          '@type': 'WebSite',
          name: t('auth.platformName'),
          url: runtimeConfig.public.appUrl,
        },
        about: {
          '@type': 'Organization',
          name: t('auth.platformName'),
          url: runtimeConfig.public.appUrl,
          email: CONTACT_INFO.email,
          telephone: CONTACT_INFO.phone,
          areaServed: {
            '@type': 'Country',
            name: 'Saudi Arabia',
          },
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: t('site.nav.stores'),
              url: `${runtimeConfig.public.appUrl}${localePath(ROUTES.STORES.ROOT)}`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: t('site.nav.insurance'),
              url: `${runtimeConfig.public.appUrl}${localePath(ROUTES.INSURANCE)}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: t('site.nav.transport'),
              url: `${runtimeConfig.public.appUrl}${localePath(ROUTES.TRANSPORT)}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: t('site.nav.veterinary'),
              url: `${runtimeConfig.public.appUrl}${localePath('/services/veterinary')}`,
            },
            {
              '@type': 'ListItem',
              position: 5,
              name: t('site.nav.permits'),
              url: `${runtimeConfig.public.appUrl}${localePath('/services/permits')}`,
            },
          ],
        },
      }),
    },
  ],
}))
</script>

<template>
  <ServicesHubSection />
</template>
