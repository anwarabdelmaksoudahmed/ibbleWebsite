/** Raw API request shape — matches backend contract */
export type LoginApiRequest = {
  user: string
  password: string
  country_code: string
  /** Web FCM token so backend can bind this browser device on login */
  fcm_token?: string
  device_type?: string
  device_id?: string
}

/** PATCH /v1/fcm-tokens — multi-device aware payload */
export type UpdateFcmTokenApiPayload = {
  fcm_token: string
  device_type: string
  device_id: string
}

export type LoginApiUserDto = {
  id: string
  name: string
  national_id: string
  phone: string
  country_code: string
  email: string
  avatar: string | null
  preferred_date_type: string
  status: string
  address: string | null
  created_at: string
  updated_at: string
}

export type SignupApiRequest = {
  name: string
  phone: string
  country_code: string
  password: string
  confirm_password: string
  national_id?: string
  email?: string
  avatar?: string
  status?: string
  address?: string
  otp?: string
  otp_created_at?: string
  preferred_date_type?: string
}

export type SignupApiResponse = {
  message?: string
  data?: LoginApiUserDto
}

export type LoginApiRoleDto = {
  app_name: string
  role: string
}

/** Current SSO login response (v1) */
export type LoginApiResponseV1 = {
  message: string
  data: {
    user: LoginApiUserDto
    roles: LoginApiRoleDto[]
    permissions: string[]
  }
  meta: {
    token: string
    session_expire_at: string
    refresh_token?: string
    expires_in?: number
    refresh_expires_in?: number
  }
}

/** Anticipated token-pair response (v2) */
export type LoginApiResponseV2 = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  refresh_expires_in?: number
  session_expire_at?: string
  user?: LoginApiUserDto
  roles?: LoginApiRoleDto[]
  permissions?: string[]
  data?: {
    user: LoginApiUserDto
    roles: LoginApiRoleDto[]
    permissions: string[]
  }
  meta?: {
    token?: string
    session_expire_at?: string
    refresh_token?: string
    expires_in?: number
    refresh_expires_in?: number
  }
}

export type LoginApiResponse = LoginApiResponseV1 | LoginApiResponseV2

export type RefreshTokenApiResponse = {
  access_token?: string
  token?: string
  refresh_token?: string
  expires_in?: number
  refresh_expires_in?: number
  session_expire_at?: string
  message?: string
  data?: {
    token?: string
    access_token?: string
    refresh_token?: string
    expires_in?: number
    refresh_expires_in?: number
    session_expire_at?: string
  }
  meta?: {
    token?: string
    session_expire_at?: string
    refresh_token?: string
    expires_in?: number
    refresh_expires_in?: number
  }
}

export type CurrentUserApiResponse = LoginApiUserDto | { data: LoginApiUserDto }
