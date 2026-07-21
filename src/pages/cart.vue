<script setup lang="ts">
import CartPageSection from '@modules/cart/components/CartPageSection.vue'

definePageMeta({ layout: 'site' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.commerce.cart.seoTitle'),
  description: () => t('site.commerce.cart.seoDescription'),
})
</script>

<template>
  <CartPageSection />
</template>
