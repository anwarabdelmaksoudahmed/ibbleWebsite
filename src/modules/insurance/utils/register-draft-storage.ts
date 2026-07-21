import { z } from 'zod'
import { INSURANCE_REGISTER_STEPS } from '@modules/insurance/constants/routes'
import { NATIONAL_ID_MAX_LENGTH } from '@shared/utils/national-id'
import { sessionStorageHelper } from '@shared/utils/storage'

const STORAGE_KEY = 'ibble:insurance-register-draft'
const DRAFT_VERSION = 2 as const
/** Drafts older than this are discarded (PII hygiene). */
const DRAFT_TTL_MS = 12 * 60 * 60 * 1000

const draftCargoItemSchema = z.object({
  id: z.string().min(1).max(64),
  serialNumber: z.string().max(64),
  cargoValue: z.string().max(32),
  status: z.literal('ready'),
})

const registerDraftSchema = z.object({
  version: z.literal(DRAFT_VERSION),
  savedAt: z.number().int().positive(),
  currentStep: z
    .number()
    .int()
    .min(0)
    .max(INSURANCE_REGISTER_STEPS.length - 1),
  customer: z.object({
    nationalId: z.string().max(NATIONAL_ID_MAX_LENGTH),
    name: z.string().max(50),
    phone: z.string().max(15),
    countryCode: z.string().max(8),
    email: z.string().max(254),
    address: z.string().max(500),
  }),
  shipment: z.object({
    items: z.array(draftCargoItemSchema).max(100),
    transportDate: z.string().max(32),
    origin: z.string().max(255),
    destination: z.string().max(255),
    distanceKm: z.string().max(32),
  }),
  cargoDraft: z.object({
    serialNumber: z.string().max(64),
    cargoValue: z.string().max(32),
  }),
  editingCargoId: z.string().max(64).nullable(),
  selectedProviderId: z.number().int().positive().nullable(),
  /** Declarations are never persisted — user must re-confirm on resume. */
  payment: z.object({
    iban: z.string().max(34),
    paymentMethod: z.enum(['card', 'wallet', '']),
  }),
})

export type InsuranceRegisterDraft = z.infer<typeof registerDraftSchema>

function isExpired(savedAt: number): boolean {
  return Date.now() - savedAt > DRAFT_TTL_MS
}

export function saveRegisterDraft(draft: Omit<InsuranceRegisterDraft, 'version' | 'savedAt'>): void {
  const payload: InsuranceRegisterDraft = {
    ...draft,
    version: DRAFT_VERSION,
    savedAt: Date.now(),
  }

  const parsed = registerDraftSchema.safeParse(payload)
  if (!parsed.success) return

  sessionStorageHelper.set(STORAGE_KEY, parsed.data)
}

export function readRegisterDraft(): InsuranceRegisterDraft | null {
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
