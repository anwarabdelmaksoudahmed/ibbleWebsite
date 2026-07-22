import { z } from 'zod'
import { REGEX } from '@shared/constants/regex'

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'site.contact.validation.nameRequired')
    .min(2, 'site.contact.validation.nameMin')
    .max(80, 'site.contact.validation.nameMax'),
  email: z
    .string()
    .trim()
    .min(1, 'site.contact.validation.emailRequired')
    .regex(REGEX.EMAIL, 'site.contact.validation.emailInvalid'),
  phone: z
    .string()
    .trim()
    .min(1, 'site.contact.validation.phoneRequired')
    .regex(/^\d{9,15}$/, 'site.contact.validation.phoneInvalid'),
  countryCode: z.string().min(1, 'site.contact.validation.countryCodeRequired'),
  subject: z
    .string()
    .trim()
    .min(1, 'site.contact.validation.subjectRequired')
    .min(3, 'site.contact.validation.subjectMin')
    .max(120, 'site.contact.validation.subjectMax'),
  message: z
    .string()
    .trim()
    .min(1, 'site.contact.validation.messageRequired')
    .min(10, 'site.contact.validation.messageMin')
    .max(1200, 'site.contact.validation.messageMax'),
})

export type ContactFormValues = z.infer<typeof contactSchema>
export type ContactFormField = keyof ContactFormValues
