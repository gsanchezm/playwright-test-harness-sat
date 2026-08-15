import type { Page } from '@playwright/test'

// Template Method: subclases definen `path` y `expectLoaded()`,
// esta clase provee la navegación común.
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  protected abstract get path(): string

  async goto(): Promise<void> {
    await this.page.goto(this.path, {waitUntil: 'domcontentloaded', timeout: 60_000})
  }

  abstract expectLoaded(): Promise<void>
}
