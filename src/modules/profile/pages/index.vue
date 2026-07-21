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
  title: () => t('site.profile.seoTitle'),
  description: () => t('site.profile.seoDescription'),
  ogTitle: () => t('site.profile.seoTitle'),
  ogDescription: () => t('site.profile.seoDescription'),
})
</script>

<template>
  <ProfilePageSection />
</template>
