import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import path from 'path';

// Where the saved session lives. Committed to .gitignore, not to Git.
const authFile = path.join(__dirname, '../playwright/.auth/user.json');

/**
 * This isn't a normal test — it's a SETUP step that runs once
 * before the test suite, producing an artifact other tests consume.
 *
 * Naming it 'authenticate' makes CI logs readable.
 */
setup('authenticate as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);

  await loginPage.goto();
  await loginPage.loginAsStandardUser();

  // CRITICAL: confirm login actually succeeded before saving.
  // Saving a failed-login state would silently break every downstream test
  // in a way that's miserable to debug.
  await productsPage.expectPageLoaded();

  // Serialize cookies + localStorage + sessionStorage to disk.
  await page.context().storageState({ path: authFile });
});