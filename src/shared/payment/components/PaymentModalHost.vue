<script setup lang="ts">
import PaymentModal from '@shared/payment/components/PaymentModal.vue'
</script>

<template>
  <ClientOnly>
    <PaymentModal />
  </ClientOnly>
</template>
