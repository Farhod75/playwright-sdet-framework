import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Cart — state seeding', () => {

  /**
   * HYBRID PATTERN
   *
   * Setup:  inject state directly (localStorage here, API POST in a real app)
   * Verify: through the UI, which is what we're actually testing
   *
   * The UI is used ONLY for the assertion, never for the arrangement.
   */
  test('cart badge reflects seeded state @smoke', async ({ page, productsPage }) => {

    // 1. Navigate first. localStorage is origin-scoped — you cannot write
    //    to it before the browser has loaded a page from that origin.
    await productsPage.navigate('/inventory.html');

    // 2. Inject state.
    //    page.evaluate() runs JS INSIDE the browser, not in Node.
    //    The second argument is serialized and passed in — closures from
    //    Node scope are NOT available inside the callback.
    await page.evaluate((itemIds) => {
      localStorage.setItem('cart-contents', JSON.stringify(itemIds));
    }, [4, 0, 1]);   // three SauceDemo product IDs

    // 3. Reload so the app reads the new state.
    await page.reload();

    // 4. Verify through the UI.
    expect(await productsPage.getCartItemCount()).toBe(3);
  });

  test('seeded cart persists to the cart page @regression', async ({ page, productsPage }) => {
    await productsPage.navigate('/inventory.html');

    await page.evaluate((itemIds) => {
      localStorage.setItem('cart-contents', JSON.stringify(itemIds));
    }, [4]);

    await page.reload();
    await productsPage.goToCart();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(1);
  });

  /**
   * The inverse: clearing state.
   * Equally important — tests that assume an empty cart need to guarantee it.
   */
  test('clearing state empties the cart @regression', async ({ page, productsPage }) => {
    await productsPage.navigate('/inventory.html');

    await page.evaluate(() => localStorage.setItem('cart-contents', JSON.stringify([1, 2])));
    await page.reload();
    expect(await productsPage.getCartItemCount()).toBe(2);

    await page.evaluate(() => localStorage.removeItem('cart-contents'));
    await page.reload();
    expect(await productsPage.getCartItemCount()).toBe(0);
  });
});