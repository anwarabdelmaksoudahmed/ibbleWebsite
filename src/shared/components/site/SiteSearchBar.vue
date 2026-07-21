<script setup lang="ts">
import type { SelectOption } from '@shared/components/ui/BaseSelect.vue'
import { cn } from '@shared/utils/cn'

const props = withDefaults(
  defineProps<{
    variant?: 'header' | 'mobile'
  }>(),
  {
    variant: 'header',
  },
)

const query = defineModel<string>('query', { default: '' })
const category = defineModel<string>('category', { default: 'all' })

const emit = defineEmits<{ submit: [] }>()

const { t } = useI18n()
const inputRef = ref<HTMLInputElement | null>(null)

const categoryOptions = computed<SelectOption[]>(() => [
  { label: t('site.search.all'), value: 'all' },
  { label: t('site.nav.stores'), value: 'stores' },
  { label: t('site.nav.services'), value: 'services' },
])

const hasQuery = computed(() => query.value.trim().length > 0)
const isHeader = computed(() => props.variant === 'header')

const selectShellClass =
  '!h-full !rounded-none !border-0 !bg-transparent !shadow-none hover:!border-transparent focus-within:!ring-0'

const selectTriggerClass = '!pe-8 !ps-3 !py-2.5 font-medium text-foreground'

function onSubmit() {
  emit('submit')
}

function clearQuery() {
  query.value = ''
  nextTick(() => inputRef.value?.focus())
}
</script>

<template>
  <form
    :class="cn(
      'site-search-bar',
      isHeader
        ? 'mx-auto hidden min-h-10 min-w-0 max-w-md flex-1 items-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-[box-shadow,ring-color] duration-200 focus-within:shadow-md focus-within:ring-2 focus-within:ring-white/50 md:flex lg:max-w-xl'
        : 'flex flex-col gap-2',
    )"
    role="search"
    :aria-label="t('common.search')"
    @submit.prevent="onSubmit"
  >
    <div
      v-if="isHeader"
      class="site-search-category h-full w-max shrink-0 border-e border-border/50"
    >
      <BaseSelect
        v-model="category"
        :options="categoryOptions"
        :aria-label="t('site.search.category')"
        :truncate-labels="false"
        :panel-min-width="148"
        size="sm"
        root-class="!space-y-0 h-full"
        :wrapper-class="cn(selectShellClass, '!w-auto')"
        :trigger-class="selectTriggerClass"
      />
    </div>

    <div
      v-else
      class="flex rounded-xl border border-border bg-white p-1 shadow-sm"
      role="group"
      :aria-label="t('site.search.category')"
    >
      <button
        v-for="option in categoryOptions"
        :key="option.value"
        type="button"
        class="min-h-10 flex-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green/40"
        :class="category === option.value
          ? 'bg-ibbil-green text-white shadow-sm'
          : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground'"
        :aria-pressed="category === option.value"
        @click="category = String(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <div
      :class="cn(
        'flex min-w-0 gap-2',
        isHeader ? 'flex-1 items-center' : 'items-stretch',
      )"
    >
      <div
        :class="cn(
          'flex min-w-0 flex-1 items-center',
          !isHeader && 'rounded-xl border border-border bg-white shadow-sm transition-[border-color,box-shadow] focus-within:border-ibbil-green focus-within:ring-2 focus-within:ring-ibbil-green/15',
        )"
      >
        <input
          ref="inputRef"
          v-model="query"
          type="search"
          :placeholder="t('site.search.placeholder')"
          :aria-label="t('site.search.placeholder')"
          enterkeyhint="search"
          autocomplete="off"
          :class="cn(
            'site-search-input min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted',
            isHeader ? 'px-3 py-2.5' : 'px-3 py-2.5',
          )"
        >

        <Transition name="search-clear">
          <button
            v-if="hasQuery"
            type="button"
            class="me-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-ibbil-green/10 hover:text-ibbil-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green/40"
            :aria-label="t('common.clearSearch')"
            @mousedown.prevent
            @click="clearQuery"
          >
            <Icon name="lucide:x" class="size-3.5" aria-hidden="true" />
          </button>
        </Transition>
      </div>

      <button
        type="submit"
        :class="cn(
          'inline-flex shrink-0 items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green/40',
          isHeader
            ? 'self-stretch bg-ibbil-green/5 px-3.5 text-ibbil-green hover:bg-ibbil-green hover:text-white sm:px-4'
            : 'min-h-10 rounded-xl bg-ibbil-green px-4 text-sm text-white shadow-sm hover:bg-ibbil-green-dark',
        )"
        :aria-label="t('common.search')"
      >
        <Icon name="lucide:search" class="size-4" aria-hidden="true" />
        <span v-if="!isHeader" class="sr-only">{{ t('common.search') }}</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.site-search-input::-webkit-search-cancel-button,
.site-search-input::-webkit-search-decoration {
  appearance: none;
}

.search-clear-enter-active,
.search-clear-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.search-clear-enter-from,
.search-clear-leave-to {
  opacity: 0;
  transform: scale(0.75);
}

@media (prefers-reduced-motion: reduce) {
  .search-clear-enter-active,
  .search-clear-leave-active {
    transition: none;
  }
}
</style>
