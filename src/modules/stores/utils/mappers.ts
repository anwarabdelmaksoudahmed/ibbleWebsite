import type { StoreCategoryApiDto } from '@modules/stores/types/api.types'
import type { StoreCategory } from '@modules/stores/types/internal.types'

export function mapStoreCategory(dto: StoreCategoryApiDto): StoreCategory {
  return {
    id: dto.id,
    name: dto.name,
    content: dto.content,
    description: dto.description,
    slug: dto.slug,
    logo: dto.logo,
    cover: dto.cover,
    commissionPercentage: dto.commission_percentage,
  }
}

export function mapStoreCategories(dtos: StoreCategoryApiDto[]): StoreCategory[] {
  return dtos.map(mapStoreCategory)
}
