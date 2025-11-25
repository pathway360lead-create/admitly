import { test, expect } from '@playwright/test';

/**
 * SMOKE TEST: Quick verification that the application is running
 *
 * This test verifies basic functionality before running full test suite.
 * Run this first to ensure the dev server is working.
 */

test.describe('Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Verify page content is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should navigate to search page', async ({ page }) => {
    await page.goto('/search');

    // Verify search input exists
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check if navigation exists (use first match)
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });
});
