/** Becomes true after client auth hydration — prevents commerce queries from racing Pinia persist. */
export function useAuthSessionReady() {
  return useState<boolean>('ibble-auth-session-ready', () => false)
}
