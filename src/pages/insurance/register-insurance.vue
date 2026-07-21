<script setup lang="ts">
definePageMeta({
  layout: 'site',
  // Client-only: wizard draft lives in sessionStorage (avoids SSR hydration mismatch).
  ssr: false,
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
