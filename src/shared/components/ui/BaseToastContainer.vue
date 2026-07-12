<script setup lang="ts">
import type { ToastType } from '@shared/composables/useToast'

const { toasts, dismiss } = useToast()

const typeClasses: Record<ToastType, string> = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-danger/30 bg-danger/10 text-danger',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-info/30 bg-info/10 text-info',
}

const typeIcons: Record<ToastType, string> = {
  success: 'lucide:check-circle',
  error: 'lucide:x-circle',
  warning: 'lucide:alert-triangle',
  info: 'lucide:info',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed right-4 bottom-4 z-[100] flex flex-col gap-2" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm', typeClasses[toast.type]]"
          role="alert"
        >
          <Icon :name="typeIcons[toast.type]" class="size-5 shrink-0" />
          <p class="text-sm font-medium">{{ toast.message }}</p>
          <button
            type="button"
            class="ml-2 shrink-0 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
            @click="dismiss(toast.id)"
          >
            <Icon name="lucide:x" class="size-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
