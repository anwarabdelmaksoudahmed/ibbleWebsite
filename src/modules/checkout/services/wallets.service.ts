import { WalletsApi } from '@modules/checkout/api/wallets.api'
import type { UserWallet, WalletDetails, WalletTransactionsPage } from '@modules/checkout/types'
import type { WalletTransactionsQueryParams } from '@modules/checkout/types/api.types'
import {
  mapWalletDetails,
  mapWalletTransactionsPage,
  mapWallets,
} from '@modules/checkout/utils/mappers'

export class WalletsService {
  private readonly api: WalletsApi

  constructor(api?: WalletsApi) {
    if (api) {
      this.api = api
      return
    }

    const config = useRuntimeConfig()
    this.api = new WalletsApi(config.public.webApiBaseUrl as string)
  }

  async list(): Promise<UserWallet[]> {
    const response = await this.api.list()
    return mapWallets(response)
  }

  async getDetails(): Promise<WalletDetails | null> {
    const response = await this.api.list()
    return mapWalletDetails(response)
  }

  async listTransactions(
    params: WalletTransactionsQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<WalletTransactionsPage> {
    const source = params.source ?? 'wallet'

    if (source === 'card') {
      const response = await this.api.listCreditTransactions(params, options)
      return mapWalletTransactionsPage(response, 'card')
    }

    const response = await this.api.listTransactions(params, options)
    return mapWalletTransactionsPage(response, 'wallet')
  }
}

let walletsService: WalletsService | null = null

export function getWalletsService(): WalletsService {
  if (!walletsService) {
    walletsService = new WalletsService()
  }
  return walletsService
}
