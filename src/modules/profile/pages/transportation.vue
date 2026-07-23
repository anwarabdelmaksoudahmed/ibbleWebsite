<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'profile',
  middleware: ['auth'],
  pageTransition: false,
  layoutTransition: false,
  viewTransition: false,
  scrollToTop: false,
  keepalive: true,
})

useSeoMeta({
  title: () => t('site.profile.transportation.seoTitle'),
  description: () => t('site.profile.transportation.seoDescription'),
  ogTitle: () => t('site.profile.transportation.seoTitle'),
  ogDescription: () => t('site.profile.transportation.seoDescription'),
})
</script>

<template>
  <ProfileTransportationSection />
</template>
