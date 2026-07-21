import { ROUTES } from '@shared/constants/routes'

export const PROFILE_ROUTES = {
  ROOT: ROUTES.PROFILE,
  INSURANCE: `${ROUTES.PROFILE}/insurance`,
  MARKETPLACE: `${ROUTES.PROFILE}/marketplace`,
  WALLET: `${ROUTES.PROFILE}/wallet`,
  VETERINARY: `${ROUTES.PROFILE}/user-veterinary`,
  FAVOURITE: `${ROUTES.PROFILE}/favourite`,
} as const
