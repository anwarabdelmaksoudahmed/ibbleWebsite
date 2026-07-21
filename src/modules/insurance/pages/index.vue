<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'site',
})

useSeoMeta({
  title: () => t('site.insurance.seoTitle'),
  description: () => t('site.insurance.seoDescription'),
})
</script>

<template>
  <InsurancePageSection />
</template>
