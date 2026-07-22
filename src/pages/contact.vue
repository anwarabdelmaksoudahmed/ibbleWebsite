<script setup lang="ts">
definePageMeta({ layout: 'site' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.contact.seoTitle'),
  description: () => t('site.contact.seoDescription'),
})
</script>

<template>
  <ContactSection />
</template>
