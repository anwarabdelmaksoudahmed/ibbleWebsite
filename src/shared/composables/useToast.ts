import { APP_CONFIG } from '@shared/constants/app-config'
import { createId } from '@shared/utils/id'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type Toast = {
  id: string
  message: string
  type: ToastType
  duration: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  function show(message: string, type: ToastType = 'info', duration: number = APP_CONFIG.TOAST_DURATION_MS) {
    const id = createId()
    toasts.value.push({ id, message, type, duration })

    if (import.meta.client && duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }

    return id
  }

  function success(message: string, duration?: number) {
    return show(message, 'success', duration)
  }

  function error(message: string, duration?: number) {
    return show(message, 'error', duration)
  }

  function warning(message: string, duration?: number) {
    return show(message, 'warning', duration)
  }

  function info(message: string, duration?: number) {
    return show(message, 'info', duration)
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t: Toast) => t.id !== id)
  }

  function clear() {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    clear,
  }
}
