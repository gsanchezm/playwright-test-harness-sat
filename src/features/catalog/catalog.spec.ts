import { test } from '../../shared/fixtures'

test.describe('Catalog', () => {
  test('standard_user sees pizza cards after logging in @smoke', async ({ catalogFlow }) => {
    await catalogFlow.loginAndOpenCatalog('standard_user', 'pizza123')

    await catalogFlow.expectCatalogLoaded()
  })

  test('adding a pizza via the customize modal makes checkout available @smoke', async ({ catalogFlow }) => {
    await catalogFlow.loginAndOpenCatalog('standard_user', 'pizza123')
    await catalogFlow.expectCatalogLoaded()

    await catalogFlow.addPizzaToCart('Margherita')

    await catalogFlow.expectCartReadyToCheckout()
  })
})
