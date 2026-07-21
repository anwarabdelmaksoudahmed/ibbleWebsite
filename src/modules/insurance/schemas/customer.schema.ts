import { z } from 'zod'
import { emailSchema } from '@shared/schemas/auth.schema'
import { nationalIdSchema } from '@shared/schemas/national-id.schema'

export const insuranceCustomerSchema = z.object({
  nationalId: nationalIdSchema,
  name: z
    .string()
    .trim()
    .min(2, 'auth.validation.nameMin')
    .max(50, 'auth.validation.usernameMax')
    .regex(/^[\p{L}\p{N}_.\-\s]+$/u, 'auth.validation.usernameInvalid'),
  phone: z
    .string()
    .trim()
    .min(1, 'auth.validation.phoneRequired')
    .regex(/^\d{9,15}$/, 'auth.validation.phoneInvalid'),
  countryCode: z.string().min(1, 'auth.validation.countryCodeRequired'),
  email: emailSchema,
  address: z.string().trim().min(5, 'site.insurance.register.validation.address'),
})

export type InsuranceCustomerFormValues = z.infer<typeof insuranceCustomerSchema>
