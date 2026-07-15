import { onClickOutside, onKeyStroke } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'
import { computed, nextTick, onBeforeUnmount, ref, toValue, watch } from 'vue'

export type UseFloatingListboxOptions<T> = {
  isDisabled: MaybeRefOrGetter<boolean>
  items: MaybeRefOrGetter<readonly T[]>
  getSelectedIndex: () => number
  getOptionId: (item: T, index: number) => string
  onSelect: (item: T, index: number) => void
  isItemDisabled?: (item: T, index: number) => boolean
  panelWidth?: MaybeRefOrGetter<'trigger' | number>
  panelMaxHeight?: number
  panelGap?: number
  focusSearchOnOpen?: MaybeRefOrGetter<boolean>
  onClose?: () => void
}

export function useFloatingListbox<T>(options: UseFloatingListboxOptions<T>) {
  const isOpen = ref(false)
  const highlightedIndex = ref(-1)
  const rootRef = ref<HTMLElement | null>(null)
  const triggerRef = ref<HTMLButtonElement | null>(null)
  const searchRef = ref<HTMLInputElement | null>(null)
  const listRef = ref<HTMLElement | null>(null)
  const panelRef = ref<HTMLElement | null>(null)
  const panelStyle = ref<Record<string, string>>({})

  const panelGapPx = options.panelGap ?? 6
  const panelMaxHeightPx = options.panelMaxHeight ?? 240

  const activeDescendantId = computed(() => {
    if (!isOpen.value || highlightedIndex.value < 0) return undefined
    const item = toValue(options.items)[highlightedIndex.value]
    if (!item) return undefined
    return options.getOptionId(item, highlightedIndex.value)
  })

  function getEnabledIndexes(items: readonly T[]) {
    return items
      .map((item, index) => (options.isItemDisabled?.(item, index) ? -1 : index))
      .filter((index) => index >= 0)
  }

  function updatePanelPosition() {
    const trigger = triggerRef.value
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const widthMode = toValue(options.panelWidth ?? 'trigger')
    const width = widthMode === 'trigger'
      ? Math.min(rect.width, window.innerWidth - 16)
      : Math.min(widthMode, window.innerWidth - 16)

    let left = rect.left
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8)
    }

    const spaceBelow = window.innerHeight - rect.bottom - panelGapPx
    const spaceAbove = rect.top - panelGapPx
    const preferUp = spaceBelow < panelMaxHeightPx && spaceAbove > spaceBelow

    panelStyle.value = preferUp
      ? {
          position: 'fixed',
          left: `${left}px`,
          width: `${width}px`,
          bottom: `${window.innerHeight - rect.top + panelGapPx}px`,
          top: 'auto',
          zIndex: '80',
        }
      : {
          position: 'fixed',
          left: `${left}px`,
          width: `${width}px`,
          top: `${rect.bottom + panelGapPx}px`,
          bottom: 'auto',
          zIndex: '80',
        }
  }

  function syncHighlightToSelection() {
    const items = toValue(options.items)
    const selectedIndex = options.getSelectedIndex()
    highlightedIndex.value = selectedIndex >= 0
      ? selectedIndex
      : items.length
        ? getEnabledIndexes(items)[0] ?? -1
        : -1
  }

  function closeDropdown() {
    isOpen.value = false
  }

  function openDropdown() {
    if (toValue(options.isDisabled)) return
    isOpen.value = true
  }

  function toggleDropdown() {
    if (toValue(options.isDisabled)) return
    isOpen.value = !isOpen.value
  }

  function selectItem(item: T, index: number) {
    if (options.isItemDisabled?.(item, index)) return
    options.onSelect(item, index)
    closeDropdown()
    nextTick(() => triggerRef.value?.focus())
  }

  function setHighlightedIndex(index: number) {
    const items = toValue(options.items)
    const item = items[index]
    if (!item || options.isItemDisabled?.(item, index)) return
    highlightedIndex.value = index
  }

  function scrollHighlightedIntoView() {
    const list = listRef.value
    if (!list || highlightedIndex.value < 0) return
    const option = list.querySelector<HTMLElement>(
      `[data-option-index="${highlightedIndex.value}"]`,
    )
    option?.scrollIntoView({ block: 'nearest' })
  }

  function moveHighlight(delta: number) {
    const items = toValue(options.items)
    const enabledIndexes = getEnabledIndexes(items)
    if (!enabledIndexes.length) return

    const currentPos = enabledIndexes.indexOf(highlightedIndex.value)
    const nextPos = currentPos < 0
      ? (delta > 0 ? 0 : enabledIndexes.length - 1)
      : (currentPos + delta + enabledIndexes.length) % enabledIndexes.length

    highlightedIndex.value = enabledIndexes[nextPos] ?? -1
    scrollHighlightedIntoView()
  }

  function moveHighlightToEdge(edge: 'start' | 'end') {
    const enabledIndexes = getEnabledIndexes(toValue(options.items))
    if (!enabledIndexes.length) {
      highlightedIndex.value = -1
      return
    }

    highlightedIndex.value = edge === 'start'
      ? enabledIndexes[0]!
      : enabledIndexes[enabledIndexes.length - 1]!
    scrollHighlightedIntoView()
  }

  function onListKeydown(event: KeyboardEvent) {
    if (!isOpen.value) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const items = toValue(options.items)
      const item = items[highlightedIndex.value]
      if (item) selectItem(item, highlightedIndex.value)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      moveHighlightToEdge('start')
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      moveHighlightToEdge('end')
    }
  }

  function onTriggerKeydown(event: KeyboardEvent) {
    if (toValue(options.isDisabled)) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen.value) {
        openDropdown()
        return
      }
      moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!isOpen.value) {
        openDropdown()
        return
      }
      const items = toValue(options.items)
      const item = items[highlightedIndex.value]
      if (item) selectItem(item, highlightedIndex.value)
    }
  }

  onClickOutside(rootRef, () => closeDropdown(), { ignore: [panelRef] })

  onKeyStroke('Escape', (event) => {
    if (!isOpen.value) return
    event.preventDefault()
    closeDropdown()
    triggerRef.value?.focus()
  })

  watch(isOpen, (open) => {
    if (!open) {
      highlightedIndex.value = -1
      options.onClose?.()
      window.removeEventListener('resize', updatePanelPosition)
      window.removeEventListener('scroll', updatePanelPosition, true)
      return
    }

    syncHighlightToSelection()
    updatePanelPosition()
    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)

    nextTick(() => {
      updatePanelPosition()
      if (toValue(options.focusSearchOnOpen ?? false)) {
        searchRef.value?.focus()
      }
      scrollHighlightedIntoView()
    })
  })

  watch(
    () => toValue(options.items),
    () => {
      if (!isOpen.value) return
      syncHighlightToSelection()
    },
  )

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updatePanelPosition)
    window.removeEventListener('scroll', updatePanelPosition, true)
  })

  return {
    isOpen,
    highlightedIndex,
    activeDescendantId,
    rootRef,
    triggerRef,
    searchRef,
    listRef,
    panelRef,
    panelStyle,
    toggleDropdown,
    closeDropdown,
    openDropdown,
    syncHighlightToSelection,
    onListKeydown,
    onTriggerKeydown,
    scrollHighlightedIntoView,
    setHighlightedIndex,
    selectItem,
    updatePanelPosition,
  }
}
