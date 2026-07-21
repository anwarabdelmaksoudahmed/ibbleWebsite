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
  title: () => t('site.profile.marketplace.seoTitle'),
  description: () => t('site.profile.marketplace.seoDescription'),
  ogTitle: () => t('site.profile.marketplace.seoTitle'),
  ogDescription: () => t('site.profile.marketplace.seoDescription'),
})
</script>

<template>
  <ProfileMarketplaceSection />
</template>
