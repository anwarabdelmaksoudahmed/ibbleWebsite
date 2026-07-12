import type { PaginatedResponse } from '@core/types/api'
import { BaseApiService } from '@core/api/base-service'

export type CrudEndpoints = {
  list: string
  detail: (id: string | number) => string
}

export type CrudListResult<T> = {
  items: T[]
  total: number
  meta?: PaginatedResponse<T>['meta']
}

/**
 * Generic CRUD service for resource endpoints.
 * Domain services extend this and optionally override mappers.
 */
export abstract class CrudApiService<
  TItem,
  TDetail = TItem,
  TCreate = Partial<TDetail>,
  TUpdate = Partial<TDetail>,
> extends BaseApiService {
  protected abstract readonly endpoints: CrudEndpoints

  protected mapListItem(dto: unknown): TItem {
    return dto as TItem
  }

  protected mapDetail(dto: unknown): TDetail {
    return dto as TDetail
  }

  protected mapCreatePayload(payload: TCreate): unknown {
    return payload
  }

  protected mapUpdatePayload(payload: TUpdate): unknown {
    return payload
  }

  async list(params?: Record<string, unknown>): Promise<CrudListResult<TItem>> {
    const raw = await this.get<PaginatedResponse<unknown> | unknown[]>(this.endpoints.list, params)
    return this.normalizeList(raw)
  }

  async getById(id: string | number): Promise<TDetail> {
    const data = await this.get<unknown>(this.endpoints.detail(id))
    return this.mapDetail(data)
  }

  async create(payload: TCreate): Promise<TDetail> {
    const data = await this.post<unknown>(this.endpoints.list, this.mapCreatePayload(payload))
    return this.mapDetail(data)
  }

  async update(id: string | number, payload: TUpdate): Promise<TDetail> {
    const data = await this.put<unknown>(this.endpoints.detail(id), this.mapUpdatePayload(payload))
    return this.mapDetail(data)
  }

  async partialUpdate(id: string | number, payload: TUpdate): Promise<TDetail> {
    const data = await this.patch<unknown>(this.endpoints.detail(id), this.mapUpdatePayload(payload))
    return this.mapDetail(data)
  }

  async remove(id: string | number): Promise<void> {
    await this.delete(this.endpoints.detail(id))
  }

  private normalizeList(raw: PaginatedResponse<unknown> | unknown[]): CrudListResult<TItem> {
    if (Array.isArray(raw)) {
      return {
        items: raw.map((item) => this.mapListItem(item)),
        total: raw.length,
      }
    }

    return {
      items: (raw.data ?? []).map((item) => this.mapListItem(item)),
      total: raw.meta?.total ?? raw.data?.length ?? 0,
      meta: raw.meta,
    }
  }
}
