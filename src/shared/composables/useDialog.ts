export type DialogOptions = {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'warning'
}

const isOpen = ref(false)
const options = ref<DialogOptions | null>(null)
let resolvePromise: ((value: boolean) => void) | null = null

/**
 * App-wide confirm dialog state (singleton), same pattern as useToast.
 * Mount `<BaseConfirmDialog />` once in app.vue.
 */
export function useDialog() {
  function confirm(dialogOptions: DialogOptions): Promise<boolean> {
    options.value = dialogOptions
    isOpen.value = true

    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve
    })
  }

  function handleConfirm() {
    isOpen.value = false
    resolvePromise?.(true)
    resolvePromise = null
    options.value = null
  }

  function handleCancel() {
    isOpen.value = false
    resolvePromise?.(false)
    resolvePromise = null
    options.value = null
  }

  return {
    isOpen: readonly(isOpen),
    options: readonly(options),
    confirm,
    handleConfirm,
    handleCancel,
  }
}
