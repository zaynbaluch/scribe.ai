import { test, expect } from '@playwright/test';

test.describe('Scribe.ai Core Flows', () => {
  test('Landing page loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check hero text
    await expect(page.locator('text=Your career story')).toBeVisible();
    
    // Check navigation buttons
    const getStartedBtn = page.getByRole('link', { name: 'Get Started' }).first();
    await expect(getStartedBtn).toBeVisible();
  });

  test('Login redirection works', async ({ page }) => {
    await page.goto('/login');
    
    // Ensure we see the login form
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
