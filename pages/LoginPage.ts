import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage — models https://www.saucedemo.com login screen.
 * 'extends BasePage' means it inherits navigate(), getTitle(), etc.
 */
export class LoginPage extends BasePage {
  // ── LOCATORS ────────────────────────────────────────────
  // Declared as readonly Locator properties.
  // IMPORTANT: Locators are LAZY — creating one does NOT query the DOM.
  // The query happens only when you call .click(), .fill(), etc.
  // This is why we can safely define them all in the constructor.
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    // super(page) calls BasePage's constructor, which sets this.page.
    // MUST be called before using 'this' — TypeScript enforces this.
    super(page);

    // Preference order: getByPlaceholder/getByRole > getByTestId > CSS
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton   = page.getByRole('button', { name: 'Login' });

    // SauceDemo doesn't expose good roles for the error, so CSS is justified here.
    this.errorMessage      = page.locator('[data-test="error"]');
    this.errorCloseButton  = page.locator('.error-button');
  }

  // ── ACTIONS ─────────────────────────────────────────────

  /** Open the login page. */
  async goto(): Promise<void> {
    await this.navigate('/');   // inherited from BasePage
  }

  /**
   * Perform a full login.
   *
   * This is the "coarse-grained" method tests will use 95% of the time.
   * One line in the test replaces four lines of interaction.
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Login using credentials from .env — the standard happy path.
   *
   * The '!' after the env var is TypeScript's non-null assertion.
   * process.env.X is typed 'string | undefined'; '!' tells the compiler
   * "trust me, this exists." Use sparingly — see the tip below.
   */
  async loginAsStandardUser(): Promise<void> {
    await this.login(process.env.STANDARD_USER!, process.env.USER_PASSWORD!);
  }

  /** Fine-grained methods — for tests that need partial interaction. */
  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async dismissError(): Promise<void> {
    await this.errorCloseButton.click();
  }

  // ── QUERIES (return data, don't assert) ─────────────────

  /**
   * Return the error text.
   * Returns '' instead of null so callers don't need null checks.
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }

  async isErrorVisible(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage, 3000);
  }

  // ── VERIFICATION HELPERS ────────────────────────────────
  // These wrap common multi-step assertions. Tests can still write
  // their own expect() calls — these are conveniences, not replacements.

  async expectLoginPageLoaded(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async expectErrorMessage(expectedText: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }
}