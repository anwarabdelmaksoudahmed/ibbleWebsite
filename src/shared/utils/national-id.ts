/** Accepted national ID length range (digits only). */
export const NATIONAL_ID_MIN_LENGTH = 10
export const NATIONAL_ID_MAX_LENGTH = 14

export type NationalIdIssue =
  | 'required'
  | 'digits'
  | 'min'
  | 'max'

const ISSUE_MESSAGES: Record<NationalIdIssue, string> = {
  required: 'auth.validation.nationalIdRequired',
  digits: 'auth.validation.nationalIdDigits',
  min: 'auth.validation.nationalIdMin',
  max: 'auth.validation.nationalIdMax',
}

/** Keep digits only and cap at the max allowed length. */
export function sanitizeNationalIdInput(value: string | number): string {
  return String(value).replace(/\D/g, '').slice(0, NATIONAL_ID_MAX_LENGTH)
}

/**
 * Returns the first validation issue for a national ID, or `null` when valid.
 * Checks are ordered so the user always sees the most actionable message.
 */
export function getNationalIdIssue(value: string): NationalIdIssue | null {
  const trimmed = value.trim()

  if (!trimmed) return 'required'
  if (!/^\d+$/.test(trimmed)) return 'digits'
  if (trimmed.length < NATIONAL_ID_MIN_LENGTH) return 'min'
  if (trimmed.length > NATIONAL_ID_MAX_LENGTH) return 'max'

  return null
}

export function isValidNationalId(value: string): boolean {
  return getNationalIdIssue(value) === null
}

/** i18n key for the first failing national ID check. */
export function getNationalIdErrorMessage(value: string): string | undefined {
  const issue = getNationalIdIssue(value)
  return issue ? ISSUE_MESSAGES[issue] : undefined
}
