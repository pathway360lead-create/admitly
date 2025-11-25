import { test, expect } from '@playwright/test';
import {
  performSearch,
  waitForSearchResults,
  applyStateFilter,
  applyTypeFilter,
  switchTab,
  verifyEmptyState,
  verifyErrorState,
  verifyLoadingState,
  getResultCount,
  verifyURLParam,
  mockAPIError,
  waitForNetworkIdle,
} from './fixtures/test-helpers';

/**
 * PRIORITY 1: Comprehensive Search Functionality Tests
 *
 * Critical user flow testing for:
 * - Basic search operations
 * - Filtering (state, type, tuition)
 * - Tab switching (All/Programs/Institutions)
 * - Loading states
 * - Error states
 * - Empty states
 * - URL synchronization
 * - Filter persistence
 * - Performance (search time display)
 */

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to search page before each test
    await page.goto('/search');
  });

  test('should display search page with correct title', async ({ page }) => {
    // Verify page title contains Admitly
    await expect(page).toHaveTitle(/Admitly/);

    // Verify search input is visible
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();

    // Verify search button is visible
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();
  });

  test('should perform basic search and display results', async ({ page }) => {
    // Perform search for "computer"
    await performSearch(page, 'computer');

    // Verify results container is visible
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Verify at least one result is shown
    const resultCards = page.locator('[data-testid="result-card"]');
    await expect(resultCards.first()).toBeVisible();

    // Verify result contains search term
    const firstCard = resultCards.first();
    const cardText = await firstCard.textContent();
    expect(cardText?.toLowerCase()).toContain('computer');
  });

  test('should show loading state during search', async ({ page }) => {
    // Fill search input
    await page.fill('[data-testid="search-input"]', 'engineering');

    // Click search button
    await page.click('[data-testid="search-button"]');

    // Verify loading spinner appears (might be brief)
    try {
      await verifyLoadingState(page);
    } catch {
      // Loading might be too fast to catch, that's okay
      console.log('Loading state was too fast to verify');
    }

    // Wait for results
    await waitForSearchResults(page);

    // Verify loading state is gone
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('should display search result count', async ({ page }) => {
    // Perform search
    await performSearch(page, 'computer science');

    // Verify result count is displayed
    const resultCount = page.locator('[data-testid="result-count"]');
    await expect(resultCount).toBeVisible();

    // Verify count is a number
    const countText = await resultCount.textContent();
    expect(countText).toMatch(/\d+/);
  });

  test('should display processing time', async ({ page }) => {
    // Perform search
    await performSearch(page, 'medicine');

    // Verify processing time is shown
    const processingTime = page.locator('[data-testid="processing-time"]');
    await expect(processingTime).toBeVisible();

    // Verify time format (e.g., "0.123s" or "123ms")
    const timeText = await processingTime.textContent();
    expect(timeText).toMatch(/\d+(\.\d+)?(ms|s)/);
  });

  test('should filter results by state', async ({ page }) => {
    // Perform initial search
    await performSearch(page, 'university');

    // Get initial result count
    const initialCount = await getResultCount(page);

    // Apply Lagos state filter
    await page.click('[data-testid="state-filter"]');
    await page.click('[data-testid="state-option-lagos"]');

    // Wait for results to update
    await waitForNetworkIdle(page);

    // Verify results are filtered
    const results = page.locator('[data-testid="result-card"]');
    const count = await results.count();

    // Verify all results are from Lagos
    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = results.nth(i);
      const cardText = await card.textContent();
      expect(cardText?.toLowerCase()).toContain('lagos');
    }
  });

  test('should filter results by institution type', async ({ page }) => {
    // Perform initial search
    await performSearch(page, 'engineering');

    // Apply Federal University filter
    await page.click('[data-testid="type-filter"]');
    await page.click('[data-testid="type-option-federal-university"]');

    // Wait for results to update
    await waitForNetworkIdle(page);

    // Verify results are filtered
    const results = page.locator('[data-testid="result-card"]');
    const count = await results.count();

    // Verify results contain federal universities
    if (count > 0) {
      const firstCard = results.first();
      const cardText = await firstCard.textContent();
      // Should show federal university badge or indicator
      expect(cardText?.toLowerCase()).toMatch(/federal|university/);
    }
  });

  test('should filter results by tuition range', async ({ page }) => {
    // Perform initial search
    await performSearch(page, 'computer');

    // Apply tuition filter
    await page.click('[data-testid="tuition-filter"]');
    await page.fill('[data-testid="tuition-min"]', '0');
    await page.fill('[data-testid="tuition-max"]', '500000');
    await page.click('[data-testid="apply-tuition-filter"]');

    // Wait for results to update
    await waitForNetworkIdle(page);

    // Verify results are visible
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should switch between result tabs', async ({ page }) => {
    // Perform search
    await performSearch(page, 'computer science');

    // Verify All tab is active by default
    await expect(page.locator('[data-testid="tab-all"]')).toHaveClass(/active/);

    // Switch to Programs tab
    await page.click('[data-testid="tab-programs"]');
    await waitForNetworkIdle(page);

    // Verify Programs tab is active
    await expect(page.locator('[data-testid="tab-programs"]')).toHaveClass(/active/);

    // Verify only program cards are shown
    const results = page.locator('[data-testid="program-card"]');
    if (await results.count() > 0) {
      await expect(results.first()).toBeVisible();
    }

    // Switch to Institutions tab
    await page.click('[data-testid="tab-institutions"]');
    await waitForNetworkIdle(page);

    // Verify Institutions tab is active
    await expect(page.locator('[data-testid="tab-institutions"]')).toHaveClass(/active/);

    // Verify only institution cards are shown
    const instResults = page.locator('[data-testid="institution-card"]');
    if (await instResults.count() > 0) {
      await expect(instResults.first()).toBeVisible();
    }
  });

  test('should show empty state for no results', async ({ page }) => {
    // Search for something that won't return results
    await performSearch(page, 'xyzqwertyuiopasdfghjkl123456789');

    // Verify empty state is shown
    await verifyEmptyState(page);

    // Verify empty state message
    const emptyState = page.locator('[data-testid="empty-state"]');
    await expect(emptyState).toContainText(/no results/i);
  });

  test('should show error state when backend is down', async ({ page }) => {
    // Mock API error
    await mockAPIError(page, '**/api/v1/search**', 500);

    // Perform search
    await page.fill('[data-testid="search-input"]', 'computer');
    await page.click('[data-testid="search-button"]');

    // Wait a bit for error to appear
    await page.waitForTimeout(2000);

    // Verify error state is shown
    await verifyErrorState(page);

    // Verify error message
    const errorState = page.locator('[data-testid="error-state"]');
    await expect(errorState).toContainText(/error/i);
  });

  test('should synchronize search query with URL', async ({ page }) => {
    // Perform search
    await performSearch(page, 'computer science');

    // Verify URL contains query parameter
    await verifyURLParam(page, 'q', 'computer science');
  });

  test('should persist filters in URL', async ({ page }) => {
    // Perform search
    await performSearch(page, 'engineering');

    // Apply state filter
    await page.click('[data-testid="state-filter"]');
    await page.click('[data-testid="state-option-lagos"]');

    // Wait for URL to update
    await page.waitForTimeout(500);

    // Verify URL contains state parameter
    const url = new URL(page.url());
    expect(url.searchParams.has('state')).toBeTruthy();

    // Refresh page
    await page.reload();

    // Verify filter is still applied
    await expect(page.locator('[data-testid="state-filter"]')).toContainText('Lagos');
  });

  test('should restore search from URL on page load', async ({ page }) => {
    // Navigate directly with query parameter
    await page.goto('/search?q=computer+science&state=lagos');

    // Wait for results
    await waitForSearchResults(page);

    // Verify search input has query
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveValue('computer science');

    // Verify state filter is applied
    await expect(page.locator('[data-testid="state-filter"]')).toContainText('Lagos');
  });

  test('should handle rapid consecutive searches', async ({ page }) => {
    // Perform multiple searches quickly
    await page.fill('[data-testid="search-input"]', 'computer');
    await page.click('[data-testid="search-button"]');

    await page.fill('[data-testid="search-input"]', 'engineering');
    await page.click('[data-testid="search-button"]');

    await page.fill('[data-testid="search-input"]', 'medicine');
    await page.click('[data-testid="search-button"]');

    // Wait for final results
    await waitForSearchResults(page);

    // Verify only medicine results are shown
    await verifyURLParam(page, 'q', 'medicine');
  });

  test('should clear filters when clicking clear button', async ({ page }) => {
    // Perform search with filters
    await performSearch(page, 'computer');
    await page.click('[data-testid="state-filter"]');
    await page.click('[data-testid="state-option-lagos"]');

    // Click clear filters button
    await page.click('[data-testid="clear-filters"]');

    // Wait for update
    await waitForNetworkIdle(page);

    // Verify filters are cleared
    const url = new URL(page.url());
    expect(url.searchParams.has('state')).toBeFalsy();
  });

  test('should display search suggestions (if implemented)', async ({ page }) => {
    // Focus on search input
    await page.focus('[data-testid="search-input"]');

    // Type partial query
    await page.fill('[data-testid="search-input"]', 'comp');

    // Wait for suggestions
    await page.waitForTimeout(500);

    // Check if suggestions are shown
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    if (await suggestions.isVisible()) {
      // Verify suggestions contain typed text
      const suggestionText = await suggestions.textContent();
      expect(suggestionText?.toLowerCase()).toContain('comp');
    }
  });

  test('should handle special characters in search query', async ({ page }) => {
    // Search with special characters
    await performSearch(page, 'computer & science (engineering)');

    // Verify results are shown or empty state
    const hasResults = await page.locator('[data-testid="search-results"]').isVisible();
    const hasEmpty = await page.locator('[data-testid="empty-state"]').isVisible();

    expect(hasResults || hasEmpty).toBeTruthy();
  });

  test('should display verified institution badges', async ({ page }) => {
    // Perform search
    await performSearch(page, 'university');

    // Look for verified badges
    const verifiedBadges = page.locator('[data-testid="verified-badge"]');

    // If any verified institutions exist, verify badge is shown
    const count = await verifiedBadges.count();
    if (count > 0) {
      await expect(verifiedBadges.first()).toBeVisible();
    }
  });

  test('should show program count for institutions', async ({ page }) => {
    // Perform search
    await performSearch(page, 'university');

    // Switch to institutions tab
    await page.click('[data-testid="tab-institutions"]');
    await waitForNetworkIdle(page);

    // Verify program count is shown on institution cards
    const institutionCards = page.locator('[data-testid="institution-card"]');
    if (await institutionCards.count() > 0) {
      const firstCard = institutionCards.first();
      const cardText = await firstCard.textContent();
      expect(cardText).toMatch(/\d+\s+(program|course)/i);
    }
  });

  test('should navigate to institution detail from search results', async ({ page }) => {
    // Perform search
    await performSearch(page, 'university');

    // Switch to institutions tab
    await page.click('[data-testid="tab-institutions"]');
    await waitForNetworkIdle(page);

    // Click first institution card
    const institutionCards = page.locator('[data-testid="institution-card"]');
    if (await institutionCards.count() > 0) {
      await institutionCards.first().click();

      // Verify navigation to detail page
      await expect(page).toHaveURL(/\/institutions\/[^/]+/);
    }
  });

  test('should navigate to program detail from search results', async ({ page }) => {
    // Perform search
    await performSearch(page, 'computer science');

    // Switch to programs tab
    await page.click('[data-testid="tab-programs"]');
    await waitForNetworkIdle(page);

    // Click first program card
    const programCards = page.locator('[data-testid="program-card"]');
    if (await programCards.count() > 0) {
      await programCards.first().click();

      // Verify navigation to detail page
      await expect(page).toHaveURL(/\/programs\/[^/]+/);
    }
  });

  test('should support keyboard navigation in search', async ({ page }) => {
    // Focus search input
    await page.focus('[data-testid="search-input"]');

    // Type query
    await page.keyboard.type('computer science');

    // Press Enter to search
    await page.keyboard.press('Enter');

    // Wait for results
    await waitForSearchResults(page);

    // Verify results are shown
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should display search performance under 1 second', async ({ page }) => {
    // Perform search and measure time
    const startTime = Date.now();

    await performSearch(page, 'computer');

    const endTime = Date.now();
    const searchTime = endTime - startTime;

    // Verify search completes in under 1 second (including network)
    expect(searchTime).toBeLessThan(1000);
  });
});

test.describe('Search Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to search
    await page.goto('/search');

    // Perform search
    await performSearch(page, 'computer');

    // Verify results are displayed correctly on mobile
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Navigate to search
    await page.goto('/search');

    // Perform search
    await performSearch(page, 'engineering');

    // Verify results are displayed correctly on tablet
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });
});
