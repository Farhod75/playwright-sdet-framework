import { test as base } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

type PageFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  /** ProductsPage, already logged in and verified loaded. */
  authenticatedProductsPage: ProductsPage;
  /** ProductsPage reached via saved session — no login form interaction. */
  fastProductsPage: ProductsPage;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // ── THE MISSING PIECE ───────────────────────────────────
  // Bare page object, no navigation, no auth.
  // Other fixtures compose on top of this one.
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  fastProductsPage: async ({ page }, use) => {
    const productsPage = new ProductsPage(page);
    await productsPage.navigate('/inventory.html');
    await productsPage.expectPageLoaded();
    await use(productsPage);
  },

  /**
   * COMPOSED FIXTURE — depends on two other fixtures.
   *
   * Playwright resolves the dependency graph automatically:
   * it builds `page`, then `loginPage` and `productsPage`,
   * then runs this function. You never wire it manually.
   */
  authenticatedProductsPage: async ({ loginPage, productsPage }, use) => {
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    await productsPage.expectPageLoaded();

    await use(productsPage);   // test receives a logged-in ProductsPage
  },
});

export { expect } from '@playwright/test';