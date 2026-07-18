import { z } from 'zod'
import { isValidIban, normalizeIban } from '@shared/utils/iban'

export const INSURANCE_PAYMENT_METHODS = ['card', 'wallet'] as const

export type InsurancePaymentMethodId = (typeof INSURANCE_PAYMENT_METHODS)[number]

const ibanFieldSchema = z
  .string()
  .trim()
  .min(1, 'site.insurance.register.validation.ibanRequired')
  .refine(
    (value) => isValidIban(normalizeIban(value), 'SA'),
    'site.insurance.register.validation.ibanInvalid',
  )

const requiredAcceptanceSchema = (message: string) =>
  z.boolean().refine((value) => value === true, { message })

const paymentMethodSchema = z
  .string()
  .refine(
    (value): value is InsurancePaymentMethodId =>
      (INSURANCE_PAYMENT_METHODS as readonly string[]).includes(value),
    'site.insurance.register.validation.paymentMethodRequired',
  )

export const insurancePaymentSchema = z.object({
  iban: ibanFieldSchema,
  dataAccurate: requiredAcceptanceSchema(
    'site.insurance.register.validation.dataAccurateRequired',
  ),
  termsAccepted: requiredAcceptanceSchema(
    'site.insurance.register.validation.termsRequired',
  ),
  paymentMethod: paymentMethodSchema,
})

export const insurancePaymentFieldSchemas = {
  iban: ibanFieldSchema,
  dataAccurate: requiredAcceptanceSchema(
    'site.insurance.register.validation.dataAccurateRequired',
  ),
  termsAccepted: requiredAcceptanceSchema(
    'site.insurance.register.validation.termsRequired',
  ),
  paymentMethod: paymentMethodSchema,
} as const

export type InsurancePaymentFormValues = {
  iban: string
  dataAccurate: boolean
  termsAccepted: boolean
  paymentMethod: InsurancePaymentMethodId | ''
}

export type InsurancePaymentField = keyof InsurancePaymentFormValues
