// NOTE: importing from OUR fixture file, not from '@playwright/test'
import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Product Catalog', () => {
  // No beforeEach. No 'let' declarations. No manual instantiation.
  // The fixture name in the destructured argument IS the request.

  test('displays all six products @smoke', async ({ authenticatedProductsPage }) => {
    expect(await authenticatedProductsPage.getProductCount()).toBe(6);
  });

  test('sorts products by price low to high @regression', async ({ authenticatedProductsPage }) => {
    await authenticatedProductsPage.sortBy('lohi');

    const prices = await authenticatedProductsPage.getAllProductPrices();
    const expectedOrder = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(expectedOrder);
  });

  test('sorts products by name Z to A @regression', async ({ authenticatedProductsPage }) => {
    await authenticatedProductsPage.sortBy('za');

    const names = await authenticatedProductsPage.getAllProductNames();
    const expectedOrder = [...names].sort().reverse();

    expect(names).toEqual(expectedOrder);
  });

  test('adding a product updates the cart badge @smoke', async ({ authenticatedProductsPage }) => {
    expect(await authenticatedProductsPage.getCartItemCount()).toBe(0);

    await authenticatedProductsPage.addProductToCart('Sauce Labs Backpack');
    expect(await authenticatedProductsPage.getCartItemCount()).toBe(1);

    await authenticatedProductsPage.addProductToCart('Sauce Labs Bike Light');
    expect(await authenticatedProductsPage.getCartItemCount()).toBe(2);
  });

  test('removing a product decrements the cart badge @regression', async ({ authenticatedProductsPage }) => {
    await authenticatedProductsPage.addProductToCart('Sauce Labs Backpack');
    expect(await authenticatedProductsPage.getCartItemCount()).toBe(1);

    await authenticatedProductsPage.removeProductFromCart('Sauce Labs Backpack');
    expect(await authenticatedProductsPage.getCartItemCount()).toBe(0);
  });
});