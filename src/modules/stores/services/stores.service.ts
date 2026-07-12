import { BaseApiService } from '@core/api/base-service'
import { STORES_ENDPOINTS } from '@modules/stores/constants/endpoints'
import type { StoreCategoryApiDto } from '@modules/stores/types/api.types'
import type { StoreCategory } from '@modules/stores/types/internal.types'
import { mapStoreCategories } from '@modules/stores/utils/mappers'

export class StoresService extends BaseApiService {
  async listCategories(): Promise<StoreCategory[]> {
    const data = await this.get<StoreCategoryApiDto[]>(STORES_ENDPOINTS.CATEGORIES)
    return mapStoreCategories(data)
  }
}
