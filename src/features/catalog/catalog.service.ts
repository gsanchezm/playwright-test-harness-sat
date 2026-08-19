import type { APIRequestContext, APIResponse } from '@playwright/test'
import { BaseService } from '../../core/BaseService'
import { env } from '../../core/env'

export class CatalogService extends BaseService {
  constructor(request: APIRequestContext) {
    super(request)
  }

  async getPizzas(bearerToken: string | null, countryCode: string | null): Promise<APIResponse> {
    const headers: Record<string, string> = {}
    if (bearerToken !== null) {
      headers.Authorization = `Bearer ${bearerToken}`
    }
    if (countryCode !== null) {
      headers['X-Country-Code'] = countryCode
    }
    return this.request.get(`${env.apiUrl}/api/pizzas`, { headers })
  }
}
