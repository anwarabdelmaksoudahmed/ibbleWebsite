export function useModal<T = unknown>() {
  const isOpen = ref(false)
  const data = ref<T | null>(null)

  function open(payload?: T) {
    isOpen.value = true
    data.value = payload ?? null
  }

  function close() {
    isOpen.value = false
    data.value = null
  }

  function toggle(payload?: T) {
    if (isOpen.value) close()
    else open(payload)
  }

  return {
    isOpen: readonly(isOpen),
    data: readonly(data),
    open,
    close,
    toggle,
  }
}
