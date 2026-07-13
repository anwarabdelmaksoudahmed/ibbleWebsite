<script setup lang="ts">
import CheckoutPageSection from '@modules/checkout/components/CheckoutPageSection.vue'

definePageMeta({ layout: 'site' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.commerce.checkout.seoTitle'),
  description: () => t('site.commerce.checkout.seoDescription'),
})
</script>

<template>
  <CheckoutPageSection />
</template>
