import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema, registerSchema } from '@shared/schemas/auth.schema'

export const loginFormSchema = toTypedSchema(loginSchema)
export const registerFormSchema = toTypedSchema(registerSchema)
