<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  applying?: boolean
  applied?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  apply: []
}>()

const { t } = useI18n()

const draft = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_10px_32px_-22px_rgba(45,83,61,0.35)] dark:border-ibbil-green/20 dark:bg-surface-elevated"
    :aria-label="t('site.commerce.checkout.discountTitle')"
  >
    <div class="border-b border-ibbil-green/10 px-4 py-3 sm:px-5">
      <h2 class="text-sm font-extrabold text-ibbil-green">
        {{ t('site.commerce.checkout.discountTitle') }}
      </h2>
    </div>

    <div class="flex gap-2 p-4 sm:p-5">
      <input
        v-model="draft"
        type="text"
        class="min-w-0 flex-1 rounded-xl border border-ibbil-green/15 bg-[#fafbfa] px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-foreground-muted focus:border-ibbil-green/40 focus:ring-2 focus:ring-ibbil-green/15 dark:bg-surface-muted"
        :placeholder="t('site.commerce.checkout.discountPlaceholder')"
        :disabled="applying"
        @keydown.enter.prevent="emit('apply')"
      >
      <button
        type="button"
        class="inline-flex shrink-0 items-center justify-center rounded-xl bg-ibbil-green px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ibbil-green-dark disabled:opacity-60"
        :disabled="applying || !draft.trim()"
        @click="emit('apply')"
      >
        {{ applied ? t('site.commerce.checkout.discountApplied') : t('site.commerce.checkout.discountApply') }}
      </button>
    </div>
  </section>
</template>
