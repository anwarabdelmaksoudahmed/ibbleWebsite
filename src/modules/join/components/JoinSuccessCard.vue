<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'

defineEmits<{ reset: [] }>()

const { t } = useI18n()
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-border/70 bg-white text-center shadow-[0_24px_60px_-28px_rgba(45,83,61,0.4)]"
    role="status"
  >
    <div class="px-6 pb-8 pt-10 sm:px-10">
      <span class="join-success-icon mx-auto flex size-16 items-center justify-center rounded-full bg-ibbil-green/10 text-ibbil-green">
        <Icon name="lucide:circle-check-big" class="size-8" aria-hidden="true" />
      </span>

      <h2 class="mt-5 text-xl font-extrabold text-ibbil-green sm:text-2xl">
        {{ t('join.success.title') }}
      </h2>
      <p class="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-foreground-muted">
        {{ t('join.success.message') }}
      </p>

      <div class="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <NuxtLinkLocale
          :to="ROUTES.HOME"
          class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ibbil-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ibbil-green-dark sm:w-auto"
        >
          {{ t('join.success.backHome') }}
        </NuxtLinkLocale>
        <BaseButton variant="outline" class="w-full sm:w-auto" @click="$emit('reset')">
          {{ t('join.success.newRequest') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.join-success-icon {
  animation: join-success-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes join-success-pop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .join-success-icon {
    animation: none;
  }
}
</style>
