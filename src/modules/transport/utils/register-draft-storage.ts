import { z } from 'zod'
import { TRANSPORT_REGISTER_STEPS } from '@modules/transport/constants/routes'
import { sessionStorageHelper } from '@shared/utils/storage'

const STORAGE_KEY = 'ibble:transport-register-draft'
const DRAFT_VERSION = 1 as const
const DRAFT_TTL_MS = 12 * 60 * 60 * 1000

const registerDraftSchema = z.object({
  version: z.literal(DRAFT_VERSION),
  savedAt: z.number().int().positive(),
  currentStep: z
    .number()
    .int()
    .min(0)
    .max(TRANSPORT_REGISTER_STEPS.length - 1),
  delivery: z.object({
    name: z.string().max(50),
    phone: z.string().max(15),
    countryCode: z.string().max(8),
    transportDate: z.string().max(32),
    transportTime: z.string().max(8),
    origin: z.string().max(255),
    destination: z.string().max(255),
    distanceKm: z.string().max(32),
  }),
  shipmentTypeId: z.enum(['small', 'medium', 'large', '']).catch(''),
  termsAccepted: z.boolean().catch(false),
})

export type TransportRegisterDraft = z.infer<typeof registerDraftSchema>

function isExpired(savedAt: number): boolean {
  return Date.now() - savedAt > DRAFT_TTL_MS
}

export function saveRegisterDraft(
  draft: Omit<TransportRegisterDraft, 'version' | 'savedAt'>,
): void {
  const payload: TransportRegisterDraft = {
    ...draft,
    version: DRAFT_VERSION,
    savedAt: Date.now(),
  }

  const parsed = registerDraftSchema.safeParse(payload)
  if (!parsed.success) return

  sessionStorageHelper.set(STORAGE_KEY, parsed.data)
}

export function readRegisterDraft(): TransportRegisterDraft | null {
  const raw = sessionStorageHelper.get<unknown>(STORAGE_KEY)
  if (raw == null) return null

  const parsed = registerDraftSchema.safeParse(raw)
  if (!parsed.success || isExpired(parsed.data.savedAt)) {
    clearRegisterDraft()
    return null
  }

  return parsed.data
}

export function clearRegisterDraft(): void {
  sessionStorageHelper.remove(STORAGE_KEY)
}
