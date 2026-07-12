import type {
  LoginApiResponse,
  LoginApiResponseV1,
  LoginApiUserDto,
  LoginApiRoleDto,
  RefreshTokenApiResponse,
} from '@modules/auth/types/api.types'
import type { InternalAuthModel, RefreshToken, Role, Session, Token, User } from '@modules/auth/types/internal.types'

function isLegacyResponse(response: LoginApiResponse): response is LoginApiResponseV1 {
  return (
    'data' in response &&
    'meta' in response &&
    response.meta !== undefined &&
    'token' in response.meta &&
    !('access_token' in response)
  )
}

function mapUser(dto: LoginApiUserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    nationalId: dto.national_id,
    phone: dto.phone,
    countryCode: dto.country_code,
    email: dto.email,
    avatar: dto.avatar,
    preferredDateType: dto.preferred_date_type,
    status: dto.status,
    address: dto.address,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

function mapRole(dto: LoginApiRoleDto): Role {
  return {
    appName: dto.app_name,
    name: dto.role,
  }
}

function resolveExpiresAt(explicit?: string, expiresIn?: number | null): string | null {
  if (explicit) return explicit
  if (typeof expiresIn === 'number') return new Date(Date.now() + expiresIn * 1000).toISOString()
  return null
}

function buildToken(accessToken: string, expiresAt: string | null, expiresIn: number | null): Token {
  return { accessToken, expiresAt, expiresIn }
}

function buildRefreshToken(token: string | undefined, expiresAt: string | null, expiresIn: number | null): RefreshToken | null {
  if (!token) return null
  return { token, expiresAt, expiresIn }
}

function mapLegacyResponse(response: LoginApiResponseV1): InternalAuthModel {
  const accessToken = response.meta.token
  const sessionExpiresAt = resolveExpiresAt(response.meta.session_expire_at, response.meta.expires_in ?? null)
  const refreshExpiresAt = resolveExpiresAt(undefined, response.meta.refresh_expires_in ?? null)

  const session: Session = {
    accessToken: buildToken(accessToken, sessionExpiresAt, response.meta.expires_in ?? null),
    refreshToken: buildRefreshToken(response.meta.refresh_token, refreshExpiresAt, response.meta.refresh_expires_in ?? null),
  }

  return {
    user: mapUser(response.data.user),
    session,
    roles: response.data.roles.map(mapRole),
    permissions: response.data.permissions,
  }
}

function mapTokenPairResponse(response: LoginApiResponse): InternalAuthModel {
  const accessTokenValue = 'access_token' in response ? response.access_token : ''
  const refreshTokenValue = 'refresh_token' in response ? response.refresh_token : response.meta?.refresh_token
  const sessionExpiresAt = resolveExpiresAt(
    ('session_expire_at' in response ? response.session_expire_at : undefined) ?? response.meta?.session_expire_at,
    ('expires_in' in response ? response.expires_in : undefined) ?? response.meta?.expires_in,
  )
  const refreshExpiresAt = resolveExpiresAt(undefined, response.meta?.refresh_expires_in ?? ('refresh_expires_in' in response ? response.refresh_expires_in : undefined))

  const userDto = response.data?.user ?? ('user' in response ? response.user : undefined)
  const rolesDto = response.data?.roles ?? ('roles' in response ? response.roles : [])
  const permissions = response.data?.permissions ?? ('permissions' in response ? response.permissions : [])

  if (!userDto) {
    throw new Error('Login response is missing user data')
  }

  const session: Session = {
    accessToken: buildToken(
      accessTokenValue,
      sessionExpiresAt,
      ('expires_in' in response ? response.expires_in : undefined) ?? response.meta?.expires_in ?? null,
    ),
    refreshToken: buildRefreshToken(
      refreshTokenValue,
      refreshExpiresAt,
      response.meta?.refresh_expires_in ?? ('refresh_expires_in' in response ? response.refresh_expires_in ?? null : null),
    ),
  }

  return {
    user: mapUser(userDto),
    session,
    roles: (rolesDto ?? []).map(mapRole),
    permissions: permissions ?? [],
  }
}

export function mapLoginApiResponse(response: LoginApiResponse): InternalAuthModel {
  if (isLegacyResponse(response)) {
    return mapLegacyResponse(response)
  }
  return mapTokenPairResponse(response)
}

export function mapRefreshTokenApiResponse(response: RefreshTokenApiResponse): Pick<InternalAuthModel, 'session'> {
  const accessToken =
    response.access_token ??
    response.token ??
    response.data?.access_token ??
    response.data?.token ??
    response.meta?.token

  if (!accessToken) {
    throw new Error('Refresh response is missing access token')
  }

  const refreshToken =
    response.refresh_token ??
    response.data?.refresh_token ??
    response.meta?.refresh_token

  const sessionExpiresAt = resolveExpiresAt(
    response.session_expire_at ?? response.data?.session_expire_at ?? response.meta?.session_expire_at,
    response.expires_in ?? response.data?.expires_in ?? response.meta?.expires_in,
  )

  const refreshExpiresAt = resolveExpiresAt(
    undefined,
    response.refresh_expires_in ?? response.data?.refresh_expires_in ?? response.meta?.refresh_expires_in,
  )

  return {
    session: {
      accessToken: buildToken(
        accessToken,
        sessionExpiresAt,
        response.expires_in ?? response.data?.expires_in ?? response.meta?.expires_in ?? null,
      ),
      refreshToken: buildRefreshToken(
        refreshToken,
        refreshExpiresAt,
        response.refresh_expires_in ?? response.data?.refresh_expires_in ?? response.meta?.refresh_expires_in ?? null,
      ),
    },
  }
}

export function mapCurrentUserApiResponse(dto: LoginApiUserDto): User {
  return mapUser(dto)
}
