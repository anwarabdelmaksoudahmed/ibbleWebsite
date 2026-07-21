<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: () => t('site.veterinary.seoTitle'),
  description: () => t('site.veterinary.seoDescription'),
})
</script>

<template>
  <VeterinaryPageSection />
</template>
