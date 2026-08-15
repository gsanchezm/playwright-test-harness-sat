import { expect, type Page } from '@playwright/test'
import { BasePage } from '../../core/BasePage'

export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  protected get path(): string {
    return '/'
  }

  // Las etiquetas "Username"/"Password" no tienen asociación programática
  // (sin `for`/`id`/aria-*) con sus inputs, así que getByLabel nunca resuelve;
  // se usa el placeholder, que sí es estable (confirmado en TEST_PLAN.md).
  private get usernameInput() {
    return this.page.getByPlaceholder('standard_user')
  }

  private get passwordInput() {
    return this.page.getByPlaceholder('••••••••')
  }

  private get signInButton() {
    return this.page.getByRole('button', { name: 'Sign In' })
  }

  private get loginErrorAlert() {
    return this.page.getByRole('alert')
  }

  // La etiqueta visible ("Standard") no es el username ("standard_user");
  // solo coincide con el atributo title, que el nombre accesible ignora
  // cuando hay texto visible. Se usa el data-testid, que sí lo expone.
  private quickLoginButton(persona: string) {
    return this.page.getByTestId(`user-${persona}`)
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
