<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { cn } from '@shared/utils/cn'

export type BaseModalProps = {
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
}

const props = withDefaults(defineProps<BaseModalProps>(), {
  size: 'md',
  closable: true,
})

const emit = defineEmits<{ close: []; 'update:open': [value: boolean] }>()

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
}

function close() {
  emit('close')
  emit('update:open', false)
}

onKeyStroke('Escape', () => {
  if (props.open && props.closable) close()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div class="absolute inset-0 bg-black/50" aria-hidden="true" @click="closable && close()" />
        <div :class="cn('relative w-full rounded-xl bg-surface-elevated shadow-xl', sizeClasses[size])">
          <div v-if="title || closable" class="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 v-if="title" class="text-lg font-semibold text-foreground">{{ title }}</h2>
            <button
              v-if="closable"
              type="button"
              class="rounded-lg p-1 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              aria-label="Close modal"
              @click="close"
            >
              <Icon name="lucide:x" class="size-5" />
            </button>
          </div>
          <div class="p-6">
            <slot />
          </div>
          <div v-if="$slots.footer" class="border-t border-border px-6 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
