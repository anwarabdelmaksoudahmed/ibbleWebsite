import { z } from 'zod'
import { getNationalIdErrorMessage } from '@shared/utils/national-id'

/**
 * National ID field schema with granular, actionable error messages:
 * required → digits only → too short → too long.
 */
export const nationalIdSchema = z.string().trim().superRefine((value, ctx) => {
  const message = getNationalIdErrorMessage(value)
  if (!message) return

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message,
  })
})
