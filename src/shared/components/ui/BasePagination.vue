<script setup lang="ts">
import { cn } from '@shared/utils/cn'

export type BasePaginationProps = {
  page: number
  totalPages: number
  disabled?: boolean
  /** Show "Page X of Y" alongside page numbers on larger screens */
  showPageInfo?: boolean
}

const props = withDefaults(defineProps<BasePaginationProps>(), {
  disabled: false,
  showPageInfo: false,
})

const emit = defineEmits<{ 'update:page': [page: number] }>()

const { t } = useI18n()

const canGoPrev = computed(() => !props.disabled && props.page > 1)
const canGoNext = computed(() => !props.disabled && props.page < props.totalPages)

const pages = computed(() => {
  const result: (number | 'ellipsis')[] = []
  const { page, totalPages } = props

  if (totalPages <= 0) return result
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  result.push(1)
  if (page > 3) result.push('ellipsis')

  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    result.push(i)
  }

  if (page < totalPages - 2) result.push('ellipsis')
  result.push(totalPages)

  return result
})

function goTo(p: number) {
  if (!props.disabled && p >= 1 && p <= props.totalPages && p !== props.page) {
    emit('update:page', p)
  }
}

const navBtnClass = cn(
  'inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-ibbil-green/15',
  'text-ibbil-green transition-all duration-200',
  'hover:border-ibbil-gold/45 hover:bg-ibbil-green/[0.06] hover:-translate-y-px',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green/40 focus-visible:ring-offset-1',
  'disabled:pointer-events-none disabled:opacity-35',
)

const pageBtnClass = (active: boolean) =>
  cn(
    'inline-flex size-9 min-w-9 items-center justify-center rounded-lg text-sm font-semibold tabular-nums transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green/40 focus-visible:ring-offset-1',
    'disabled:pointer-events-none disabled:opacity-35',
    active
      ? 'bg-ibbil-green text-white shadow-sm shadow-ibbil-green/20'
      : 'text-foreground-muted hover:bg-ibbil-green/[0.06] hover:text-ibbil-green',
  )
</script>

<template>
  <nav
    :aria-label="t('common.pagination.label')"
    :class="cn('base-pagination inline-flex flex-col items-center gap-2', disabled && 'opacity-60')"
  >
    <div
      class="inline-flex items-center gap-1 rounded-xl border border-ibbil-green/10 bg-white p-1 shadow-sm shadow-ibbil-green/[0.04] dark:border-ibbil-green/20 dark:bg-surface-elevated dark:shadow-none sm:gap-1.5 sm:p-1.5"
    >
      <button
        type="button"
        :class="navBtnClass"
        :disabled="!canGoPrev"
        :aria-label="t('common.pagination.prevPage')"
        @click="goTo(page - 1)"
      >
        <DirectionalArrow direction="back" variant="chevron" size="sm" />
      </button>

      <span
        class="flex min-w-[5.5rem] items-center justify-center px-2 text-sm font-semibold tabular-nums text-ibbil-green sm:hidden"
        aria-hidden="true"
      >
        {{ t('common.pagination.pageStatus', { current: page, total: totalPages }) }}
      </span>

      <ul class="hidden items-center gap-0.5 sm:flex">
        <template v-for="(p, i) in pages" :key="i">
          <li v-if="p === 'ellipsis'" class="inline-flex size-9 items-center justify-center text-foreground-muted/70">
            <Icon name="lucide:ellipsis" class="size-4" aria-hidden="true" />
          </li>
          <li v-else>
            <button
              type="button"
              :class="pageBtnClass(p === page)"
              :disabled="disabled"
              :aria-label="t('common.pagination.goToPage', { page: p })"
              :aria-current="p === page ? 'page' : undefined"
              @click="goTo(p)"
            >
              {{ p }}
            </button>
          </li>
        </template>
      </ul>

      <button
        type="button"
        :class="navBtnClass"
        :disabled="!canGoNext"
        :aria-label="t('common.pagination.nextPage')"
        @click="goTo(page + 1)"
      >
        <DirectionalArrow variant="chevron" size="sm" />
      </button>
    </div>

    <p
      v-if="showPageInfo"
      class="hidden text-xs font-medium text-foreground-muted sm:block"
      aria-hidden="true"
    >
      {{ t('common.pagination.pageStatus', { current: page, total: totalPages }) }}
    </p>

    <p class="sr-only" aria-live="polite" aria-atomic="true">
      {{ t('common.pagination.pageStatus', { current: page, total: totalPages }) }}
    </p>
  </nav>
</template>
