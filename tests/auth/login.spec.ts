import { test, expect } from '../../fixtures/pages.fixture';
   // Clear any storageState inherited from the project config.
   // This applies to every test in this file.
  
  test.describe('Authentication', () => {
  // Auth tests need the RAW login page, not an authenticated session.
  // A small beforeEach is still fine here — it's one line, not a login flow.
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in successfully @smoke @regression', async ({ loginPage, productsPage }) => {
    await loginPage.loginAsStandardUser();

    await productsPage.expectPageLoaded();
    expect(await productsPage.getProductCount()).toBe(6);
  });

  test('login page renders all required fields @smoke', async ({ loginPage }) => {
    await loginPage.expectLoginPageLoaded();
  });

  test('locked out user sees an error @regression', async ({ loginPage }) => {
    await loginPage.login(process.env.LOCKED_USER!, process.env.USER_PASSWORD!);
    await loginPage.expectErrorMessage('Sorry, this user has been locked out');
  });

  test('invalid password is rejected @regression', async ({ loginPage }) => {
    await loginPage.login(process.env.STANDARD_USER!, 'wrong_password');
    await loginPage.expectErrorMessage('Username and password do not match');
  });

  test('empty credentials are rejected @regression', async ({ loginPage }) => {
    await loginPage.clickLogin();
    await loginPage.expectErrorMessage('Username is required');
  });

  test('user can dismiss the error banner @regression', async ({ loginPage }) => {
    await loginPage.clickLogin();
    expect(await loginPage.isErrorVisible()).toBe(true);

    await loginPage.dismissError();
    await expect(loginPage.errorMessage).not.toBeVisible();
  });
});