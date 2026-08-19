import { test as base, expect } from '@playwright/test'
import { AuthFlow } from '../features/auth/auth.flow'
import { AuthService } from '../features/auth/auth.service'
import { CatalogFlow } from '../features/catalog/catalog.flow'
import { CatalogService } from '../features/catalog/catalog.service'

// Composition root de DI. Se amplía con fixtures de features
// a medida que se generan los slices desde TEST_PLAN.md.
interface Fixtures {
  authFlow: AuthFlow
  authService: AuthService
  catalogFlow: CatalogFlow
  catalogService: CatalogService
}

export const test = base.extend<Fixtures>({
  authFlow: async ({ page }, use) => {
    await use(new AuthFlow(page))
  },
  authService: async ({ request }, use) => {
    await use(new AuthService(request))
  },
  catalogFlow: async ({ page }, use) => {
    await use(new CatalogFlow(page))
  },
  catalogService: async ({ request }, use) => {
    await use(new CatalogService(request))
  },
})

export { expect }
