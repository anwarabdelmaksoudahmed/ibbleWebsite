<script setup lang="ts">
import type { StoreProductCategory } from '@modules/stores/types'

const props = defineProps<{
  categories: StoreProductCategory[]
  modelValue: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const { t, n } = useI18n()

function select(id: string) {
  emit('update:modelValue', id)
}

const isAllActive = computed(() => !props.modelValue)
</script>

<template>
  <section :aria-label="t('site.stores.profile.categoriesTitle')">
    <div class="mb-3 flex items-center justify-between gap-3">
      <h2 class="text-lg font-extrabold tracking-tight text-ibbil-green sm:text-xl">
        {{ t('site.stores.profile.categoriesTitle') }}
      </h2>
    </div>

    <div
      v-if="loading && !categories.length"
      class="flex gap-2 overflow-x-auto pb-1"
      aria-busy="true"
    >
      <BaseSkeleton
        v-for="i in 4"
        :key="i"
        width="7.5rem"
        height="2.5rem"
        rounded="lg"
        class="shrink-0"
      />
    </div>

    <BaseEmptyState
      v-else-if="!categories.length"
      variant="brand"
      class="!py-8"
      :title="t('site.stores.profile.categoriesEmptyTitle')"
      :description="t('site.stores.profile.categoriesEmptyDescription')"
      icon="lucide:layout-grid"
    />

    <div
      v-else
      class="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="listbox"
      :aria-label="t('site.stores.profile.categoriesTitle')"
    >
      <button
        type="button"
        role="option"
        :aria-selected="isAllActive"
        class="inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
        :class="
          isAllActive
            ? 'border-ibbil-green bg-ibbil-green text-white'
            : 'border-ibbil-green/15 bg-white text-ibbil-green hover:border-ibbil-gold/40 hover:bg-ibbil-green/[0.04] dark:border-ibbil-green/25 dark:bg-surface-elevated'
        "
        @click="select('')"
      >
        <Icon name="lucide:layout-grid" class="h-4 w-4" aria-hidden="true" />
        {{ t('site.stores.filters.all') }}
      </button>

      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        role="option"
        :aria-selected="modelValue === category.id"
        class="inline-flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
        :class="
          modelValue === category.id
            ? 'border-ibbil-green bg-ibbil-green text-white'
            : 'border-ibbil-green/15 bg-white text-ibbil-green hover:border-ibbil-gold/40 hover:bg-ibbil-green/[0.04] dark:border-ibbil-green/25 dark:bg-surface-elevated'
        "
        @click="select(category.id)"
      >
        <span
          class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg"
          :class="modelValue === category.id ? 'bg-white/15' : 'bg-ibbil-green/[0.06]'"
        >
          <img
            v-if="category.image"
            :src="category.image"
            alt=""
            class="h-full w-full object-cover"
            loading="lazy"
            width="32"
            height="32"
          >
          <Icon
            v-else
            name="lucide:tag"
            class="h-3.5 w-3.5 opacity-70"
            aria-hidden="true"
          />
        </span>
        <span class="max-w-[10rem] truncate">{{ category.name }}</span>
        <span
          v-if="category.productsCount > 0"
          class="rounded-md px-1.5 py-0.5 text-xs font-medium"
          :class="
            modelValue === category.id
              ? 'bg-white/15 text-white'
              : 'bg-ibbil-green/[0.08] text-foreground-muted'
          "
        >
          {{ n(category.productsCount) }}
        </span>
      </button>
    </div>
  </section>
</template>
