import { debounce as lodashDebounce, throttle as lodashThrottle } from 'lodash-es'

export const debounce = lodashDebounce
export const throttle = lodashThrottle

export function useDebounceFn<T extends (...args: never[]) => unknown>(
  fn: T,
  delay = 300,
): (...args: Parameters<T>) => void {
  return lodashDebounce(fn, delay)
}
