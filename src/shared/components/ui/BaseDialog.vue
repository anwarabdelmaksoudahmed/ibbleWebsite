<script setup lang="ts">
import type { ComponentVariant } from '@shared/types/ui'

export type BaseDialogProps = {
  open: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: ComponentVariant
  loading?: boolean
}

const props = withDefaults(defineProps<BaseDialogProps>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'primary',
  loading: false,
})

const emit = defineEmits<{ confirm: []; cancel: []; 'update:open': [value: boolean] }>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
  emit('update:open', false)
}
</script>

<template>
  <BaseModal :open="open" :title="title" size="sm" @close="handleCancel" @update:open="emit('update:open', $event)">
    <p v-if="message" class="text-sm text-foreground-muted">{{ message }}</p>
    <slot />
    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton variant="ghost" :disabled="loading" @click="handleCancel">{{ cancelText }}</BaseButton>
        <BaseButton :variant="variant" :loading="loading" @click="handleConfirm">{{ confirmText }}</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
