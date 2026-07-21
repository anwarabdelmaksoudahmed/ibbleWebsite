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
  title: () => t('site.profile.wallet.seoTitle'),
  description: () => t('site.profile.wallet.seoDescription'),
  ogTitle: () => t('site.profile.wallet.seoTitle'),
  ogDescription: () => t('site.profile.wallet.seoDescription'),
})
</script>

<template>
  <ProfileWalletSection />
</template>
