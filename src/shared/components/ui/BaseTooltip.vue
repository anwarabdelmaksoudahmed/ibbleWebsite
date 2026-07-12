<script setup lang="ts">
export type BaseTooltipProps = {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<BaseTooltipProps>(), {
  position: 'top',
})

const isVisible = ref(false)

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}
</script>

<template>
  <div
    class="relative inline-flex"
    @mouseenter="isVisible = true"
    @mouseleave="isVisible = false"
    @focusin="isVisible = true"
    @focusout="isVisible = false"
  >
    <slot />
    <Transition name="tooltip">
      <div
        v-if="isVisible"
        role="tooltip"
        :class="['absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-surface', positionClasses[position]]"
      >
        {{ text }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tooltip-enter-active, .tooltip-leave-active { transition: opacity 0.15s ease; }
.tooltip-enter-from, .tooltip-leave-to { opacity: 0; }
</style>
