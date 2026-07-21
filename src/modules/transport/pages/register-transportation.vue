<script setup lang="ts">
definePageMeta({
  layout: 'site',
  // Client-only: wizard draft lives in sessionStorage (avoids SSR hydration mismatch).
  ssr: false,
})

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.transport.register.seoTitle'),
  description: () => t('site.transport.register.seoDescription'),
})
</script>

<template>
  <TransportRegisterSection />
</template>
