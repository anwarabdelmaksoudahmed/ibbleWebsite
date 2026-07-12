/** Raw API shape — matches marketplace `/stores-categories` contract */
export type StoreCategoryApiDto = {
  id: string
  name: string
  content: string
  description: string
  slug: string
  logo: string
  cover: string
  commission_percentage: number
}
