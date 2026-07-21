<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'site',
})

useSeoMeta({
  title: () => t('site.transport.seoTitle'),
  description: () => t('site.transport.seoDescription'),
})
</script>

<template>
  <TransportPageSection />
</template>
