import type { RegisterCredentials } from '@modules/auth/types'

const STORAGE_KEY = 'ibble_pending_registration'

export type PendingRegistration = RegisterCredentials & {
  createdAt: string
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'
}

export function savePendingRegistration(credentials: RegisterCredentials): void {
  if (!canUseStorage()) return

  const payload: PendingRegistration = {
    ...credentials,
    createdAt: new Date().toISOString(),
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function readPendingRegistration(): PendingRegistration | null {
  if (!canUseStorage()) return null

  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as PendingRegistration
    if (!parsed?.phone || !parsed?.password || !parsed?.name) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPendingRegistration(): void {
  if (!canUseStorage()) return
  sessionStorage.removeItem(STORAGE_KEY)
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return phone
  const visible = digits.slice(-3)
  return `${'*'.repeat(Math.max(digits.length - 3, 3))}${visible}`
}
