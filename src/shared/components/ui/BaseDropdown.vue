<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

onClickOutside(menuRef, () => { isOpen.value = false }, { ignore: [triggerRef] })

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

provide('closeDropdown', close)
</script>

<template>
  <div class="relative inline-block">
    <div ref="triggerRef" @click="toggle">
      <slot name="trigger" :open="isOpen" :toggle="toggle" />
    </div>
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        ref="menuRef"
        class="absolute right-0 z-50 mt-2 min-w-48 rounded-lg border border-border bg-surface-elevated py-1 shadow-lg"
        role="menu"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
