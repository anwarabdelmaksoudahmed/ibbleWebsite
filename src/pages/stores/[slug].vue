<script setup lang="ts">
definePageMeta({ layout: 'site' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.stores.seoTitle'),
  description: () => t('site.stores.seoDescription'),
})
</script>

<template>
  <ComingSoonSection title-key="site.nav.stores" />
</template>
