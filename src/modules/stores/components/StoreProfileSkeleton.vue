<script setup lang="ts">
withDefaults(
  defineProps<{
    productCount?: number
  }>(),
  {
    productCount: 8,
  },
)
</script>

<template>
  <div class="space-y-6" aria-busy="true">
    <div class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated">
      <BaseSkeleton width="100%" height="14rem" rounded="sm" />
      <div class="space-y-3 p-5">
        <BaseSkeleton width="40%" height="1.75rem" />
        <BaseSkeleton width="70%" height="1rem" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <BaseSkeleton
        v-for="i in 4"
        :key="i"
        width="100%"
        height="5.5rem"
        rounded="lg"
      />
    </div>

    <BaseSkeleton width="100%" height="10rem" rounded="lg" />

    <div class="flex gap-2 overflow-hidden">
      <BaseSkeleton
        v-for="i in 5"
        :key="`chip-${i}`"
        width="8rem"
        height="2.5rem"
        rounded="lg"
        class="shrink-0"
      />
    </div>

    <ul
      role="list"
      class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
    >
      <li
        v-for="i in productCount"
        :key="i"
        class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated"
      >
        <BaseSkeleton width="100%" height="10rem" rounded="sm" />
        <div class="space-y-2 p-4">
          <BaseSkeleton width="35%" height="0.75rem" />
          <BaseSkeleton width="80%" height="1.25rem" />
          <BaseSkeleton width="55%" height="1rem" />
          <BaseSkeleton width="40%" height="1.25rem" class="mt-2" />
        </div>
      </li>
    </ul>
  </div>
</template>
