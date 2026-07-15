import { z } from 'zod'
import { REGEX } from '@shared/constants/regex'

export const emailSchema = z
  .string()
  .min(1, 'auth.validation.emailRequired')
  .regex(REGEX.EMAIL, 'auth.validation.emailInvalid')

export const passwordSchema = z
  .string()
  .min(8, 'auth.validation.passwordMin')
  .regex(REGEX.PASSWORD, 'auth.validation.passwordStrength')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'auth.validation.passwordRequired'),
  remember: z.boolean().optional(),
})

export const phoneLoginSchema = z.object({
  phone: z
    .string()
    .min(1, 'auth.validation.phoneRequired')
    .regex(/^\d{9,15}$/, 'auth.validation.phoneInvalid'),
  countryCode: z.string().min(1, 'auth.validation.countryCodeRequired'),
  password: z.string().min(1, 'auth.validation.passwordRequired'),
  remember: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'auth.validation.nameMin'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'auth.validation.confirmPasswordRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.validation.passwordMismatch',
    path: ['confirmPassword'],
  })

export const phoneRegisterSchema = z
  .object({
    nationalId: z
      .string()
      .trim()
      .min(1, 'auth.validation.nationalIdRequired')
      .regex(/^\d{10,14}$/, 'auth.validation.nationalIdInvalid'),
    phone: z
      .string()
      .trim()
      .min(1, 'auth.validation.phoneRequired')
      .regex(/^\d{9,15}$/, 'auth.validation.phoneInvalid'),
    countryCode: z.string().min(1, 'auth.validation.countryCodeRequired'),
    name: z
      .string()
      .trim()
      .min(2, 'auth.validation.usernameMin')
      .max(50, 'auth.validation.usernameMax')
      .regex(/^[\p{L}\p{N}_.\-\s]+$/u, 'auth.validation.usernameInvalid'),
    email: emailSchema,
    password: z
      .string()
      .min(6, 'auth.validation.passwordMin6')
      .max(64, 'auth.validation.passwordMax'),
    confirmPassword: z.string().min(1, 'auth.validation.confirmPasswordRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.validation.passwordMismatch',
    path: ['confirmPassword'],
  })

export const otpSchema = z.object({
  otp: z
    .string()
    .min(1, 'auth.validation.otpRequired')
    .regex(/^\d{6}$/, 'auth.validation.otpInvalid'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type PhoneLoginFormValues = z.infer<typeof phoneLoginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type PhoneRegisterFormValues = z.infer<typeof phoneRegisterSchema>
export type OtpFormValues = z.infer<typeof otpSchema>
