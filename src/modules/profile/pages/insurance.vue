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
  title: () => t('site.profile.insurance.seoTitle'),
  description: () => t('site.profile.insurance.seoDescription'),
  ogTitle: () => t('site.profile.insurance.seoTitle'),
  ogDescription: () => t('site.profile.insurance.seoDescription'),
})
</script>

<template>
  <ProfileInsuranceSection />
</template>
