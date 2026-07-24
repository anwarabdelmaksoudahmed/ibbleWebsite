import { z } from 'zod'

const coordSchema = z
  .number({
    required_error: 'site.transport.register.validation.locationRequired',
    invalid_type_error: 'site.transport.register.validation.locationRequired',
  })
  .finite('site.transport.register.validation.locationRequired')

export const transportDeliverySchema = z.object({
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
  transportDate: z
    .string()
    .trim()
    .min(1, 'site.transport.register.validation.transportDateRequired')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'site.transport.register.validation.transportDateInvalid'),
  transportTime: z
    .string()
    .trim()
    .min(1, 'site.transport.register.validation.transportTimeRequired')
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'site.transport.register.validation.transportTimeInvalid'),
  origin: z
    .string()
    .trim()
    .min(2, 'site.transport.register.validation.originMin')
    .max(255, 'site.transport.register.validation.originMax'),
  destination: z
    .string()
    .trim()
    .min(2, 'site.transport.register.validation.destinationMin')
    .max(255, 'site.transport.register.validation.destinationMax'),
  distanceKm: z
    .string()
    .trim()
    .min(1, 'site.transport.register.validation.distanceRequired')
    .regex(/^\d+(\.\d{1,2})?$/, 'site.transport.register.validation.distanceInvalid')
    .refine((value) => Number(value) > 0, 'site.transport.register.validation.distanceInvalid'),
  originLat: coordSchema,
  originLng: coordSchema,
  destinationLat: coordSchema,
  destinationLng: coordSchema,
})

export const transportShipmentTypeSchema = z.object({
  shipmentTypeId: z
    .string()
    .trim()
    .min(1, 'site.transport.register.validation.shipmentTypeRequired'),
})

export const transportPaymentSchema = z.object({
  termsAccepted: z.boolean().refine((value) => value === true, {
    message: 'site.transport.register.validation.termsRequired',
  }),
})

/** Form state allows null coords until the user picks a place from autocomplete. */
export type TransportDeliveryFormValues = {
  name: string
  phone: string
  countryCode: string
  transportDate: string
  transportTime: string
  origin: string
  destination: string
  distanceKm: string
  originLat: number | null
  originLng: number | null
  destinationLat: number | null
  destinationLng: number | null
}

export type TransportShipmentTypeFormValues = z.infer<typeof transportShipmentTypeSchema>
export type TransportPaymentFormValues = z.infer<typeof transportPaymentSchema>

export type TransportDeliveryField = keyof TransportDeliveryFormValues
