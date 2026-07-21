import { isApiError, normalizeApiError } from '@core/api/http/errors'

export class AuthError extends Error {
  statusCode: number
  code?: string
  fieldErrors?: Record<string, string[]>

  constructor(message: string, statusCode: number, fieldErrors?: Record<string, string[]>, code?: string) {
    super(message)
    this.name = 'AuthError'
    this.statusCode = statusCode
    this.fieldErrors = fieldErrors
    this.code = code
  }
}

export class AuthEndpointNotAvailableError extends AuthError {
  constructor(endpoint: string) {
    super(`Auth endpoint "${endpoint}" is not available yet`, 501, undefined, 'ENDPOINT_NOT_AVAILABLE')
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  401: 'Invalid credentials. Please check your phone number and password.',
  403: 'You do not have permission to sign in.',
  422: 'Please verify your input and try again.',
  500: 'Authentication service is temporarily unavailable.',
  408: 'The request timed out. Please try again.',
}

const SIGNUP_STATUS_MESSAGES: Record<number, string> = {
  401: 'An account with these details already exists and is inactive.',
  409: 'Password and confirm password do not match.',
  422: 'Account already exists or some fields are invalid.',
  500: 'Authentication service is temporarily unavailable.',
  408: 'The request timed out. Please try again.',
}

function resolveStatusError(
  error: unknown,
  statusMessages: Record<number, string>,
): AuthError {
  if (error instanceof AuthError) return error

  const apiError = normalizeApiError(error)

  if (apiError.statusCode === 0 || apiError.message.toLowerCase().includes('network')) {
    return new AuthError('Network error. Please check your connection.', 0)
  }

  if (apiError.message.toLowerCase().includes('timeout')) {
    return new AuthError(statusMessages[408] ?? apiError.message, 408)
  }

  return new AuthError(
    statusMessages[apiError.statusCode] ?? apiError.message,
    apiError.statusCode,
    apiError.errors,
    apiError.code,
  )
}

export function resolveAuthError(error: unknown): AuthError {
  return resolveStatusError(error, STATUS_MESSAGES)
}

export function resolveSignupError(error: unknown): AuthError {
  return resolveStatusError(error, SIGNUP_STATUS_MESSAGES)
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

export function isAuthEndpointNotAvailable(error: unknown): error is AuthEndpointNotAvailableError {
  return error instanceof AuthEndpointNotAvailableError
}

export function isUnauthorizedError(error: unknown): boolean {
  return isAuthError(error) ? error.statusCode === 401 : isApiError(error) && error.statusCode === 401
}
