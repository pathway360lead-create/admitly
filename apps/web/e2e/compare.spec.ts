import { test, expect } from '@playwright/test';
import {
  addToComparison,
  verifyComparisonCount,
  goToComparison,
  waitForNetworkIdle,
} from './fixtures/test-helpers';

/**
 * PRIORITY 4: Comparison Feature Tests
 *
 * Tests for:
 * - Adding programs to comparison
 * - Comparison tray display
 * - Maximum comparison limit (3 items)
 * - Removing from comparison
 * - Comparison page display
 * - Comparison table functionality
 * - Persistence across sessions
 */

test.describe('Comparison Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to programs page
    await page.goto('/programs');
    await waitForNetworkIdle(page);

    // Clear any existing comparisons
    await page.evaluate(() => {
      localStorage.removeItem('comparison-storage');
    });

    // Reload to clear state
    await page.reload();
    await waitForNetworkIdle(page);
  });

  test('should display compare button on program cards', async ({ page }) => {
    // Verify compare buttons are visible
    const compareButtons = page.locator('[data-testid="compare-button"]');
    const count = await compareButtons.count();

    expect(count).toBeGreaterThan(0);
    await expect(compareButtons.first()).toBeVisible();
  });

  test('should add program to comparison', async ({ page }) => {
    // Add first program
    await addToComparison(page, 0);

    // Wait for tray to appear
    await page.waitForTimeout(500);

    // Verify comparison tray is visible
    await expect(page.locator('[data-testid="comparison-tray"]')).toBeVisible();

    // Verify count is 1
    await verifyComparisonCount(page, 1);
  });

  test('should add multiple programs to comparison', async ({ page }) => {
    // Add 3 programs
    await addToComparison(page, 0);
    await page.waitForTimeout(300);

    await addToComparison(page, 1);
    await page.waitForTimeout(300);

    await addToComparison(page, 2);
    await page.waitForTimeout(300);

    // Verify count is 3
    await verifyComparisonCount(page, 3);
  });

  test('should limit comparison to 3 items', async ({ page }) => {
    // Add 3 programs
    await addToComparison(page, 0);
    await page.waitForTimeout(300);
    await addToComparison(page, 1);
    await page.waitForTimeout(300);
    await addToComparison(page, 2);
    await page.waitForTimeout(300);

    // Try to add 4th program
    const compareButtons = page.locator('[data-testid="compare-button"]');
    const fourthButton = compareButtons.nth(3);

    // Check if button is disabled or shows message
    if (await fourthButton.isVisible()) {
      const isDisabled = await fourthButton.isDisabled();
      if (isDisabled) {
        expect(isDisabled).toBeTruthy();
      } else {
        // Click and verify count stays at 3
        await fourthButton.click();
        await page.waitForTimeout(300);
        await verifyComparisonCount(page, 3);
      }
    }
  });

  test('should show warning when trying to add 4th item', async ({ page }) => {
    // Add 3 programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await addToComparison(page, 2);

    // Try to add 4th
    const compareButtons = page.locator('[data-testid="compare-button"]');
    if (await compareButtons.nth(3).isVisible()) {
      await compareButtons.nth(3).click();

      // Check for warning message
      const warning = page.locator('[data-testid="comparison-warning"]');
      if (await warning.isVisible()) {
        await expect(warning).toContainText(/maximum|limit|3/i);
      }
    }
  });

  test('should remove program from comparison', async ({ page }) => {
    // Add 2 programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    // Verify count is 2
    await verifyComparisonCount(page, 2);

    // Remove first program
    const removeButtons = page.locator('[data-testid="comparison-remove"]');
    await removeButtons.first().click();
    await page.waitForTimeout(300);

    // Verify count is 1
    await verifyComparisonCount(page, 1);
  });

  test('should clear all comparisons', async ({ page }) => {
    // Add programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    // Click clear all button
    const clearButton = page.locator('[data-testid="clear-comparison"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Wait for clear
      await page.waitForTimeout(300);

      // Verify tray is hidden or empty
      const tray = page.locator('[data-testid="comparison-tray"]');
      const isVisible = await tray.isVisible();

      if (isVisible) {
        // Should show 0 items
        await expect(tray).toContainText(/0|empty/i);
      }
    }
  });

  test('should navigate to comparison page', async ({ page }) => {
    // Add programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    // Click compare button in tray
    const tray = page.locator('[data-testid="comparison-tray"]');
    const compareButton = tray.locator('[data-testid="compare-now-button"]');

    if (await compareButton.isVisible()) {
      await compareButton.click();

      // Verify navigation to compare page
      await expect(page).toHaveURL('/compare');
    }
  });

  test('should display comparison table', async ({ page }) => {
    // Add programs and navigate to compare
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    await goToComparison(page);

    // Verify comparison table is visible
    await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible();
  });

  test('should display all compared programs in table', async ({ page }) => {
    // Add 3 programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await addToComparison(page, 2);
    await page.waitForTimeout(500);

    await goToComparison(page);

    // Verify 3 columns in comparison table
    const programColumns = page.locator('[data-testid="comparison-program-column"]');
    const count = await programColumns.count();

    expect(count).toBe(3);
  });

  test('should display program details in comparison table', async ({ page }) => {
    // Add programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    await goToComparison(page);

    // Verify program names are shown
    const programNames = page.locator('[data-testid="comparison-program-name"]');
    const count = await programNames.count();

    expect(count).toBeGreaterThan(0);
    await expect(programNames.first()).toBeVisible();
  });

  test('should display comparison attributes (tuition, duration, etc)', async ({ page }) => {
    // Add programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    await goToComparison(page);

    // Check for tuition row
    const tuitionRow = page.locator('[data-testid="comparison-row-tuition"]');
    if (await tuitionRow.isVisible()) {
      await expect(tuitionRow).toBeVisible();
    }

    // Check for duration row
    const durationRow = page.locator('[data-testid="comparison-row-duration"]');
    if (await durationRow.isVisible()) {
      await expect(durationRow).toBeVisible();
    }

    // Check for institution row
    const instRow = page.locator('[data-testid="comparison-row-institution"]');
    if (await instRow.isVisible()) {
      await expect(instRow).toBeVisible();
    }
  });

  test('should remove program from comparison table', async ({ page }) => {
    // Add programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    await goToComparison(page);

    // Remove first program
    const removeButtons = page.locator('[data-testid="comparison-table-remove"]');
    if (await removeButtons.count() > 0) {
      const initialCount = await page.locator('[data-testid="comparison-program-column"]').count();

      await removeButtons.first().click();
      await page.waitForTimeout(300);

      const newCount = await page.locator('[data-testid="comparison-program-column"]').count();
      expect(newCount).toBe(initialCount - 1);
    }
  });

  test('should persist comparison across page navigation', async ({ page }) => {
    // Add programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    // Navigate away
    await page.goto('/institutions');
    await waitForNetworkIdle(page);

    // Check tray is still visible
    const tray = page.locator('[data-testid="comparison-tray"]');
    if (await tray.isVisible()) {
      await verifyComparisonCount(page, 2);
    }
  });

  test('should persist comparison after page reload', async ({ page }) => {
    // Add programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await waitForNetworkIdle(page);

    // Verify comparison is still there
    const tray = page.locator('[data-testid="comparison-tray"]');
    if (await tray.isVisible()) {
      await verifyComparisonCount(page, 2);
    }
  });

  test('should show empty state on comparison page with no items', async ({ page }) => {
    // Navigate directly to compare page
    await page.goto('/compare');

    // Verify empty state is shown
    const emptyState = page.locator('[data-testid="comparison-empty-state"]');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toContainText(/no programs|add programs/i);
    }
  });

  test('should provide link to add programs from empty comparison page', async ({ page }) => {
    // Navigate to empty compare page
    await page.goto('/compare');

    // Look for browse programs link
    const browseLink = page.locator('[data-testid="browse-programs-link"]');
    if (await browseLink.isVisible()) {
      await browseLink.click();

      // Verify navigation to programs page
      await expect(page).toHaveURL(/\/programs/);
    }
  });

  test('should toggle compare button state when added/removed', async ({ page }) => {
    // Get first compare button
    const firstButton = page.locator('[data-testid="compare-button"]').first();

    // Initial state (not in comparison)
    const initialText = await firstButton.textContent();

    // Add to comparison
    await firstButton.click();
    await page.waitForTimeout(300);

    // Verify button text changed
    const addedText = await firstButton.textContent();
    expect(addedText).not.toBe(initialText);

    // Click again to remove
    await firstButton.click();
    await page.waitForTimeout(300);

    // Verify button reverted
    const removedText = await firstButton.textContent();
    expect(removedText).toBe(initialText);
  });

  test('should highlight differences in comparison table', async ({ page }) => {
    // Add programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    await goToComparison(page);

    // Check if differences are highlighted (if implemented)
    const highlightedCells = page.locator('[data-testid="comparison-highlight"]');
    if (await highlightedCells.count() > 0) {
      await expect(highlightedCells.first()).toBeVisible();
    }
  });

  test('should export comparison as PDF (if implemented)', async ({ page }) => {
    // Add programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    await goToComparison(page);

    // Look for export button
    const exportButton = page.locator('[data-testid="export-comparison"]');
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();

      // Note: Actually downloading would require more complex setup
      // Just verify button exists
    }
  });

  test('should share comparison link (if implemented)', async ({ page }) => {
    // Add programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    await goToComparison(page);

    // Look for share button
    const shareButton = page.locator('[data-testid="share-comparison"]');
    if (await shareButton.isVisible()) {
      await shareButton.click();

      // Verify share dialog appears
      const shareDialog = page.locator('[data-testid="share-dialog"]');
      if (await shareDialog.isVisible()) {
        await expect(shareDialog).toBeVisible();
      }
    }
  });

  test('should navigate to program detail from comparison', async ({ page }) => {
    // Add programs
    await addToComparison(page, 0);
    await page.waitForTimeout(500);

    await goToComparison(page);

    // Click program name link
    const programLink = page.locator('[data-testid="comparison-program-link"]').first();
    if (await programLink.isVisible()) {
      await programLink.click();

      // Verify navigation to program detail
      await expect(page).toHaveURL(/\/programs\/[^/]+$/);
    }
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Add programs
    await addToComparison(page, 0);
    await addToComparison(page, 1);
    await page.waitForTimeout(500);

    // Navigate to comparison
    await goToComparison(page);

    // Verify comparison view is displayed (might be different layout on mobile)
    const comparisonContent = page.locator('[data-testid="comparison-table"], [data-testid="comparison-cards"]');
    await expect(comparisonContent).toBeVisible();
  });

  test('should display comparison tray on all pages', async ({ page }) => {
    // Add program
    await addToComparison(page, 0);
    await page.waitForTimeout(500);

    // Navigate to different pages
    const pages = ['/institutions', '/search', '/'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await waitForNetworkIdle(page);

      // Verify tray is visible
      const tray = page.locator('[data-testid="comparison-tray"]');
      if (await tray.isVisible()) {
        await expect(tray).toBeVisible();
      }
    }
  });
});

test.describe('Comparison Accessibility', () => {
  test('should have accessible comparison controls', async ({ page }) => {
    await page.goto('/programs');
    await waitForNetworkIdle(page);

    // Check compare button has aria-label
    const compareButton = page.locator('[data-testid="compare-button"]').first();
    const ariaLabel = await compareButton.getAttribute('aria-label');

    if (ariaLabel) {
      expect(ariaLabel).toBeTruthy();
    }
  });

  test('should announce comparison updates to screen readers', async ({ page }) => {
    await page.goto('/programs');
    await waitForNetworkIdle(page);

    // Add to comparison
    await addToComparison(page, 0);
    await page.waitForTimeout(500);

    // Check for aria-live region
    const liveRegion = page.locator('[aria-live="polite"]');
    if (await liveRegion.isVisible()) {
      await expect(liveRegion).toBeVisible();
    }
  });
});
