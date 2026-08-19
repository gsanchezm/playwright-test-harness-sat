import type { Page } from '@playwright/test'
import { CatalogPage } from './catalog.page'
import { AuthFlow } from '../auth/auth.flow'

export class CatalogFlow {
  private readonly catalogPage: CatalogPage
  private readonly authFlow: AuthFlow

  constructor(page: Page) {
    this.catalogPage = new CatalogPage(page)
    this.authFlow = new AuthFlow(page)
  }

  async loginAndOpenCatalog(username: string, password: string): Promise<void> {
    await this.authFlow.loginWithCredentials(username, password)
    await this.authFlow.expectRedirectedToCatalog(username)
  }

  async expectCatalogLoaded(): Promise<void> {
    await this.catalogPage.expectLoaded()
  }

  async addPizzaToCart(pizzaName: string): Promise<void> {
    await this.catalogPage.openCustomizeModal(pizzaName)
    await this.catalogPage.confirmAddToCartFromModal()
  }

  async expectCartReadyToCheckout(): Promise<void> {
    await this.catalogPage.expectCheckoutReady()
  }
}
