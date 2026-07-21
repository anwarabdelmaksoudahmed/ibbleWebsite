import { z } from 'zod'

export const veterinaryPaymentSchema = z
  .object({
    customerName: z.string().trim().min(2, 'site.veterinary.book.validation.customerNameMin'),
    customerPhone: z.string().trim().min(8, 'site.veterinary.book.validation.customerPhoneMin'),
    countryCode: z.string().trim().min(1, 'site.veterinary.book.validation.countryCodeRequired'),
    address: z.string().trim(),
    paymentMethod: z
      .string()
      .refine((value): value is 'card' | 'wallet' => value === 'card' || value === 'wallet', {
        message: 'site.veterinary.book.validation.paymentMethodRequired',
      }),
    requiresAddress: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.requiresAddress && value.address.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'site.veterinary.book.validation.addressMin',
        path: ['address'],
      })
    }
  })

export type VeterinaryPaymentField = 'customerName' | 'customerPhone' | 'countryCode' | 'address' | 'paymentMethod'

export type VeterinaryPaymentFormValues = {
  customerName: string
  customerPhone: string
  countryCode: string
  address: string
  paymentMethod: 'card' | 'wallet' | ''
}
