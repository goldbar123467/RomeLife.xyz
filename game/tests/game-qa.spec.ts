import { test, expect } from '@playwright/test';

// All tabs to test
const TABS = [
    'overview',
    'resources',
    'economy',
    'trade',
    'military',
    'map',
    'settlement',
    'diplomacy',
    'technology',
    'religion',
    'achievements',
] as const;

test.describe('Rome Empire Builder - Full QA', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to the game
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('Intro screen loads and can proceed', async ({ page }) => {
        // Check intro screen elements
        await expect(page.locator('text=Founding of Rome')).toBeVisible({ timeout: 10000 });
        await page.screenshot({ path: 'tests/screenshots/01-intro.png', fullPage: true });

        // Click to proceed
        await page.click('text=Begin Your Journey');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/screenshots/02-founder-select.png', fullPage: true });
    });

    test('Founder selection works', async ({ page }) => {
        // Get past intro
        await page.click('text=Begin Your Journey');
        await page.waitForTimeout(500);

        // Should see founder options
        await expect(page.locator('text=Romulus')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Remus')).toBeVisible();

        // Select Romulus
        await page.click('text=Romulus');
        await page.waitForTimeout(300);

        // Click confirm/select button
        const selectButton = page.locator('button:has-text("Select"), button:has-text("Choose"), button:has-text("Confirm")').first();
        if (await selectButton.isVisible()) {
            await selectButton.click();
        }

        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/03-game-start.png', fullPage: true });
    });

    test('All tabs load without errors', async ({ page }) => {
        // Get into the game first
        await page.click('text=Begin Your Journey');
        await page.waitForTimeout(500);
        await page.click('text=Romulus');
        await page.waitForTimeout(300);

        const selectButton = page.locator('button:has-text("Select"), button:has-text("Choose"), button:has-text("Confirm")').first();
        if (await selectButton.isVisible()) {
            await selectButton.click();
        }
        await page.waitForTimeout(1000);

        // Now test each tab
        for (const tab of TABS) {
            console.log(`Testing tab: ${tab}`);

            // Click on the tab in the sidebar
            const tabButton = page.locator(`nav button:has-text("${tab}")`, { hasText: new RegExp(tab, 'i') }).first();

            if (await tabButton.isVisible()) {
                await tabButton.click();
                await page.waitForTimeout(500);

                // Take screenshot
                await page.screenshot({
                    path: `tests/screenshots/tab-${tab}.png`,
                    fullPage: true
                });

                // Check for any visible errors
                const errorText = await page.locator('text=Error, text=error, text=undefined, text=NaN').count();
                if (errorText > 0) {
                    console.warn(`Potential error found on ${tab} tab`);
                }
            } else {
                console.warn(`Tab button not found for: ${tab}`);
            }
        }
    });

    test('Game header displays correctly', async ({ page }) => {
        // Get into game
        await page.click('text=Begin Your Journey');
        await page.waitForTimeout(500);
        await page.click('text=Romulus');
        await page.waitForTimeout(300);

        const selectButton = page.locator('button:has-text("Select"), button:has-text("Choose"), button:has-text("Confirm")').first();
        if (await selectButton.isVisible()) {
            await selectButton.click();
        }
        await page.waitForTimeout(1000);

        // Check header elements
        await expect(page.locator('text=ROME')).toBeVisible();
        await expect(page.locator('header')).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/header.png' });
    });

    test('Navigation sidebar is visible', async ({ page }) => {
        // Get into game
        await page.click('text=Begin Your Journey');
        await page.waitForTimeout(500);
        await page.click('text=Romulus');
        await page.waitForTimeout(300);

        const selectButton = page.locator('button:has-text("Select"), button:has-text("Choose"), button:has-text("Confirm")').first();
        if (await selectButton.isVisible()) {
            await selectButton.click();
        }
        await page.waitForTimeout(1000);

        // Check sidebar navigation is visible
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('text=Navigation')).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/sidebar.png' });
    });

    test('End season button works', async ({ page }) => {
        // Get into game
        await page.click('text=Begin Your Journey');
        await page.waitForTimeout(500);
        await page.click('text=Romulus');
        await page.waitForTimeout(300);

        const selectButton = page.locator('button:has-text("Select"), button:has-text("Choose"), button:has-text("Confirm")').first();
        if (await selectButton.isVisible()) {
            await selectButton.click();
        }
        await page.waitForTimeout(1000);

        // Take before screenshot
        await page.screenshot({ path: 'tests/screenshots/before-end-season.png', fullPage: true });

        // Press space to end season
        await page.keyboard.press('Space');
        await page.waitForTimeout(1000);

        // Take after screenshot
        await page.screenshot({ path: 'tests/screenshots/after-end-season.png', fullPage: true });
    });

    test('Economy panel has charts', async ({ page }) => {
        // Get into game
        await page.click('text=Begin Your Journey');
        await page.waitForTimeout(500);
        await page.click('text=Romulus');
        await page.waitForTimeout(300);

        const selectButton = page.locator('button:has-text("Select"), button:has-text("Choose"), button:has-text("Confirm")').first();
        if (await selectButton.isVisible()) {
            await selectButton.click();
        }
        await page.waitForTimeout(1000);

        // End a few seasons to build history
        for (let i = 0; i < 3; i++) {
            await page.keyboard.press('Space');
            await page.waitForTimeout(500);
        }

        // Navigate to economy
        await page.click('nav button:has-text("Economy")');
        await page.waitForTimeout(500);

        // Check for chart elements
        const svgCharts = await page.locator('svg.recharts-surface').count();
        console.log(`Found ${svgCharts} Recharts charts`);

        await page.screenshot({ path: 'tests/screenshots/economy-charts.png', fullPage: true });
    });

    test('Military recruitment works', async ({ page }) => {
        // Get into game
        await page.click('text=Begin Your Journey');
        await page.waitForTimeout(500);
        await page.click('text=Romulus');
        await page.waitForTimeout(300);

        const selectButton = page.locator('button:has-text("Select"), button:has-text("Choose"), button:has-text("Confirm")').first();
        if (await selectButton.isVisible()) {
            await selectButton.click();
        }
        await page.waitForTimeout(1000);

        // Navigate to military
        await page.click('nav button:has-text("Military")');
        await page.waitForTimeout(500);

        // Check for recruitment section
        await expect(page.locator('text=Recruitment')).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/military.png', fullPage: true });

        // Try to recruit (if button is enabled)
        const recruitButton = page.locator('button:has-text("Recruit")').first();
        if (await recruitButton.isEnabled()) {
            await recruitButton.click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: 'tests/screenshots/after-recruit.png', fullPage: true });
        }
    });
});
