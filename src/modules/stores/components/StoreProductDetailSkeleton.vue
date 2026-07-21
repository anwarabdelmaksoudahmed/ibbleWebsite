<template>
  <div class="space-y-6" aria-busy="true">
    <div class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated">
      <BaseSkeleton width="100%" height="14rem" rounded="sm" />
      <div class="space-y-3 p-5">
        <BaseSkeleton width="40%" height="1.75rem" />
        <BaseSkeleton width="70%" height="1rem" />
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated">
      <BaseSkeleton width="100%" height="2.75rem" rounded="sm" />
      <div class="grid gap-6 p-4 sm:gap-8 sm:p-6 lg:grid-cols-2">
        <BaseSkeleton width="100%" height="20rem" rounded="lg" />
        <div class="space-y-4">
          <BaseSkeleton width="30%" height="0.875rem" />
          <BaseSkeleton width="85%" height="2rem" />
          <BaseSkeleton width="100%" height="4rem" />
          <BaseSkeleton width="40%" height="1.25rem" />
          <BaseSkeleton width="55%" height="3.5rem" rounded="lg" />
          <BaseSkeleton width="45%" height="2.5rem" rounded="lg" />
          <div class="flex gap-3">
            <BaseSkeleton width="100%" height="3rem" rounded="lg" class="flex-1" />
            <BaseSkeleton width="100%" height="3rem" rounded="lg" class="flex-1" />
          </div>
        </div>
      </div>
    </div>

    <BaseSkeleton width="100%" height="12rem" rounded="lg" />
  </div>
</template>
