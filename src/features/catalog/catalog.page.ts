import { expect, type Page } from '@playwright/test'
import { BasePage } from '../../core/BasePage'

export class CatalogPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  protected get path(): string {
    return '/catalog'
  }

  get pizzaCards() {
    return this.page.getByRole('button', { name: /^Add to cart:/ })
  }

  addToCartButton(pizzaName: string) {
    return this.page.getByRole('button', { name: `Add to cart: ${pizzaName}` })
  }

  private get customizeAddToCartButton() {
    return this.page.getByRole('dialog').getByRole('button', { name: 'Add to Cart' })
  }

  private get cartCheckoutButton() {
    return this.page.getByRole('button', { name: 'Checkout Now' })
  }

  async expectLoaded(): Promise<void> {
    await expect(this.pizzaCards.first()).toBeVisible()
  }

  async openCustomizeModal(pizzaName: string): Promise<void> {
    await this.addToCartButton(pizzaName).click()
  }

  async confirmAddToCartFromModal(): Promise<void> {
    await this.customizeAddToCartButton.click()
  }

  async expectCheckoutReady(): Promise<void> {
    await expect(this.cartCheckoutButton).toBeEnabled()
  }
}
