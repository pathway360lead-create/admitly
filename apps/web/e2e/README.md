# E2E Testing with Playwright

This directory contains end-to-end tests for the Admitly platform using Playwright.

## Quick Start

### Prerequisites
1. Frontend running at http://localhost:5173
2. Backend API running at http://127.0.0.1:8001

### Run Tests

```bash
# From apps/web directory

# Run all tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e smoke.spec.ts
pnpm test:e2e search.spec.ts
pnpm test:e2e auth.spec.ts
pnpm test:e2e browse.spec.ts
pnpm test:e2e compare.spec.ts

# Run with UI (recommended for development)
pnpm test:e2e:ui

# Run in headed mode (watch browser)
pnpm test:e2e:headed

# Debug tests
pnpm test:e2e:debug

# View last report
pnpm test:e2e:report
```

## Test Files

### smoke.spec.ts ✅
Quick verification that the app is running.
- Homepage loads
- Search page accessible
- Navigation visible

**Status**: All passing (3/3)

### search.spec.ts (Priority 1) 🔍
Comprehensive search functionality tests.
- Basic search operations
- Filters (state, type, tuition)
- Tab switching (All/Programs/Institutions)
- Loading/Error/Empty states
- URL synchronization
- Performance verification

**Count**: 30+ tests
**Status**: Requires backend API

### auth.spec.ts (Priority 2) 🔐
Authentication and authorization tests.
- Registration flow
- Login/Logout
- Protected routes
- Session persistence
- Form validation

**Count**: 25+ tests
**Status**: Requires Supabase Auth

### browse.spec.ts (Priority 3) 📚
Browse institutions and programs.
- List pages
- Detail pages
- Filtering and sorting
- Pagination
- Responsive design

**Count**: 35+ tests
**Status**: Requires backend API

### compare.spec.ts (Priority 4) ⚖️
Comparison feature tests.
- Add/remove from comparison
- Comparison tray
- 3-item limit
- Persistence

**Count**: 15+ tests
**Status**: Requires backend API

## Test Helpers

The `fixtures/test-helpers.ts` file provides utility functions:

```typescript
// Search helpers
performSearch(page, 'computer science')
waitForSearchResults(page)
applyStateFilter(page, 'Lagos')
switchTab(page, 'programs')

// Auth helpers
login(page, email, password)
register(page, email, password, fullName)
logout(page)

// Comparison helpers
addToComparison(page, index)
verifyComparisonCount(page, count)
goToComparison(page)

// State verification
verifyEmptyState(page)
verifyErrorState(page)
verifyLoadingState(page)

// API mocking
mockAPIResponse(page, endpoint, data)
mockAPIError(page, endpoint, status)
```

## Configuration

See `playwright.config.ts` in the root of apps/web for:
- Browser configuration (Chromium, Firefox, WebKit)
- Mobile viewports (Pixel 5, iPhone 12)
- Timeouts and retries
- Screenshot and video settings
- Dev server auto-start

## Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { performSearch } from './fixtures/test-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/page-url');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.fill('[data-testid="input"]', 'value');

    // Act
    await page.click('[data-testid="button"]');

    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### Best Practices
1. Use `data-testid` selectors for stability
2. Wait for network idle when appropriate
3. Test happy paths first, then edge cases
4. Keep tests independent
5. Use descriptive test names
6. Add comments for complex logic
7. Clean up state in beforeEach/afterEach

## Debugging

### View Test in Browser
```bash
pnpm test:e2e:headed
```

### Use Playwright Inspector
```bash
pnpm test:e2e:debug
```

### Check Screenshots
Failed tests automatically save screenshots to:
```
test-results/[test-name]/test-failed-1.png
```

### Check Videos
Failed tests with retries save videos to:
```
test-results/[test-name]/video.webm
```

## CI/CD Integration

The tests are configured to run in CI with:
- 2 retries on failure
- Single worker for stability
- JSON and HTML reports
- Screenshots and videos on failure

## Troubleshooting

### Tests timeout waiting for results
- Verify backend is running on port 8001
- Check Meilisearch is indexed
- Verify API endpoint returns data

### Tests fail to start
- Run `pnpm exec playwright install chromium`
- Verify port 5173 is not blocked
- Check dev server starts successfully

### Can't find elements
- Verify `data-testid` attributes exist
- Check component is rendered
- Wait for loading states to complete

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Test Selectors](https://playwright.dev/docs/selectors)

## Questions?

Refer to the comprehensive summary:
```
apps/web/E2E_TEST_SUMMARY.md
```
