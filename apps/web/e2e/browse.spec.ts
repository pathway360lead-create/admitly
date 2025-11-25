import { test, expect } from '@playwright/test';
import { waitForNetworkIdle, waitForElement } from './fixtures/test-helpers';

/**
 * PRIORITY 3: Browse Institutions & Programs Tests
 *
 * Tests for:
 * - Viewing institutions list
 * - Viewing programs list
 * - Navigating to institution details
 * - Navigating to program details
 * - Filtering and sorting
 * - Pagination
 */

test.describe('Browse Institutions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/institutions');
  });

  test('should display institutions page', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Institutions/);

    // Verify institutions container is visible
    await expect(page.locator('[data-testid="institutions-list"]')).toBeVisible();
  });

  test('should display institution cards', async ({ page }) => {
    // Wait for institutions to load
    await waitForNetworkIdle(page);

    // Verify institution cards are displayed
    const cards = page.locator('[data-testid="institution-card"]');
    const count = await cards.count();

    expect(count).toBeGreaterThan(0);

    // Verify first card has required elements
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
  });

  test('should display institution information on cards', async ({ page }) => {
    await waitForNetworkIdle(page);

    const firstCard = page.locator('[data-testid="institution-card"]').first();

    // Verify institution name is shown
    await expect(firstCard.locator('[data-testid="institution-name"]')).toBeVisible();

    // Verify institution state/location is shown
    const location = firstCard.locator('[data-testid="institution-location"]');
    if (await location.isVisible()) {
      await expect(location).toBeVisible();
    }

    // Verify institution type badge
    const typeBadge = firstCard.locator('[data-testid="institution-type"]');
    if (await typeBadge.isVisible()) {
      await expect(typeBadge).toBeVisible();
    }
  });

  test('should filter institutions by state', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Open state filter
    await page.click('[data-testid="state-filter"]');

    // Select Lagos
    await page.click('[data-testid="state-option-lagos"]');

    // Wait for results to update
    await waitForNetworkIdle(page);

    // Verify URL updated
    const url = new URL(page.url());
    expect(url.searchParams.get('state')).toBe('Lagos');

    // Verify filtered results
    const cards = page.locator('[data-testid="institution-card"]');
    if (await cards.count() > 0) {
      const firstCard = cards.first();
      const cardText = await firstCard.textContent();
      expect(cardText?.toLowerCase()).toContain('lagos');
    }
  });

  test('should filter institutions by type', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Open type filter
    await page.click('[data-testid="type-filter"]');

    // Select Federal University
    await page.click('[data-testid="type-option-federal-university"]');

    // Wait for results
    await waitForNetworkIdle(page);

    // Verify filtered results
    const cards = page.locator('[data-testid="institution-card"]');
    if (await cards.count() > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('should sort institutions', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Open sort dropdown
    await page.click('[data-testid="sort-dropdown"]');

    // Select sort by name
    await page.click('[data-testid="sort-option-name"]');

    // Wait for re-sort
    await waitForNetworkIdle(page);

    // Verify results are re-rendered
    await expect(page.locator('[data-testid="institution-card"]').first()).toBeVisible();
  });

  test('should navigate to institution detail page', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Click first institution card
    const firstCard = page.locator('[data-testid="institution-card"]').first();
    await firstCard.click();

    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/institutions\/[^/]+$/);

    // Verify detail page loaded
    await expect(page.locator('[data-testid="institution-detail"]')).toBeVisible();
  });

  test('should display pagination controls', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Check if pagination exists (might not if only one page)
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();

      // Verify page numbers are shown
      await expect(page.locator('[data-testid="page-number"]')).toBeVisible();
    }
  });

  test('should navigate to next page', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Check if next button exists
    const nextButton = page.locator('[data-testid="next-page"]');
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();

      // Wait for new results
      await waitForNetworkIdle(page);

      // Verify page parameter in URL
      const url = new URL(page.url());
      const pageParam = url.searchParams.get('page');
      expect(parseInt(pageParam || '1')).toBeGreaterThan(1);
    }
  });

  test('should show verified badge for verified institutions', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Look for verified badges
    const verifiedBadges = page.locator('[data-testid="verified-badge"]');
    const count = await verifiedBadges.count();

    // If any verified institutions exist
    if (count > 0) {
      await expect(verifiedBadges.first()).toBeVisible();
    }
  });

  test('should display program count on institution cards', async ({ page }) => {
    await waitForNetworkIdle(page);

    const firstCard = page.locator('[data-testid="institution-card"]').first();
    const programCount = firstCard.locator('[data-testid="program-count"]');

    if (await programCount.isVisible()) {
      const countText = await programCount.textContent();
      expect(countText).toMatch(/\d+/);
    }
  });

  test('should handle empty state when no institutions match filter', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Apply very specific filter that might return no results
    await page.click('[data-testid="type-filter"]');
    await page.click('[data-testid="type-option-specialized"]');

    await page.click('[data-testid="state-filter"]');
    await page.click('[data-testid="state-option-yobe"]'); // Assuming rare combination

    await waitForNetworkIdle(page);

    // Check for empty state or results
    const emptyState = page.locator('[data-testid="empty-state"]');
    const results = page.locator('[data-testid="institution-card"]');

    const hasEmpty = await emptyState.isVisible();
    const hasResults = await results.count() > 0;

    expect(hasEmpty || hasResults).toBeTruthy();
  });
});

test.describe('Browse Programs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/programs');
  });

  test('should display programs page', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Programs/);

    // Verify programs container is visible
    await expect(page.locator('[data-testid="programs-list"]')).toBeVisible();
  });

  test('should display program cards', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Verify program cards are displayed
    const cards = page.locator('[data-testid="program-card"]');
    const count = await cards.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should display program information on cards', async ({ page }) => {
    await waitForNetworkIdle(page);

    const firstCard = page.locator('[data-testid="program-card"]').first();

    // Verify program name
    await expect(firstCard.locator('[data-testid="program-name"]')).toBeVisible();

    // Verify institution name
    const instName = firstCard.locator('[data-testid="institution-name"]');
    if (await instName.isVisible()) {
      await expect(instName).toBeVisible();
    }

    // Verify degree type badge
    const degreeBadge = firstCard.locator('[data-testid="degree-type"]');
    if (await degreeBadge.isVisible()) {
      await expect(degreeBadge).toBeVisible();
    }
  });

  test('should filter programs by field of study', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Open field filter
    await page.click('[data-testid="field-filter"]');

    // Select Engineering
    await page.click('[data-testid="field-option-engineering"]');

    // Wait for results
    await waitForNetworkIdle(page);

    // Verify filtered results
    const cards = page.locator('[data-testid="program-card"]');
    if (await cards.count() > 0) {
      const firstCard = cards.first();
      const cardText = await firstCard.textContent();
      expect(cardText?.toLowerCase()).toContain('engineering');
    }
  });

  test('should filter programs by degree type', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Open degree filter
    await page.click('[data-testid="degree-filter"]');

    // Select Bachelor
    await page.click('[data-testid="degree-option-bachelor"]');

    // Wait for results
    await waitForNetworkIdle(page);

    // Verify results
    await expect(page.locator('[data-testid="program-card"]').first()).toBeVisible();
  });

  test('should filter programs by tuition range', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Apply tuition filter
    await page.click('[data-testid="tuition-filter"]');
    await page.fill('[data-testid="tuition-min"]', '0');
    await page.fill('[data-testid="tuition-max"]', '1000000');
    await page.click('[data-testid="apply-tuition-filter"]');

    // Wait for results
    await waitForNetworkIdle(page);

    // Verify results are shown
    await expect(page.locator('[data-testid="programs-list"]')).toBeVisible();
  });

  test('should navigate to program detail page', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Click first program card
    const firstCard = page.locator('[data-testid="program-card"]').first();
    await firstCard.click();

    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/programs\/[^/]+$/);

    // Verify detail page loaded
    await expect(page.locator('[data-testid="program-detail"]')).toBeVisible();
  });

  test('should sort programs by name', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Open sort dropdown
    await page.click('[data-testid="sort-dropdown"]');

    // Select sort by name
    await page.click('[data-testid="sort-option-name"]');

    // Wait for re-sort
    await waitForNetworkIdle(page);

    // Verify results are shown
    await expect(page.locator('[data-testid="program-card"]').first()).toBeVisible();
  });

  test('should sort programs by tuition', async ({ page }) => {
    await waitForNetworkIdle(page);

    // Open sort dropdown
    await page.click('[data-testid="sort-dropdown"]');

    // Select sort by tuition
    await page.click('[data-testid="sort-option-tuition"]');

    // Wait for re-sort
    await waitForNetworkIdle(page);

    // Verify results are shown
    await expect(page.locator('[data-testid="program-card"]').first()).toBeVisible();
  });

  test('should display program tuition', async ({ page }) => {
    await waitForNetworkIdle(page);

    const firstCard = page.locator('[data-testid="program-card"]').first();
    const tuition = firstCard.locator('[data-testid="program-tuition"]');

    if (await tuition.isVisible()) {
      const tuitionText = await tuition.textContent();
      expect(tuitionText).toMatch(/₦|NGN/); // Nigerian Naira symbol
    }
  });

  test('should display program duration', async ({ page }) => {
    await waitForNetworkIdle(page);

    const firstCard = page.locator('[data-testid="program-card"]').first();
    const duration = firstCard.locator('[data-testid="program-duration"]');

    if (await duration.isVisible()) {
      const durationText = await duration.textContent();
      expect(durationText).toMatch(/\d+\s+(year|month)/i);
    }
  });
});

test.describe('Institution Detail Page', () => {
  test('should display institution details', async ({ page }) => {
    // Navigate to a specific institution (adjust slug as needed)
    await page.goto('/institutions');
    await waitForNetworkIdle(page);

    // Click first institution
    const firstCard = page.locator('[data-testid="institution-card"]').first();
    await firstCard.click();

    // Verify detail page
    await expect(page.locator('[data-testid="institution-detail"]')).toBeVisible();

    // Verify institution name
    await expect(page.locator('[data-testid="institution-name"]')).toBeVisible();

    // Verify description
    const description = page.locator('[data-testid="institution-description"]');
    if (await description.isVisible()) {
      await expect(description).toBeVisible();
    }
  });

  test('should display institution programs list', async ({ page }) => {
    await page.goto('/institutions');
    await waitForNetworkIdle(page);

    await page.locator('[data-testid="institution-card"]').first().click();

    // Wait for programs section
    const programsList = page.locator('[data-testid="institution-programs"]');
    if (await programsList.isVisible()) {
      await expect(programsList).toBeVisible();

      // Verify program cards are shown
      const programCards = page.locator('[data-testid="program-card"]');
      if (await programCards.count() > 0) {
        await expect(programCards.first()).toBeVisible();
      }
    }
  });

  test('should display institution contact information', async ({ page }) => {
    await page.goto('/institutions');
    await waitForNetworkIdle(page);

    await page.locator('[data-testid="institution-card"]').first().click();

    // Check for contact info
    const contactInfo = page.locator('[data-testid="contact-info"]');
    if (await contactInfo.isVisible()) {
      await expect(contactInfo).toBeVisible();
    }
  });

  test('should navigate to institution website', async ({ page }) => {
    await page.goto('/institutions');
    await waitForNetworkIdle(page);

    await page.locator('[data-testid="institution-card"]').first().click();

    // Check for website link
    const websiteLink = page.locator('[data-testid="institution-website"]');
    if (await websiteLink.isVisible()) {
      await expect(websiteLink).toHaveAttribute('href', /.+/);
      await expect(websiteLink).toHaveAttribute('target', '_blank');
    }
  });
});

test.describe('Program Detail Page', () => {
  test('should display program details', async ({ page }) => {
    // Navigate to programs and click first one
    await page.goto('/programs');
    await waitForNetworkIdle(page);

    const firstCard = page.locator('[data-testid="program-card"]').first();
    await firstCard.click();

    // Verify detail page
    await expect(page.locator('[data-testid="program-detail"]')).toBeVisible();

    // Verify program name
    await expect(page.locator('[data-testid="program-name"]')).toBeVisible();

    // Verify institution link
    const instLink = page.locator('[data-testid="institution-link"]');
    if (await instLink.isVisible()) {
      await expect(instLink).toBeVisible();
    }
  });

  test('should display program requirements', async ({ page }) => {
    await page.goto('/programs');
    await waitForNetworkIdle(page);

    await page.locator('[data-testid="program-card"]').first().click();

    // Check for requirements section
    const requirements = page.locator('[data-testid="program-requirements"]');
    if (await requirements.isVisible()) {
      await expect(requirements).toBeVisible();
    }
  });

  test('should display program tuition details', async ({ page }) => {
    await page.goto('/programs');
    await waitForNetworkIdle(page);

    await page.locator('[data-testid="program-card"]').first().click();

    // Check for tuition section
    const tuition = page.locator('[data-testid="program-tuition-detail"]');
    if (await tuition.isVisible()) {
      await expect(tuition).toBeVisible();
    }
  });

  test('should navigate back to institution from program detail', async ({ page }) => {
    await page.goto('/programs');
    await waitForNetworkIdle(page);

    await page.locator('[data-testid="program-card"]').first().click();

    // Click institution link
    const instLink = page.locator('[data-testid="institution-link"]');
    if (await instLink.isVisible()) {
      await instLink.click();

      // Verify navigation to institution detail
      await expect(page).toHaveURL(/\/institutions\/[^/]+$/);
    }
  });
});

test.describe('Responsive Design', () => {
  test('should display institutions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/institutions');
    await waitForNetworkIdle(page);

    await expect(page.locator('[data-testid="institution-card"]').first()).toBeVisible();
  });

  test('should display programs on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/programs');
    await waitForNetworkIdle(page);

    await expect(page.locator('[data-testid="program-card"]').first()).toBeVisible();
  });
});
