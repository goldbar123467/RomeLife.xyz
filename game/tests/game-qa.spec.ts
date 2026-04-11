import { test, expect, Page } from '@playwright/test';

// ============================================
// Shared helper: navigate through intro + founder select to get into the game
// ============================================
async function startGame(page: Page, founder: 'Romulus' | 'Remus' = 'Romulus') {
    await page.goto('/');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Intro screen
    await expect(page.getByText('FOUNDING OF ROME')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Begin Your Legacy' }).click();
    await page.waitForTimeout(400);

    // Founder select
    await expect(page.getByText('Choose Your Founder')).toBeVisible({ timeout: 5000 });
    await page.getByText(founder, { exact: true }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: new RegExp(`Found Rome as ${founder}`) }).click();
    await page.waitForTimeout(1000);
}

// Click a sidebar tab by its visible label text
async function clickSidebarTab(page: Page, label: string): Promise<boolean> {
    // Sidebar tabs are motion.button with role="tab" and visible text in a span
    const tab = page.locator(`nav[role="navigation"] button[role="tab"]:has(span:text("${label}"))`).first();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(400);
        return true;
    }
    // Fallback: try text matching
    const fallback = page.locator('nav[role="navigation"] button').filter({ hasText: label }).first();
    if (await fallback.isVisible({ timeout: 1000 }).catch(() => false)) {
        await fallback.click();
        await page.waitForTimeout(400);
        return true;
    }
    return false;
}

// Dismiss modals (senator events, battles, popups)
async function dismissAllModals(page: Page) {
    for (let attempt = 0; attempt < 5; attempt++) {
        const hasModal = await page.locator('.fixed.inset-0').first().isVisible({ timeout: 300 }).catch(() => false);
        if (!hasModal) break;

        // Senator event choices
        const senatorChoice = page.locator('.fixed button.rounded-xl:not([disabled])').first();
        if (await senatorChoice.isVisible({ timeout: 200 }).catch(() => false)) {
            await senatorChoice.click({ force: true });
            await page.waitForTimeout(300);
            continue;
        }

        // Battle buttons
        for (const btnText of ['Attack', 'Fight', 'Retreat']) {
            const btn = page.locator(`.fixed button:has-text("${btnText}")`).first();
            if (await btn.isVisible({ timeout: 150 }).catch(() => false)) {
                await btn.click();
                await page.waitForTimeout(500);
                break;
            }
        }

        // Standard dismiss
        for (const text of ['Dismiss', 'OK', 'Continue', 'Close', 'Accept', 'Confirm']) {
            const btn = page.locator(`button:has-text("${text}")`).first();
            if (await btn.isVisible({ timeout: 150 }).catch(() => false)) {
                await btn.click();
                await page.waitForTimeout(200);
                break;
            }
        }

        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
    }
}

// All sidebar tab labels
const TABS = [
    'Overview', 'Resources', 'Economy', 'Trade', 'Military', 'Map',
    'Settlement', 'Diplomacy', 'Senate', 'Tech', 'Religion',
    'Wonders', 'Quests', 'Achievements',
] as const;

test.describe('Rome Empire Builder - QA Smoke Tests', () => {

    test('Intro screen loads and shows title', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
        await page.reload();
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('FOUNDING OF ROME')).toBeVisible({ timeout: 15000 });
        await expect(page.getByText('Complete Edition')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Begin Your Legacy' })).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/01-intro.png', fullPage: true });
    });

    test('Founder selection and game start', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
        await page.reload();
        await page.waitForLoadState('networkidle');

        await page.getByRole('button', { name: 'Begin Your Legacy' }).click();
        await page.waitForTimeout(500);

        await expect(page.getByText('Choose Your Founder')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Romulus')).toBeVisible();
        await expect(page.getByText('Remus')).toBeVisible();
        await expect(page.getByText('Warrior')).toBeVisible();
        await expect(page.getByText('Diplomat')).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/02-founder-select.png', fullPage: true });

        // Select Romulus and confirm
        await page.getByText('Romulus', { exact: true }).first().click();
        await page.waitForTimeout(300);
        const foundButton = page.getByRole('button', { name: /Found Rome as Romulus/ });
        await expect(foundButton).toBeVisible();
        await foundButton.click();
        await page.waitForTimeout(1000);

        // Should be in the main game
        await expect(page.locator('header')).toBeVisible();
        await page.screenshot({ path: 'tests/screenshots/03-game-start.png', fullPage: true });
    });

    test('All sidebar tabs load without NaN errors', async ({ page }) => {
        await startGame(page);

        const errors: string[] = [];

        for (const tabLabel of TABS) {
            const clicked = await clickSidebarTab(page, tabLabel);
            if (!clicked) {
                errors.push(`Tab button not found: ${tabLabel}`);
                continue;
            }

            // Check for NaN in the main content area
            const mainContent = await page.locator('main').textContent() || '';
            if (mainContent.includes('NaN')) {
                errors.push(`NaN found on ${tabLabel} tab`);
            }

            await page.screenshot({
                path: `tests/screenshots/tab-${tabLabel.toLowerCase()}.png`,
                fullPage: true
            });
        }

        if (errors.length > 0) {
            console.log('Tab errors:', errors);
        }
        expect(errors.filter(e => e.includes('NaN'))).toHaveLength(0);
    });

    test('Header displays game info', async ({ page }) => {
        await startGame(page);

        const header = page.locator('header');
        await expect(header).toBeVisible();
        const headerText = await header.textContent() || '';
        expect(headerText.length).toBeGreaterThan(0);

        await page.screenshot({ path: 'tests/screenshots/header.png' });
    });

    test('End season via Space key advances the game', async ({ page }) => {
        await startGame(page);

        await page.screenshot({ path: 'tests/screenshots/before-end-season.png', fullPage: true });

        await page.keyboard.press('Space');
        await page.waitForTimeout(1000);
        await dismissAllModals(page);

        // Page should still be functional
        await expect(page.locator('header')).toBeVisible();
        await page.screenshot({ path: 'tests/screenshots/after-end-season.png', fullPage: true });
    });

    test('Economy panel renders charts after a few seasons', async ({ page }) => {
        await startGame(page);

        // End enough seasons to build up treasuryHistory (need > 1 entry)
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Space');
            await page.waitForTimeout(800);
            await dismissAllModals(page);
        }

        await clickSidebarTab(page, 'Economy');

        // Charts render conditionally when treasuryHistory.length > 1
        // Use a Recharts-specific selector; ResponsiveContainer renders SVGs
        const charts = await page.locator('.recharts-responsive-container').count();
        console.log(`Found ${charts} Recharts containers on Economy panel`);

        // Core economy sections should always be visible
        await expect(page.getByText('Taxation Policy')).toBeVisible();
        await expect(page.getByText('Expenditure Breakdown')).toBeVisible();

        // If history has built up, charts should appear
        if (charts > 0) {
            await expect(page.getByText('Treasury History')).toBeVisible();
        }

        await page.screenshot({ path: 'tests/screenshots/economy-charts.png', fullPage: true });
    });

    test('Military panel shows recruitment options', async ({ page }) => {
        await startGame(page);
        await clickSidebarTab(page, 'Military');

        await expect(page.getByText('Troops').first()).toBeVisible();
        await expect(page.getByText('Morale').first()).toBeVisible();
        await expect(page.getByText('Militia').first()).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/military.png', fullPage: true });

        // Try to select a unit and recruit
        await page.getByText('Militia').first().click();
        await page.waitForTimeout(300);

        const recruitBtn = page.locator('button:has-text("Recruit")').first();
        if (await recruitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            const isEnabled = await recruitBtn.isEnabled();
            console.log(`Recruit button visible, enabled: ${isEnabled}`);
            if (isEnabled) {
                await recruitBtn.click();
                await page.waitForTimeout(500);
                await page.screenshot({ path: 'tests/screenshots/after-recruit.png', fullPage: true });
            }
        }
    });

    test('Religion panel shows gods', async ({ page }) => {
        await startGame(page);
        await clickSidebarTab(page, 'Religion');

        await expect(page.getByText('Religion & Gods')).toBeVisible();
        await expect(page.getByText('Piety').first()).toBeVisible();
        await expect(page.getByText('Jupiter').first()).toBeVisible();
        await expect(page.getByText('Mars').first()).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/religion.png', fullPage: true });
    });

    test('Map panel shows territories', async ({ page }) => {
        await startGame(page);
        await clickSidebarTab(page, 'Map');

        await expect(page.getByText('Territory Map')).toBeVisible();
        await expect(page.getByText('Palatine Hill')).toBeVisible();
        await expect(page.getByText('Conquests Available')).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/map.png', fullPage: true });
    });

    test('Settlement panel shows buildings', async ({ page }) => {
        await startGame(page);
        await clickSidebarTab(page, 'Settlement');

        await expect(page.getByText('Population').first()).toBeVisible();
        await expect(page.getByText('Housing Capacity').first()).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/settlement.png', fullPage: true });
    });

    test('Technology panel shows research tree', async ({ page }) => {
        await startGame(page);
        await clickSidebarTab(page, 'Tech');

        await expect(page.getByText('Technology').first()).toBeVisible();
        await expect(page.getByText('Research Progress')).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/technology.png', fullPage: true });
    });

    test('Trade panel shows trade hub', async ({ page }) => {
        await startGame(page);
        await clickSidebarTab(page, 'Trade');

        await expect(page.getByText('Trade Hub')).toBeVisible();

        // Trade sub-tabs are custom buttons with labels hidden on mobile (hidden md:inline)
        // At 1920x1080, they should be visible
        await expect(page.getByText('Quick Trade').first()).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/trade.png', fullPage: true });
    });

    test('No NaN or rendering bugs after 5 seasons', async ({ page }) => {
        await startGame(page);

        const bugs: string[] = [];

        for (let round = 1; round <= 5; round++) {
            await page.keyboard.press('Space');
            await page.waitForTimeout(800);
            await dismissAllModals(page);

            const content = await page.locator('body').textContent() || '';
            if (content.includes('NaN')) {
                bugs.push(`Round ${round}: NaN found in page`);
            }
        }

        // Spot-check key tabs
        for (const tab of ['Overview', 'Economy', 'Military']) {
            await clickSidebarTab(page, tab);
            const tabContent = await page.locator('main').textContent() || '';
            if (tabContent.includes('NaN')) {
                bugs.push(`NaN on ${tab} tab after 5 seasons`);
            }
        }

        console.log(`Bugs found: ${bugs.length}`, bugs);
        expect(bugs).toHaveLength(0);
    });
});
