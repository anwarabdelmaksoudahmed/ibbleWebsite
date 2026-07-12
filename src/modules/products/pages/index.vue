<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'products.view',
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">{{ t('nav.products') }}</h1>
      <BaseButton>
        <Icon name="lucide:plus" class="size-4" />
        {{ t('common.create') }}
      </BaseButton>
    </div>
    <BaseDataTable
      :columns="[
        { key: 'name', label: 'Name', sortable: true },
        { key: 'sku', label: 'SKU' },
        { key: 'price', label: 'Price' },
        { key: 'status', label: 'Status' },
      ]"
      :data="[]"
      searchable
      empty-message="No products yet"
    />
  </div>
</template>
