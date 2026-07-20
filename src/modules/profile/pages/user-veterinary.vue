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
  title: () => t('site.profile.veterinary.seoTitle'),
  description: () => t('site.profile.veterinary.seoDescription'),
  ogTitle: () => t('site.profile.veterinary.seoTitle'),
  ogDescription: () => t('site.profile.veterinary.seoDescription'),
})
</script>

<template>
  <ProfileVeterinarySection />
</template>
