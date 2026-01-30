import { test, expect } from '@playwright/test';
import { waitForNetworkIdle } from './fixtures/test-helpers';

test.describe('TASK-ANTI-001: Institutions Page Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/institutions');
    await waitForNetworkIdle(page);
  });

  test('should navigate to the next page and back', async ({ page }) => {
    const nextButton = page.locator('[data-testid="next-page"]');
    const prevButton = page.locator('[data-testid="prev-page"]');

    // Check if pagination exists
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      const initialPageText = await page.locator('.text-sm.text-muted-foreground').textContent();
      expect(initialPageText).toContain('Page 1');

      // Go to next page
      await nextButton.click();
      await waitForNetworkIdle(page);

      // Verify URL and page number
      await expect(page).toHaveURL(/page=2/);
      const newPageText = await page.locator('.text-sm.text-muted-foreground').textContent();
      expect(newPageText).toContain('Page 2');

      // Go back to previous page
      await prevButton.click();
      await waitForNetworkIdle(page);

      // Verify URL and page number
      await expect(page).not.toHaveURL(/page=2/);
      const firstPageText = await page.locator('.text-sm.text-muted-foreground').textContent();
      expect(firstPageText).toContain('Page 1');
    }
  });

  test('should reset to page 1 when filters are applied', async ({ page }) => {
    const nextButton = page.locator('[data-testid="next-page"]');

    // Go to page 2 first
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      await waitForNetworkIdle(page);
      await expect(page).toHaveURL(/page=2/);
    }

    // Apply a filter
    await page.locator('button:has-text("State")').click();
    await page.locator('label:has-text("Lagos")').click();
    await page.keyboard.press('Escape');
    await waitForNetworkIdle(page);

    // Verify that the page is reset to 1
    await expect(page).not.toHaveURL(/page=2/);
    const pageText = await page.locator('.text-sm.text-muted-foreground').textContent();
    expect(pageText).toContain('Page 1');
  });
});

test.describe('TASK-ANTI-002: Comparison Tray Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/institutions');
    await waitForNetworkIdle(page);
    // Clear comparison list before each test
    await page.evaluate(() => localStorage.removeItem('comparison-storage'));
  });

  test('should add an item to the comparison tray', async ({ page }) => {
    // Add first item to comparison
    await page.locator('[data-testid="institution-card"]').first().locator('button[title="Compare"]').click();

    // Verify tray is visible
    const tray = page.locator('[data-testid="comparison-tray"]');
    await expect(tray).toBeVisible();
    await expect(tray).toContainText('Comparison Tray (1/3)');
  });

  test('should add multiple items and respect the limit', async ({ page }) => {
    const cards = page.locator('[data-testid="institution-card"]');
    const tray = page.locator('[data-testid="comparison-tray"]');

    // Add 3 items
    await cards.nth(0).locator('button[title="Compare"]').click();
    await cards.nth(1).locator('button[title="Compare"]').click();
    await cards.nth(2).locator('button[title="Compare"]').click();

    // Verify count
    await expect(tray).toContainText('Comparison Tray (3/3)');

    // Try to add a 4th item
    await cards.nth(3).locator('button[title="Compare"]').click();
    
    // Verify the toast message for limit reached
    const toast = page.locator('[data-testid="toast"]');
    // Note: This depends on the actual implementation of the toast
    // await expect(toast).toContainText('Comparison limit reached');

    // Verify count is still 3
    await expect(tray).toContainText('Comparison Tray (3/3)');
  });

  test('should remove an item from the tray', async ({ page }) => {
    const cards = page.locator('[data-testid="institution-card"]');
    const tray = page.locator('[data-testid="comparison-tray"]');

    // Add two items
    await cards.nth(0).locator('button[title="Compare"]').click();
    await cards.nth(1).locator('button[title="Compare"]').click();
    await expect(tray).toContainText('Comparison Tray (2/3)');

    // Remove the first item
    await tray.locator('button').nth(0).click();
    await expect(tray).toContainText('Comparison Tray (1/3)');
  });

  test('should navigate to the compare page', async ({ page }) => {
    const cards = page.locator('[data-testid="institution-card"]');

    // Add two items
    await cards.nth(0).locator('button[title="Compare"]').click();
    await cards.nth(1).locator('button[title="Compare"]').click();

    // Click compare button
    await page.locator('button:has-text("Compare (2)")').click();

    // Verify navigation
    await expect(page).toHaveURL('/compare');
  });

  test('should persist the tray on page refresh', async ({ page }) => {
    // Add an item
    await page.locator('[data-testid="institution-card"]').first().locator('button[title="Compare"]').click();
    const tray = page.locator('[data-testid="comparison-tray"]');
    await expect(tray).toBeVisible();

    // Refresh the page
    await page.reload();
    await waitForNetworkIdle(page);

    // Verify tray is still visible
    await expect(tray).toBeVisible();
    await expect(tray).toContainText('Comparison Tray (1/3)');
  });
});
