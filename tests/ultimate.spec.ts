import { test, expect } from '@playwright/test';

test.describe('Ultimate E2E Imposify Flow', () => {
  const rand = () => Math.random().toString(36).substring(2, 8);
  
  test('Complete User Journey: Register -> Configure Layout -> Apply Coupon -> Imposer -> Admin Check', async ({ page }) => {
    // 1. Navigation & Basic Checks
    await page.goto('/');
    await expect(page.locator('text=Login')).toBeVisible();

    // 2. Authentication (Registration)
    await page.click('text=Login');
    await page.click('text=Sign up here');
    const testEmail = `ultimate_${rand()}@imposify.test`;
    await page.fill('input[placeholder="Full Name"]', 'Ultimate User');
    await page.fill('input[placeholder="Email Address"]', testEmail);
    await page.fill('input[placeholder="Password"]', 'Password123!');
    await page.click('button:has-text("Sign Up")');
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible({ timeout: 10000 });

    // 3. Layout configuration (Preset changes)
    // Switch to GATE Reference
    await page.getByRole('button', { name: /GATE Reference/i }).click();
    await expect(page.locator('text=1 sheets (9-up')).toBeVisible({ timeout: 5000 });

    // Switch back to Default (MAKAUT)
    await page.getByRole('button', { name: /MAKAUT Notes/i }).click();

    // 4. Print Cost Estimator & Coupon Application
    // We will mock the coupon API so we don't rely on database setup
    await page.route('**/api/coupons/ULTIMATE', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 'ULTIMATE', free_credits: 10, discount_value: 0, discount_type: 'none' }) });
    });
    await page.route('**/api/coupons/ULTIMATE/redeem', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Coupon "ULTIMATE" successfully applied!' }) });
    });

    await page.fill('input[placeholder*="FREEPRINT"]', 'ULTIMATE');
    await page.click('button:has-text("Apply Redeem")');
    
    // Check if successfully applied message appears
    await expect(page.locator('text=successfully applied').first()).toBeVisible({ timeout: 5000 });

    // 5. Imposition Engine (Compile & Download)
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Compile & Download PDF');

    // It should say Compiling...
    await expect(page.locator('text=Compiling...')).toBeVisible();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');

    await expect(page.locator('text=Success!')).toBeVisible({ timeout: 15000 });

    // 6. Access Restrictions (Check Admin View)
    // Non-admins shouldn't be able to access the admin stats endpoint, so the panel will show error or be empty
    await expect(page.locator('button:has-text("System Admin Console")')).toHaveCount(0);

    // 7. Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 5000 });
  });
});
