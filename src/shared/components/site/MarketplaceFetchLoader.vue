<script setup lang="ts">
/**
 * Centered brand loader for marketplace fetch states.
 * Use while waiting for API data (initial load or empty refresh).
 */
withDefaults(
  defineProps<{
    label?: string
    minHeight?: string
  }>(),
  {
    label: undefined,
    minHeight: '18rem',
  },
)
</script>

<template>
  <div
    class="flex w-full items-center justify-center rounded-2xl border border-ibbil-green/10 bg-white"
    :style="{ minHeight }"
    role="status"
    aria-live="polite"
  >
    <BaseLoader block size="lg" tone="brand" show-label :label="label" class="!py-0" />
  </div>
</template>
