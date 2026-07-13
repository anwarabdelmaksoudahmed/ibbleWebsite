<script setup lang="ts">
const props = defineProps<{
  quantity: number
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  increase: []
  decrease: []
}>()

const { t } = useI18n()

const displayQty = computed(() => Math.max(0, props.quantity))
</script>

<template>
  <div
    class="inline-flex h-10 items-center overflow-hidden rounded-xl border border-ibbil-green/15 bg-[#f7f9f8] dark:border-ibbil-green/25 dark:bg-surface-muted"
    role="group"
    :aria-label="t('site.commerce.cart.quantity')"
  >
    <button
      type="button"
      class="flex h-full w-10 items-center justify-center text-ibbil-green transition-colors hover:bg-ibbil-green/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="disabled || loading"
      :aria-label="t('site.commerce.cart.decrease')"
      @click="emit('decrease')"
    >
      <Icon name="lucide:minus" class="size-4" aria-hidden="true" />
    </button>

    <span
      class="min-w-10 px-1 text-center text-sm font-bold tabular-nums text-ibbil-green"
      aria-live="polite"
    >
      <Icon
        v-if="loading"
        name="lucide:loader-circle"
        class="mx-auto size-4 animate-spin text-ibbil-green/60"
        aria-hidden="true"
      />
      <template v-else>
        {{ displayQty }}
      </template>
    </span>

    <button
      type="button"
      class="flex h-full w-10 items-center justify-center text-ibbil-green transition-colors hover:bg-ibbil-green/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="disabled || loading"
      :aria-label="t('site.commerce.cart.increase')"
      @click="emit('increase')"
    >
      <Icon name="lucide:plus" class="size-4" aria-hidden="true" />
    </button>
  </div>
</template>
