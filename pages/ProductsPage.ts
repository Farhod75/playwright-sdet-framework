import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly productItems: Locator;
  readonly sortDropdown: Locator;
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle    = page.locator('.title');
    this.productItems = page.locator('.inventory_item');   // matches MANY elements
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartIcon     = page.locator('.shopping_cart_link');
    this.cartBadge    = page.locator('.shopping_cart_badge');
    this.menuButton   = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink   = page.getByRole('link', { name: 'Logout' });
  }

  // ── ACTIONS ─────────────────────────────────────────────

  /**
   * Add a product to cart by its visible name.
   *
   * KEY PATTERN: filter() narrows a multi-element locator,
   * then .locator() drills into the matched item.
   * This is the correct way to act on "the row that says X".
   */
  async addProductToCart(productName: string): Promise<void> {
    const product = this.productItems.filter({ hasText: productName });
    await product.getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeProductFromCart(productName: string): Promise<void> {
    const product = this.productItems.filter({ hasText: productName });
    await product.getByRole('button', { name: 'Remove' }).click();
  }

  /**
   * Sort products.
   *
   * The union type 'az' | 'za' | 'lohi' | 'hilo' means only these four
   * strings are allowed. Typing sortBy('cheap') is a COMPILE ERROR.
   * This is TypeScript preventing bugs before you run anything.
   */
  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async goToCart(): Promise<void> {
    await this.cartIcon.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }

  // ── QUERIES ─────────────────────────────────────────────

  async getProductCount(): Promise<number> {
    return await this.productItems.count();
  }

  /**
   * Get all product names as an array of strings.
   * allTextContents() returns Promise<string[]> — one entry per matched element.
   */
  async getAllProductNames(): Promise<string[]> {
    return await this.productItems.locator('.inventory_item_name').allTextContents();
  }

  /**
   * Get all prices as NUMBERS, stripped of the '$'.
   *
   * .map() transforms each element of the array.
   * .replace('$','') removes the symbol; parseFloat converts to number.
   * We need numbers (not strings) so we can sort and compare correctly —
   * as strings, "$9.99" > "$49.99" would be TRUE, which is wrong.
   */
  async getAllProductPrices(): Promise<number[]> {
    const priceTexts = await this.productItems
      .locator('.inventory_item_price')
      .allTextContents();

    return priceTexts.map(text => parseFloat(text.replace('$', '')));
  }

  /**
   * Read the cart badge count.
   * Badge is absent when cart is empty, so we return 0 in that case.
   */
  async getCartItemCount(): Promise<number> {
    if (!(await this.isElementVisible(this.cartBadge, 2000))) {
      return 0;
    }
    const badgeText = await this.cartBadge.textContent();
    return parseInt(badgeText ?? '0', 10);
  }

  // ── VERIFICATION HELPERS ────────────────────────────────

  async expectPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Products');
    await expect(this.page).toHaveURL(/inventory\.html/);
  }
}