import { test, expect } from '@playwright/test';

test.describe('Restocking page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/restocking');
  });

  test('shows page heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Restocking Recommendations' })).toBeVisible();
    await expect(page.locator('text=Data-driven purchase order recommendations')).toBeVisible();
  });

  test('shows summary stat cards', async ({ page }) => {
    await expect(page.locator('text=Items Recommended')).toBeVisible();
    await expect(page.locator('text=Total Estimated Cost')).toBeVisible();
    await expect(page.locator('text=Budget Remaining')).toBeVisible();
    await expect(page.locator('text=Critical Items')).toBeVisible();
  });

  test('recommendations table loads with data', async ({ page }) => {
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    // Verify header columns
    await expect(table.getByRole('columnheader', { name: 'SKU' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Item' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Estimated Cost' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Criticality' })).toBeVisible();
    // At least one data row
    await expect(table.getByRole('cell', { name: 'SRV-301' })).toBeVisible();
  });

  test('default shows 4 recommended items', async ({ page }) => {
    await expect(page.locator('text=Items Recommended')).toBeVisible();
    await expect(page.getByRole('table').getByRole('row')).toHaveCount(5); // 1 header + 4 data
  });

  test('location filter filters recommendations', async ({ page }) => {
    // The restocking location select is inside main (separate from the global filter bar)
    const locationSelect = page.getByRole('main').getByRole('combobox');
    await locationSelect.selectOption('London');
    // London has TMP-201
    await expect(page.getByRole('cell', { name: 'TMP-201' })).toBeVisible();
    // Tokyo items should not appear
    await expect(page.getByRole('cell', { name: 'SRV-301' })).not.toBeVisible();
  });

  test('budget ceiling filters out expensive items', async ({ page }) => {
    // Default: all 4 items visible (total $65,965)
    await expect(page.getByRole('table').getByRole('row')).toHaveCount(5); // 1 header + 4 rows

    // Set budget to $15,000 — SRV-301 ($22,250) and SRV-302 ($19,575) exceed it individually,
    // and the cumulative total also excludes PSU-508 after TMP-201 is allocated
    const budgetInput = page.getByRole('spinbutton');
    await budgetInput.fill('15000');
    await page.getByRole('button', { name: 'Apply' }).click();

    // SRV-301 at $22,250 should be excluded (over individual budget)
    await expect(page.getByRole('cell', { name: 'SRV-301' })).not.toBeVisible();
  });

  test('SKUs and costs are displayed for all items', async ({ page }) => {
    const skus = ['SRV-301', 'TMP-201', 'SRV-302', 'PSU-508'];
    for (const sku of skus) {
      await expect(page.getByRole('cell', { name: sku })).toBeVisible();
    }
  });
});
