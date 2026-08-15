import { expect, type Page } from '@playwright/test'
import { BasePage } from '../../core/BasePage'

export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  protected get path(): string {
    return '/'
  }

  private get usernameInput() {
    return this.page.getByLabel('Username')
  }

  private get passwordInput() {
    return this.page.getByLabel('Password')
  }

  private get signInButton() {
    return this.page.getByRole('button', { name: 'Sign In' })
  }

  private get loginErrorAlert() {
    return this.page.getByRole('alert')
  }

  private quickLoginButton(persona: string) {
    return this.page.getByRole('button', { name: persona, exact: true })
  }

  async expectLoaded(): Promise<void> {
    await expect(this.usernameInput).toBeVisible()
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.signInButton.click()
  }

  async quickLoginAs(persona: string): Promise<void> {
    await this.quickLoginButton(persona).click()
    await this.signInButton.click()
  }

  async expectLoginError(message: string): Promise<void> {
    await expect(this.loginErrorAlert).toHaveText(message)
  }
}
