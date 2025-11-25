import { Page, expect } from '@playwright/test';

/**
 * Common test utilities and helpers for E2E tests
 */

/**
 * Wait for network to be idle (no pending requests)
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for search results to load
 */
export async function waitForSearchResults(page: Page) {
  await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
}

/**
 * Perform a search operation
 */
export async function performSearch(page: Page, query: string) {
  await page.fill('[data-testid="search-input"]', query);
  await page.click('[data-testid="search-button"]');
  await waitForSearchResults(page);
}

/**
 * Login helper
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

/**
 * Register new user helper
 */
export async function register(page: Page, email: string, password: string, fullName: string) {
  await page.goto('/register');
  await page.fill('[data-testid="full-name-input"]', fullName);
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="register-button"]');
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('/login');
}

/**
 * Add program to comparison
 */
export async function addToComparison(page: Page, index: number = 0) {
  const compareButtons = page.locator('[data-testid="compare-button"]');
  await compareButtons.nth(index).click();
}

/**
 * Verify comparison tray count
 */
export async function verifyComparisonCount(page: Page, count: number) {
  const tray = page.locator('[data-testid="comparison-tray"]');
  await expect(tray).toContainText(`${count} item${count !== 1 ? 's' : ''}`);
}

/**
 * Navigate to comparison page
 */
export async function goToComparison(page: Page) {
  const tray = page.locator('[data-testid="comparison-tray"]');
  await tray.locator('button:has-text("Compare")').click();
  await page.waitForURL('/compare');
}

/**
 * Apply state filter in search
 */
export async function applyStateFilter(page: Page, state: string) {
  await page.click('[data-testid="state-filter"]');
  await page.click(`[data-testid="state-option-${state}"]`);
}

/**
 * Apply institution type filter
 */
export async function applyTypeFilter(page: Page, type: string) {
  await page.click('[data-testid="type-filter"]');
  await page.click(`[data-testid="type-option-${type}"]`);
}

/**
 * Switch result tabs
 */
export async function switchTab(page: Page, tab: 'all' | 'programs' | 'institutions') {
  await page.click(`[data-testid="tab-${tab}"]`);
}

/**
 * Verify empty state is shown
 */
export async function verifyEmptyState(page: Page) {
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
}

/**
 * Verify error state is shown
 */
export async function verifyErrorState(page: Page) {
  await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
}

/**
 * Verify loading state is shown
 */
export async function verifyLoadingState(page: Page) {
  await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
}

/**
 * Get search result count
 */
export async function getResultCount(page: Page): Promise<number> {
  const countElement = page.locator('[data-testid="result-count"]');
  const text = await countElement.textContent();
  const match = text?.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Verify URL contains query parameter
 */
export async function verifyURLParam(page: Page, param: string, value: string) {
  const url = new URL(page.url());
  expect(url.searchParams.get(param)).toBe(value);
}

/**
 * Take screenshot with name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Mock API response
 */
export async function mockAPIResponse(page: Page, endpoint: string, data: any, status = 200) {
  await page.route(endpoint, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

/**
 * Mock API error
 */
export async function mockAPIError(page: Page, endpoint: string, status = 500) {
  await page.route(endpoint, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Internal Server Error' }),
    });
  });
}

/**
 * Clear all cookies and local storage
 */
export async function clearAllData(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Wait for element to be visible
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Scroll to bottom of page
 */
export async function scrollToBottom(page: Page) {
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
}

/**
 * Generate random email
 */
export function generateRandomEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Generate random full name
 */
export function generateRandomName(): string {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}
