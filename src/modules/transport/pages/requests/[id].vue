<script setup lang="ts">
definePageMeta({
  layout: 'site',
  middleware: ['auth'],
  ssr: false,
})

const route = useRoute()
const { t } = useI18n()

const requestId = computed(() => String(route.params.id || '').trim())

useSeoMeta({
  title: () => t('site.transport.request.seoTitle'),
  description: () => t('site.transport.request.seoDescription'),
})
</script>

<template>
  <TransportRequestStatusSection
    v-if="requestId"
    :request-id="requestId"
  />
</template>
