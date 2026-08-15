import { test } from '../../shared/fixtures'
import personaCases from '../../shared/data/auth.json'
import type { AuthPersonaCase } from '../../shared/types'

const personas = personaCases as AuthPersonaCase[]

test.describe('Auth', () => {
  test('standard_user logs in via the form and lands on the catalog @smoke', async ({ authFlow }) => {
    await authFlow.loginWithCredentials('standard_user', 'pizza123')

    await authFlow.expectRedirectedToCatalog('standard_user')
  })

  for (const c of personas) {
    test(`quick login as ${c.persona} results in ${c.outcome}`, async ({ authFlow }) => {
      await authFlow.loginWithQuickLogin(c.persona)

      if (c.outcome === 'success') {
        await authFlow.expectRedirectedToCatalog(c.persona)
        return
      }

      await authFlow.expectLoginError(c.errorMessage ?? '')
    })
  }
})
