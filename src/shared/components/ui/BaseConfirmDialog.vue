<script setup lang="ts">
const dialog = useDialog()
</script>

<template>
  <BaseDialog
    v-if="dialog.options.value"
    :open="dialog.isOpen.value"
    :title="dialog.options.value.title"
    :message="dialog.options.value.message"
    :confirm-text="dialog.options.value.confirmText"
    :cancel-text="dialog.options.value.cancelText"
    :variant="dialog.options.value.variant ?? 'danger'"
    @confirm="dialog.handleConfirm"
    @cancel="dialog.handleCancel"
    @update:open="(v: boolean) => !v && dialog.handleCancel()"
  />
</template>
