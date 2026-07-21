<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { cn } from '@shared/utils/cn'

export type BreadcrumbItem = {
  label: string
  to?: string
  /** Optional Lucide icon name, e.g. `lucide:home` */
  icon?: string
}

export type BaseBreadcrumbProps = {
  items: BreadcrumbItem[]
  /** Collapse middle crumbs when the trail exceeds this length. Default: 4 */
  maxItems?: number
  /** Show a home icon on the first crumb when it has no custom icon. Default: true */
  showHomeIcon?: boolean
  size?: 'sm' | 'md'
  class?: string
}

const props = withDefaults(defineProps<BaseBreadcrumbProps>(), {
  maxItems: 4,
  showHomeIcon: true,
  size: 'sm',
  class: undefined,
})

const { t } = useI18n()

const overflowOpen = ref(false)
const overflowRef = ref<HTMLElement | null>(null)

onClickOutside(overflowRef, () => {
  overflowOpen.value = false
})

const sizeClasses = computed(() =>
  props.size === 'md' ? 'text-sm sm:text-base gap-1.5' : 'text-xs sm:text-sm gap-1',
)

type VisibleCrumb = {
  item: BreadcrumbItem
  index: number
  isLast: boolean
  icon?: string
}

type CrumbSlot =
  | { type: 'item'; crumb: VisibleCrumb }
  | { type: 'overflow'; items: VisibleCrumb[] }

function iconFor(item: BreadcrumbItem, index: number): string | undefined {
  if (item.icon) return item.icon
  if (props.showHomeIcon && index === 0) return 'lucide:home'
  return undefined
}

const slots = computed<CrumbSlot[]>(() => {
  const list = props.items
  const total = list.length
  if (total === 0) return []

  const toCrumb = (item: BreadcrumbItem, index: number, isLast: boolean): VisibleCrumb => ({
    item,
    index,
    isLast,
    icon: iconFor(item, index),
  })

  const max = Math.max(props.maxItems, 2)

  if (total <= max) {
    return list.map((item, index) => ({
      type: 'item' as const,
      crumb: toCrumb(item, index, index === total - 1),
    }))
  }

  // Keep first + last two; collapse the middle into an overflow menu.
  const keepTail = 2
  const headEnd = 1
  const tailStart = total - keepTail

  const result: CrumbSlot[] = [
    { type: 'item', crumb: toCrumb(list[0]!, 0, false) },
    {
      type: 'overflow',
      items: list.slice(headEnd, tailStart).map((item, i) => toCrumb(item, headEnd + i, false)),
    },
  ]

  for (let i = tailStart; i < total; i++) {
    result.push({
      type: 'item',
      crumb: toCrumb(list[i]!, i, i === total - 1),
    })
  }

  return result
})

function toggleOverflow() {
  overflowOpen.value = !overflowOpen.value
}

function closeOverflow() {
  overflowOpen.value = false
}

function setOverflowRef(el: unknown) {
  overflowRef.value = el instanceof HTMLElement ? el : null
}
</script>

<template>
  <nav :aria-label="t('common.breadcrumb')" :class="cn('min-w-0', props.class)">
    <ol
      :class="cn('flex flex-wrap items-center', sizeClasses)"
      itemscope
      itemtype="https://schema.org/BreadcrumbList"
    >
      <template v-for="(slot, slotIndex) in slots" :key="slot.type === 'item' ? slot.crumb.index : 'overflow'">
        <li
          v-if="slotIndex > 0"
          class="flex shrink-0 items-center text-foreground-muted/50"
          aria-hidden="true"
        >
          <DirectionalArrow variant="chevron" size="xs" class="opacity-70" />
        </li>

        <li
          v-if="slot.type === 'overflow'"
          :ref="setOverflowRef"
          class="relative flex items-center"
        >
          <button
            type="button"
            class="inline-flex size-7 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-ibbil-green/[0.08] hover:text-ibbil-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green/40 focus-visible:ring-offset-1"
            :aria-expanded="overflowOpen"
            :aria-label="t('common.breadcrumbMore')"
            @click="toggleOverflow"
          >
            <Icon name="lucide:ellipsis" class="size-4" aria-hidden="true" />
          </button>

          <Transition name="breadcrumb-menu">
            <div
              v-if="overflowOpen"
              class="absolute start-0 top-full z-50 mt-1.5 min-w-44 max-w-64 overflow-hidden rounded-xl border border-ibbil-green/10 bg-white py-1 shadow-lg shadow-ibbil-green/5 dark:border-ibbil-green/20 dark:bg-surface-elevated"
              role="menu"
            >
              <template v-for="crumb in slot.items" :key="crumb.index">
                <NuxtLink
                  v-if="crumb.item.to"
                  :to="crumb.item.to"
                  role="menuitem"
                  class="flex items-center gap-2 truncate px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-ibbil-green/[0.06] hover:text-ibbil-green"
                  @click="closeOverflow"
                >
                  <Icon
                    v-if="crumb.icon"
                    :name="crumb.icon"
                    class="size-3.5 shrink-0 opacity-70"
                    aria-hidden="true"
                  />
                  <span class="truncate">{{ crumb.item.label }}</span>
                </NuxtLink>
                <span
                  v-else
                  role="menuitem"
                  class="flex items-center gap-2 truncate px-3 py-2 text-sm font-medium text-foreground"
                >
                  <span class="truncate">{{ crumb.item.label }}</span>
                </span>
              </template>
            </div>
          </Transition>
        </li>

        <li
          v-else
          class="flex min-w-0 max-w-[10rem] items-center sm:max-w-[14rem] md:max-w-[18rem]"
          itemprop="itemListElement"
          itemscope
          itemtype="https://schema.org/ListItem"
        >
          <meta itemprop="position" :content="String(slot.crumb.index + 1)">

          <NuxtLink
            v-if="slot.crumb.item.to && !slot.crumb.isLast"
            :to="slot.crumb.item.to"
            itemprop="item"
            :class="cn(
              'group inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors',
              'text-foreground-muted hover:bg-ibbil-green/[0.06] hover:text-ibbil-green',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green/40 focus-visible:ring-offset-1',
            )"
          >
            <Icon
              v-if="slot.crumb.icon"
              :name="slot.crumb.icon"
              class="size-3.5 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
            <span itemprop="name" class="truncate">{{ slot.crumb.item.label }}</span>
          </NuxtLink>

          <span
            v-else
            itemprop="name"
            class="inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 font-semibold text-ibbil-green"
            aria-current="page"
          >
            <Icon
              v-if="slot.crumb.icon"
              :name="slot.crumb.icon"
              class="size-3.5 shrink-0"
              aria-hidden="true"
            />
            <span class="truncate">{{ slot.crumb.item.label }}</span>
          </span>
        </li>
      </template>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb-menu-enter-active,
.breadcrumb-menu-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.breadcrumb-menu-enter-from,
.breadcrumb-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
