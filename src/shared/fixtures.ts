import { test as base, expect } from '@playwright/test'
import { AuthFlow } from '../features/auth/auth.flow'
import { AuthService } from '../features/auth/auth.service'

// Composition root de DI. Se amplía con fixtures de features
// a medida que se generan los slices desde TEST_PLAN.md.
interface Fixtures {
  authFlow: AuthFlow
  authService: AuthService
}

export const test = base.extend<Fixtures>({
  authFlow: async ({ page }, use) => {
    await use(new AuthFlow(page))
  },
  authService: async ({ request }, use) => {
    await use(new AuthService(request))
  },
})

export { expect }
