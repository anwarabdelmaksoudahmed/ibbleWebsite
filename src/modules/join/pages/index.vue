<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  authContentAlign: 'top',
})

const { t } = useI18n()

useSeoMeta({
  title: () => t('join.seoTitle'),
  description: () => t('join.seoDescription'),
})
</script>

<template>
  <JoinRegisterForm />
</template>
