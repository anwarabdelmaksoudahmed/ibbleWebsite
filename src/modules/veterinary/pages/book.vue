<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'site',
  middleware: ['auth'],
  ssr: false,
})

useSeoMeta({
  title: () => t('site.veterinary.book.seoTitle'),
  description: () => t('site.veterinary.book.seoDescription'),
})
</script>

<template>
  <VeterinaryBookingSection />
</template>
