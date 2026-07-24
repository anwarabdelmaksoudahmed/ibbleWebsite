<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: () => t('site.permits.seoTitle'),
  description: () => t('site.permits.seoDescription'),
})
</script>

<template>
  <PermitsPageSection />
</template>
