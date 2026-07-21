const loadedScripts = new Map<string, Promise<void>>()

export function loadScript(src: string, id?: string): Promise<void> {
  const scriptId = id ?? src

  if (loadedScripts.has(scriptId)) {
    return loadedScripts.get(scriptId) as Promise<void>
  }

  const promise = new Promise<void>((resolve, reject) => {
    if (!import.meta.client) {
      reject(new Error('Scripts can only be loaded on the client'))
      return
    }

    const existing = document.getElementById(scriptId)
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })

  loadedScripts.set(scriptId, promise)
  return promise
}

export function removeScript(id: string): void {
  if (!import.meta.client) return

  const script = document.getElementById(id)
  script?.remove()
  loadedScripts.delete(id)
}

export function buildHyperPayScriptUrl(baseUrl: string, checkoutId: string): string {
  const url = new URL(baseUrl)
  url.searchParams.set('checkoutId', checkoutId)
  return url.toString()
}
