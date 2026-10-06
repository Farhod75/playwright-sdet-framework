import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../../fixtures/pages.fixture';

// Pull the Gherkin keywords, wired to YOUR fixtures.
// This is why loginPage and productsPage are available below.
const { Given, When, Then } = createBdd(test);

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.goto();
});

When('I log in as the standard user', async ({ loginPage }) => {
  await loginPage.loginAsStandardUser();
});

// {string} captures a quoted value from the feature file.
// Two placeholders → two extra arguments after the fixtures object.
When(
  'I log in with username {string} and password {string}',
  async ({ loginPage }, username: string, password: string) => {
    await loginPage.login(username, password);
  }
);

Then('I should see the products page', async ({ productsPage }) => {
  await productsPage.expectPageLoaded();
});

Then('I should see an error containing {string}', async ({ loginPage }, text: string) => {
  await loginPage.expectErrorMessage(text);
});