export async function copyToClipboard(text: string): Promise<boolean> {
  if (!import.meta.client) return false

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  }
}

export function downloadFile(data: Blob | string, filename: string, mimeType?: string): void {
  if (!import.meta.client) return

  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType ?? 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function uploadFile(
  file: File,
  url: string,
  onProgress?: (percent: number) => void,
): Promise<Response> {
  const formData = new FormData()
  formData.append('file', file)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      }
    }

    xhr.onload = () => {
      resolve(new Response(xhr.response, { status: xhr.status }))
    }
    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.send(formData)
  })
}
