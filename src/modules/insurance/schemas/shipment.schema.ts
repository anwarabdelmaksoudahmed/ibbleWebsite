import { z } from 'zod'

const positiveMoneyString = (requiredKey: string, invalidKey: string) =>
  z
    .string()
    .trim()
    .min(1, requiredKey)
    .regex(/^\d+(\.\d{1,2})?$/, invalidKey)
    .refine((value) => Number(value) > 0, invalidKey)

export const insuranceCargoDraftSchema = z.object({
  serialNumber: z
    .string()
    .trim()
    .min(1, 'site.insurance.register.validation.serialNumberRequired')
    .max(64, 'site.insurance.register.validation.serialNumberMax'),
  cargoValue: positiveMoneyString(
    'site.insurance.register.validation.cargoValueRequired',
    'site.insurance.register.validation.cargoValueInvalid',
  ),
})

export const insuranceCargoItemSchema = insuranceCargoDraftSchema.extend({
  id: z.string().min(1),
  status: z.literal('ready'),
})

export const insuranceShipmentSchema = z.object({
  items: z
    .array(insuranceCargoItemSchema)
    .min(1, 'site.insurance.register.validation.cargoItemsRequired'),
  transportDate: z
    .string()
    .trim()
    .min(1, 'site.insurance.register.validation.transportDateRequired')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'site.insurance.register.validation.transportDateInvalid'),
  origin: z
    .string()
    .trim()
    .min(2, 'site.insurance.register.validation.originMin')
    .max(100, 'site.insurance.register.validation.originMax'),
  destination: z
    .string()
    .trim()
    .min(2, 'site.insurance.register.validation.destinationMin')
    .max(100, 'site.insurance.register.validation.destinationMax'),
  distanceKm: z
    .string()
    .trim()
    .min(1, 'site.insurance.register.validation.distanceRequired')
    .regex(/^\d+(\.\d{1,2})?$/, 'site.insurance.register.validation.distanceInvalid')
    .refine((value) => Number(value) > 0, 'site.insurance.register.validation.distanceInvalid'),
})

export type InsuranceCargoDraftValues = z.infer<typeof insuranceCargoDraftSchema>
export type InsuranceCargoItem = z.infer<typeof insuranceCargoItemSchema>
export type InsuranceShipmentFormValues = z.infer<typeof insuranceShipmentSchema>

export type InsuranceShipmentTripField = Exclude<keyof InsuranceShipmentFormValues, 'items'>
