import { expect, type Page } from '@playwright/test'

// Barra de navegación compartida, presente en todas las rutas autenticadas
// (confirmada en TEST_PLAN.md seccion 2, "Shared nav").
export class MenuPage {
  constructor(private readonly page: Page) {}

  private get banner() {
    return this.page.getByRole('banner')
  }

  private get logoutButton() {
    return this.page.getByRole('button', { name: 'Logout' })
  }

  get catalogLink() {
    return this.page.getByRole('link', { name: 'Catalog' })
  }

  get checkoutLink() {
    return this.page.getByRole('link', { name: 'Checkout' })
  }

  get profileLink() {
    return this.page.getByRole('link', { name: 'Profile' })
  }

  async expectLoggedInAs(username: string): Promise<void> {
    await expect(this.banner.getByText(username, { exact: true })).toBeVisible()
  }

  async logout(): Promise<void> {
    await this.logoutButton.click()
  }
}
