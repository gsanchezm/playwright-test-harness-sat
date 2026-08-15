import { expect, type Page } from '@playwright/test'
import { AuthPage } from './auth.page'
import { MenuPage } from '../../shared/MenuPage'

// El redirect post-login tarda hasta ~8s en pruebas manuales (posible cold
// start del backend en onrender.com); se da margen generoso en la espera.
const LOGIN_REDIRECT_TIMEOUT_MS = 20_000

export class AuthFlow {
  private readonly page: Page
  private readonly authPage: AuthPage
  private readonly menuPage: MenuPage

  constructor(page: Page) {
    this.page = page
    this.authPage = new AuthPage(page)
    this.menuPage = new MenuPage(page)
  }

  async loginWithCredentials(username: string, password: string): Promise<void> {
    await this.authPage.goto()
    await this.authPage.login(username, password)
  }

  async loginWithQuickLogin(persona: string): Promise<void> {
    await this.authPage.goto()
    await this.authPage.quickLoginAs(persona)
  }

  async expectRedirectedToCatalog(username: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/catalog$/, { timeout: LOGIN_REDIRECT_TIMEOUT_MS })
    await this.menuPage.expectLoggedInAs(username)
  }

  async expectLoginError(message: string): Promise<void> {
    await this.authPage.expectLoginError(message)
  }
}
