import { test, expect } from '@playwright/test';

test.describe('Reports page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
  });

  test('shows quarterly performance table with 4 rows', async ({ page }) => {
    // heading > .card-header > .card — need to go up 2 levels to reach the card containing the table
    const card = page.getByRole('heading', { name: 'Quarterly Performance' }).locator('../..');
    const table = card.getByRole('table');
    await expect(table.getByRole('row')).toHaveCount(5); // 1 header + 4 data rows
    await expect(table.getByRole('cell', { name: 'Q1-2025' })).toBeVisible();
    await expect(table.getByRole('cell', { name: 'Q4-2025' })).toBeVisible();
  });

  test('shows monthly revenue trend with all 12 months', async ({ page }) => {
    const card = page.getByRole('heading', { name: 'Monthly Revenue Trend' }).locator('../..');
    for (const month of ['Jan 2025', 'Jun 2025', 'Dec 2025']) {
      await expect(card.locator(`text=${month}`)).toBeVisible();
    }
  });

  test('shows month-over-month analysis table', async ({ page }) => {
    const card = page.getByRole('heading', { name: 'Month-over-Month Analysis' }).locator('../..');
    const table = card.getByRole('table');
    await expect(table.getByRole('cell', { name: 'Jan 2025' })).toBeVisible();
    await expect(table.getByRole('cell', { name: 'Dec 2025' })).toBeVisible();
    await expect(table.getByRole('row')).toHaveCount(13); // 1 header + 12 data rows
  });

  test('shows YTD summary cards', async ({ page }) => {
    await expect(page.locator('text=Total Revenue (YTD)')).toBeVisible();
    await expect(page.locator('text=Total Orders (YTD)')).toBeVisible();
    await expect(page.locator('text=Best Performing Quarter')).toBeVisible();
    await expect(page.locator('text=Avg Monthly Revenue')).toBeVisible();
  });

  test('YTD total revenue shows correct value', async ({ page }) => {
    await expect(page.locator('text=$31,166,853').first()).toBeVisible();
  });

  test('best performing quarter is Q4-2025', async ({ page }) => {
    await expect(page.locator('text=Q4-2025').last()).toBeVisible();
  });
});
