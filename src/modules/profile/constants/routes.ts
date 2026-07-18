import { ROUTES } from '@shared/constants/routes'

export const PROFILE_ROUTES = {
  ROOT: ROUTES.PROFILE,
  INSURANCE: `${ROUTES.PROFILE}/insurance`,
  FAVOURITE: `${ROUTES.PROFILE}/favourite`,
} as const
