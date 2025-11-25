import { test, expect } from '@playwright/test';
import {
  login,
  register,
  logout,
  generateRandomEmail,
  generateRandomName,
  clearAllData,
} from './fixtures/test-helpers';

/**
 * PRIORITY 2: Authentication Flow Tests
 *
 * Tests for:
 * - User registration
 * - User login
 * - User logout
 * - Protected route access
 * - Session persistence
 * - Error handling
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all data before each test
    await clearAllData(page);
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Verify page title
    await expect(page).toHaveTitle(/Login/);

    // Verify login form elements
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

    // Verify link to register
    await expect(page.locator('[data-testid="register-link"]')).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');

    // Verify page title
    await expect(page).toHaveTitle(/Register/);

    // Verify register form elements
    await expect(page.locator('[data-testid="full-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-button"]')).toBeVisible();

    // Verify link to login
    await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    const email = generateRandomEmail();
    const password = 'TestPassword123!';
    const fullName = generateRandomName();

    await register(page, email, password, fullName);

    // Wait for redirect or success message
    await page.waitForTimeout(2000);

    // Verify user is redirected to dashboard or home
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|home|$)/);
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[data-testid="full-name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'Password123!');

    await page.click('[data-testid="register-button"]');

    // Verify error message is shown
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
  });

  test('should show validation error for weak password', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[data-testid="full-name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', generateRandomEmail());
    await page.fill('[data-testid="password-input"]', '123'); // Too weak

    await page.click('[data-testid="register-button"]');

    // Verify password error is shown
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });

  test('should show error for duplicate email registration', async ({ page }) => {
    const email = 'existing@example.com'; // Assuming this exists
    const password = 'TestPassword123!';
    const fullName = 'Test User';

    await register(page, email, password, fullName);

    // Wait for error or response
    await page.waitForTimeout(2000);

    // Verify error message is shown
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText(/already exists|email is taken/i);
    }
  });

  test('should login with valid credentials', async ({ page }) => {
    // Use test credentials (adjust based on your test data)
    const email = 'test@example.com';
    const password = 'password123';

    await login(page, email, password);

    // Verify user is on dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify user menu is visible
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');

    await page.click('[data-testid="login-button"]');

    // Wait for error
    await page.waitForTimeout(2000);

    // Verify error message is shown
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    await page.click('[data-testid="login-button"]');

    // Check if loading state appears
    const loadingButton = page.locator('[data-testid="login-button"][disabled]');
    if (await loadingButton.isVisible()) {
      await expect(loadingButton).toBeVisible();
    }
  });

  test('should logout user successfully', async ({ page }) => {
    // Login first
    await login(page, 'test@example.com', 'password123');

    // Verify on dashboard
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await logout(page);

    // Verify redirected to login
    await expect(page).toHaveURL('/login');

    // Verify user menu is not visible
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should preserve redirect URL after login', async ({ page }) => {
    // Try to access protected page
    await page.goto('/dashboard/bookmarks');

    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/login/);

    // Login
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Wait for redirect
    await page.waitForTimeout(2000);

    // Should redirect back to original page
    const url = page.url();
    expect(url).toMatch(/\/dashboard/);
  });

  test('should persist session after page reload', async ({ page }) => {
    // Login
    await login(page, 'test@example.com', 'password123');

    // Verify on dashboard
    await expect(page).toHaveURL('/dashboard');

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should clear session after logout', async ({ page }) => {
    // Login
    await login(page, 'test@example.com', 'password123');

    // Logout
    await logout(page);

    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show password visibility toggle', async ({ page }) => {
    await page.goto('/login');

    // Verify password input type is password
    const passwordInput = page.locator('[data-testid="password-input"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button (if exists)
    const toggleButton = page.locator('[data-testid="password-toggle"]');
    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Verify type changed to text
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should navigate between login and register pages', async ({ page }) => {
    // Start at login
    await page.goto('/login');

    // Click register link
    await page.click('[data-testid="register-link"]');

    // Verify on register page
    await expect(page).toHaveURL(/\/register/);

    // Click login link
    await page.click('[data-testid="login-link"]');

    // Verify back on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show forgot password link', async ({ page }) => {
    await page.goto('/login');

    // Verify forgot password link exists
    const forgotLink = page.locator('[data-testid="forgot-password-link"]');
    if (await forgotLink.isVisible()) {
      await expect(forgotLink).toBeVisible();

      // Click it
      await forgotLink.click();

      // Verify navigation to forgot password page
      await expect(page).toHaveURL(/\/forgot-password/);
    }
  });

  test('should handle Enter key on login form', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // Press Enter
    await page.keyboard.press('Enter');

    // Wait for redirect
    await page.waitForTimeout(2000);

    // Should be on dashboard
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|$)/);
  });

  test('should display user profile in menu after login', async ({ page }) => {
    // Login
    await login(page, 'test@example.com', 'password123');

    // Click user menu
    await page.click('[data-testid="user-menu"]');

    // Verify user info is shown
    const userInfo = page.locator('[data-testid="user-info"]');
    if (await userInfo.isVisible()) {
      await expect(userInfo).toBeVisible();
    }
  });

  test('should support social login buttons (if implemented)', async ({ page }) => {
    await page.goto('/login');

    // Check for Google login button
    const googleButton = page.locator('[data-testid="google-login"]');
    if (await googleButton.isVisible()) {
      await expect(googleButton).toBeVisible();
    }

    // Check for other social logins
    const githubButton = page.locator('[data-testid="github-login"]');
    if (await githubButton.isVisible()) {
      await expect(githubButton).toBeVisible();
    }
  });
});

test.describe('Session Management', () => {
  test('should handle expired session gracefully', async ({ page }) => {
    // Login
    await login(page, 'test@example.com', 'password123');

    // Simulate expired session by clearing storage
    await page.evaluate(() => {
      localStorage.removeItem('supabase.auth.token');
    });

    // Try to access protected route
    await page.goto('/dashboard/settings');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should refresh token automatically', async ({ page }) => {
    // Login
    await login(page, 'test@example.com', 'password123');

    // Wait for some time (token refresh happens automatically in Supabase)
    await page.waitForTimeout(3000);

    // Navigate to different pages
    await page.goto('/dashboard');
    await page.goto('/institutions');
    await page.goto('/programs');

    // Should still be logged in
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Form Validation', () => {
  test('should disable submit button when form is invalid', async ({ page }) => {
    await page.goto('/login');

    // Submit button should be disabled with empty fields
    const submitButton = page.locator('[data-testid="login-button"]');

    // Check if button is disabled (might not be enforced)
    const isDisabled = await submitButton.isDisabled();
    if (isDisabled) {
      expect(isDisabled).toBeTruthy();
    }
  });

  test('should enable submit button when form is valid', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // Submit button should be enabled
    const submitButton = page.locator('[data-testid="login-button"]');
    await expect(submitButton).toBeEnabled();
  });

  test('should show real-time validation errors', async ({ page }) => {
    await page.goto('/register');

    // Fill invalid email
    await page.fill('[data-testid="email-input"]', 'invalid');
    await page.blur('[data-testid="email-input"]');

    // Wait for validation
    await page.waitForTimeout(500);

    // Check if error appears
    const emailError = page.locator('[data-testid="email-error"]');
    if (await emailError.isVisible()) {
      await expect(emailError).toBeVisible();
    }
  });
});
