import { useDebounceFn } from '@shared/utils/debounce'

export function useDebounce<T>(value: Ref<T>, delay = 300) {
  const debounced = ref(value.value) as Ref<T>

  watch(value, useDebounceFn((newValue: T) => {
    debounced.value = newValue
  }, delay))

  return debounced
}
