import type { APIRequestContext, APIResponse } from '@playwright/test'
import { BaseService } from '../../core/BaseService'
import { env } from '../../core/env'

export interface LoginCredentials {
  username: string
  password: string
}

export class AuthService extends BaseService {
  constructor(request: APIRequestContext) {
    super(request)
  }

  async login(credentials: LoginCredentials): Promise<APIResponse> {
    return this.request.post(`${env.apiUrl}/api/auth/login`, { data: credentials })
  }
}
