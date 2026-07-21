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
  title: () => t('site.profile.favorites.seoTitle'),
  description: () => t('site.profile.favorites.seoDescription'),
  ogTitle: () => t('site.profile.favorites.seoTitle'),
  ogDescription: () => t('site.profile.favorites.seoDescription'),
})
</script>

<template>
  <ProfileFavoritesSection />
</template>
