<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'customers.view',
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-foreground">{{ t('nav.customers') }}</h1>
    <BaseEmptyState title="No customers yet" description="Customers will appear here once connected to the API." />
  </div>
</template>
