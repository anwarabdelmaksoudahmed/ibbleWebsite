<script setup lang="ts">
export type BreadcrumbItem = { label: string; to?: string }

export type BaseBreadcrumbProps = {
  items: BreadcrumbItem[]
}

defineProps<BaseBreadcrumbProps>()
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center gap-1 text-sm">
      <li v-for="(item, index) in items" :key="index" class="flex items-center gap-1">
        <DirectionalArrow
          v-if="index > 0"
          variant="chevron"
          class="text-foreground-muted"
        />
        <NuxtLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="text-foreground-muted hover:text-foreground"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else class="font-medium text-foreground" aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>
