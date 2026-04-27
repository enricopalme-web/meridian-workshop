import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('app loads and shows brand header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Catalyst Components' })).toBeVisible();
    await expect(page.locator('text=Inventory Management System')).toBeVisible();
  });

  test('nav links are all present', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    for (const label of ['Overview', 'Inventory', 'Orders', 'Finance', 'Demand Forecast', 'Reports', 'Restocking']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
  });

  test('navigates to Reports page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Reports' }).click();
    await expect(page).toHaveURL('/reports');
    await expect(page.getByRole('heading', { name: 'Performance Reports' })).toBeVisible();
  });

  test('navigates to Restocking page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Restocking' }).click();
    await expect(page).toHaveURL('/restocking');
    await expect(page.getByRole('heading', { name: 'Restocking Recommendations' })).toBeVisible();
  });

  test('navigates to Inventory page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Inventory' }).click();
    await expect(page).toHaveURL('/inventory');
  });

  test('global filters bar is present on all main pages', async ({ page }) => {
    // Filter labels are plain divs, not <label> elements — use text locators
    for (const path of ['/', '/reports', '/restocking', '/inventory']) {
      await page.goto(path);
      await expect(page.locator('text=Time Period').first()).toBeVisible();
      await expect(page.locator('text=Location').first()).toBeVisible();
      await expect(page.locator('text=Category').first()).toBeVisible();
    }
  });
});
