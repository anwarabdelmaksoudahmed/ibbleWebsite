import { z } from 'zod'
import { REGEX } from '@shared/constants/regex'
import { nationalIdSchema } from '@shared/schemas/national-id.schema'
import type { JoinProviderType } from '@modules/join/constants'

/** Messages are i18n keys resolved with `t()` at display time. */

const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'join.validation.nameMin')
  .max(50, 'join.validation.nameMax')

const phoneSchema = z
  .string()
  .trim()
  .min(1, 'join.validation.phoneRequired')
  .regex(/^\d{9,15}$/, 'join.validation.phoneInvalid')

const optionalPhoneSchema = z
  .string()
  .trim()
  .regex(/^\d{9,15}$/, 'join.validation.phoneInvalid')
  .or(z.literal(''))

const countryCodeSchema = z.string().min(1, 'join.validation.countryCodeRequired')

const emailSchema = z
  .string()
  .trim()
  .min(1, 'join.validation.emailRequired')
  .regex(REGEX.EMAIL, 'join.validation.emailInvalid')

const termsAcceptedSchema = z.literal(true, {
  errorMap: () => ({ message: 'join.validation.termsRequired' }),
})

export const joinMerchantSchema = z.object({
  ownerName: fullNameSchema,
  phone: phoneSchema,
  countryCode: countryCodeSchema,
  nationalId: nationalIdSchema,
  storeTypeId: z.string().min(1, 'join.validation.storeTypeRequired'),
  storeNameAr: z
    .string()
    .trim()
    .min(2, 'join.validation.storeNameMin')
    .max(100, 'join.validation.storeNameMax'),
  storeNameEn: z
    .string()
    .trim()
    .min(2, 'join.validation.storeNameMin')
    .max(100, 'join.validation.storeNameMax'),
  cityId: z.string().min(1, 'join.validation.cityRequired'),
  address: z
    .string()
    .trim()
    .min(5, 'join.validation.addressMin')
    .max(255, 'join.validation.addressMax'),
})

export const joinDriverSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  countryCode: countryCodeSchema,
  nationalId: nationalIdSchema,
  termsAccepted: termsAcceptedSchema,
})

export const joinCompanySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'join.validation.companyNameMin')
    .max(100, 'join.validation.companyNameMax'),
  companyAddress: z
    .string()
    .trim()
    .min(5, 'join.validation.addressMin')
    .max(255, 'join.validation.addressMax'),
  ownerName: fullNameSchema,
  phone: phoneSchema,
  countryCode: countryCodeSchema,
  nationalId: nationalIdSchema,
  termsAccepted: termsAcceptedSchema,
})

export const joinDoctorSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  countryCode: countryCodeSchema,
  otherPhone: optionalPhoneSchema,
  nationalId: nationalIdSchema,
  termsAccepted: termsAcceptedSchema,
})

export const joinClinicSchema = z.object({
  clinicName: z
    .string()
    .trim()
    .min(2, 'join.validation.clinicNameMin')
    .max(100, 'join.validation.clinicNameMax'),
  ownerName: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  countryCode: countryCodeSchema,
  otherPhone: optionalPhoneSchema,
  nationalId: nationalIdSchema,
  termsAccepted: termsAcceptedSchema,
})

export const JOIN_SCHEMAS: Record<JoinProviderType, z.ZodTypeAny> = {
  merchant: joinMerchantSchema,
  driver: joinDriverSchema,
  company: joinCompanySchema,
  doctor: joinDoctorSchema,
  clinic: joinClinicSchema,
}

export type JoinMerchantFormValues = z.infer<typeof joinMerchantSchema>
export type JoinDriverFormValues = z.infer<typeof joinDriverSchema>
export type JoinCompanyFormValues = z.infer<typeof joinCompanySchema>
export type JoinDoctorFormValues = z.infer<typeof joinDoctorSchema>
export type JoinClinicFormValues = z.infer<typeof joinClinicSchema>
