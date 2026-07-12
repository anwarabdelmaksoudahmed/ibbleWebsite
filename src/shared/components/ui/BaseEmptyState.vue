<script setup lang="ts">
export type BaseEmptyStateProps = {
  title?: string
  description?: string
  icon?: string
}

withDefaults(defineProps<BaseEmptyStateProps>(), {
  title: 'No data',
  description: 'There is nothing to display here yet.',
  icon: 'lucide:inbox',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="mb-4 rounded-full bg-surface-muted p-4">
      <Icon :name="icon" class="size-8 text-foreground-muted" />
    </div>
    <h3 class="text-base font-medium text-foreground">{{ title }}</h3>
    <p class="mt-1 max-w-sm text-sm text-foreground-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>
