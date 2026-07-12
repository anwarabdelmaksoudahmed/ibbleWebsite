const isClient = import.meta.client

export const storage = {
  get<T>(key: string, fallback?: T): T | undefined {
    if (!isClient) return fallback
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : fallback
    } catch {
      return fallback
    }
  },

  set<T>(key: string, value: T): void {
    if (!isClient) return
    localStorage.setItem(key, JSON.stringify(value))
  },

  remove(key: string): void {
    if (!isClient) return
    localStorage.removeItem(key)
  },

  clear(): void {
    if (!isClient) return
    localStorage.clear()
  },
}

export const sessionStorageHelper = {
  get<T>(key: string, fallback?: T): T | undefined {
    if (!isClient) return fallback
    try {
      const item = sessionStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : fallback
    } catch {
      return fallback
    }
  },

  set<T>(key: string, value: T): void {
    if (!isClient) return
    sessionStorage.setItem(key, JSON.stringify(value))
  },

  remove(key: string): void {
    if (!isClient) return
    sessionStorage.removeItem(key)
  },
}
