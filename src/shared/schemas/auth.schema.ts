import { z } from 'zod'
import { REGEX } from '@shared/constants/regex'

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .regex(REGEX.EMAIL, 'Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(REGEX.PASSWORD, 'Password must include uppercase, lowercase, number, and special character')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

export const phoneLoginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\d{9,15}$/, 'Enter a valid phone number'),
  countryCode: z.string().min(1, 'Country code is required'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const phoneRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\d{9,15}$/, 'Enter a valid phone number'),
    countryCode: z.string().min(1, 'Country code is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type PhoneLoginFormValues = z.infer<typeof phoneLoginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type PhoneRegisterFormValues = z.infer<typeof phoneRegisterSchema>
