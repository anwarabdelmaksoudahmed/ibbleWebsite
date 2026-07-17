<script setup lang="ts">
definePageMeta({
  layout: 'site',
})

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.insurance.register.seoTitle'),
  description: () => t('site.insurance.register.seoDescription'),
})
</script>

<template>
  <InsuranceRegisterSection />
</template>
