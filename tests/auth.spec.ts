import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('User can register and login successfully', async ({ page }) => {
    // 1. Navigate to the app
    await page.goto('/');
    
    // 2. Click the Login button in the header
    await page.click('text=Login');
    
    // Wait for modal to appear
    await expect(page.locator('text=Welcome Back')).toBeVisible();

    // 3. Switch to Registration form
    await page.click('text=Sign up here');
    await expect(page.locator('text=Create Account')).toBeVisible();

    // 4. Fill out the registration form
    // Since we need unique emails for each test run, append a random string
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const testEmail = `playwright_test_${randomSuffix}@example.com`;
    
    await page.fill('input[placeholder="Full Name"]', 'Playwright Tester');
    await page.fill('input[placeholder="Email Address"]', testEmail);
    await page.fill('input[placeholder="Password"]', 'Password123!');
    
    // 5. Submit the form
    await page.click('button:has-text("Sign Up")');

    // 6. Verify success (modal closes, Logout button appears)
    // The "Welcome Back" or "Create Account" should disappear
    await expect(page.locator('text=Create Account')).toBeHidden();
    
    // The "Logout" button should be visible in the header
    await expect(page.locator('text=Logout')).toBeVisible();
    
    // The user should now be authenticated and be able to see their stats panel or normal dashboard
    // Check if the auth token is present in localStorage
    const token = await page.evaluate(() => localStorage.getItem('imposer_token'));
    expect(token).toBeTruthy();
  });
});
