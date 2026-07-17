import { ROUTES } from '@shared/constants/routes'

export type HomeMarketplaceCategory = {
  key: string
  slug: string
  image: string
}

export const HOME_MARKETPLACE_CATEGORIES: HomeMarketplaceCategory[] = [
  { key: 'camel', slug: 'camel', image: '/images/market/camel.png' },
  { key: 'feed', slug: 'feed', image: '/images/market/feed.png' },
  { key: 'animalFood', slug: 'animal_food', image: '/images/market/animal-food.png' },
  { key: 'products', slug: 'camel_products', image: '/images/market/products.png' },
  { key: 'supplies', slug: 'camel_supplies', image: '/images/market/supplies.png' },
  { key: 'accessories', slug: 'camel_accessories', image: '/images/market/accessories.png' },
  { key: 'microchip', slug: 'electronic_chip', image: '/images/market/accessories.png' },
]

export function homeMarketplaceCategoryTo(slug: string) {
  return ROUTES.STORES.CATEGORY(slug)
}

const MARKETPLACE_CATEGORY_IMAGE_BY_SLUG = Object.fromEntries(
  HOME_MARKETPLACE_CATEGORIES.map((category) => [category.slug, category.image]),
) as Record<string, string>

const MARKETPLACE_CATEGORY_IMAGE_ALIASES: Record<string, string> = {
  camel_microchip: '/images/market/accessories.png',
}

export function marketplaceCategoryImageForSlug(slug: string): string | undefined {
  return MARKETPLACE_CATEGORY_IMAGE_BY_SLUG[slug] ?? MARKETPLACE_CATEGORY_IMAGE_ALIASES[slug]
}
