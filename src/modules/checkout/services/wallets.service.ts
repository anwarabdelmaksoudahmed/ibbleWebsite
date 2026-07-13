import { WalletsApi } from '@modules/checkout/api/wallets.api'
import type { UserWallet } from '@modules/checkout/types'
import { mapWallets } from '@modules/checkout/utils/mappers'

export class WalletsService {
  private readonly api: WalletsApi

  constructor(api?: WalletsApi) {
    if (api) {
      this.api = api
      return
    }

    const config = useRuntimeConfig()
    const baseUrl = (config.public.webApiBaseUrl as string) || 'https://api-web.ibbil.com/api'
    this.api = new WalletsApi(baseUrl)
  }

  async list(): Promise<UserWallet[]> {
    const response = await this.api.list()
    return mapWallets(response)
  }
}

let walletsService: WalletsService | null = null

export function getWalletsService(): WalletsService {
  if (!walletsService) {
    walletsService = new WalletsService()
  }
  return walletsService
}
