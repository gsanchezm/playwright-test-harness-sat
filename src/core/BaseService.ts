import type { APIRequestContext } from '@playwright/test'

// Template Method: subclases de feature definen los endpoints concretos,
// esta clase provee el request context compartido.
export abstract class BaseService {
  protected constructor(protected readonly request: APIRequestContext) {}
}
