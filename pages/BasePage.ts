import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage — the parent class every page object extends.
 * Holds shared behavior so we never duplicate common logic.
 *
 * This is the "Don't Repeat Yourself" (DRY) layer of the framework.
 */
export class BasePage {
  // 'readonly' = TypeScript prevents reassignment after construction.
  // 'protected' = accessible in this class AND subclasses, but not from tests.
  //   (Compare: 'private' = this class only, 'public' = anywhere)
  protected readonly page: Page;

  /**
   * The constructor runs when you write: new LoginPage(page)
   * It receives Playwright's page object and stores it for all methods to use.
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a path relative to baseURL from playwright.config.ts.
   * Because baseURL is set, goto('/inventory.html') resolves to
   * https://www.saucedemo.com/inventory.html
   */
  async navigate(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Get the current page title.
   * Promise<string> means: this is async, and it eventually returns a string.
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the current URL.
   * Note: page.url() is synchronous — no await needed inside.
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for the page to finish loading network activity.
   * Useful for SPAs (React/Next.js) where the URL changes before content renders.
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a named screenshot into test-results/.
   * Wrapping this here means every page gets it for free.
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Safe visibility check that returns a boolean instead of throwing.
   *
   * Why the try/catch? isVisible() can throw if the element doesn't exist
   * at all. This wrapper always returns true/false, which is what you want
   * for conditional logic like: if (await page.isElementVisible(banner)) { ... }
   */
  async isElementVisible(locator: Locator, timeout: number = 5000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
}