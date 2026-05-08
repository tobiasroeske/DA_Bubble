import { test, expect } from '@playwright/test';

test.describe('DA Bubble Smoke Tests', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[type="email"], input[type="text"]').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('guest login redirects to board', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill('guest@guest.de');
    await passwordInput.fill('12345678');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await page.waitForURL(/board/, { timeout: 15000 });
    await expect(page).toHaveURL(/board/);
  });

  test('board shows sidenav after login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').first().fill('guest@guest.de');
    await page.locator('input[type="password"]').first().fill('12345678');
    await page.locator('button[type="submit"]').first().click();

    await page.waitForURL(/board/, { timeout: 15000 });
    await expect(page.locator('app-sidenav').first()).toBeVisible({ timeout: 10000 });
  });
});
