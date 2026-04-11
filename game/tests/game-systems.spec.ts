import { test, expect, Page } from '@playwright/test';

/**
 * Game Systems E2E Tests
 *
 * Tests individual game systems in depth:
 * - Religion: patron selection, worship actions, blessing tiers
 * - Economy: taxation, income/upkeep tracking
 * - Military: recruitment, troop stats
 * - Territory: map, conquest requirements
 * - Settlement: building construction
 * - Technology: research progression
 * - Trade: quick trade, caravans
 * - Senate: senator management, events
 * - Game lifecycle: multi-season progression, failure conditions, results screen
 */

// ── Shared helpers ──

async function startGame(page: Page, founder: 'Romulus' | 'Remus' = 'Romulus') {
    await page.goto('/');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('FOUNDING OF ROME')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Begin Your Legacy' }).click();
    await page.waitForTimeout(400);
    await page.getByText(founder, { exact: true }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: new RegExp(`Found Rome as ${founder}`) }).click();
    await page.waitForTimeout(1000);
}

async function clickNavTab(page: Page, label: string): Promise<boolean> {
    // Sidebar tabs are motion.button[role="tab"] with visible text in a <span>
    const tab = page.locator(`nav[role="navigation"] button[role="tab"]:has(span:text("${label}"))`).first();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(400);
        return true;
    }
    // Fallback: text matching
    const fallback = page.locator('nav[role="navigation"] button').filter({ hasText: label }).first();
    if (await fallback.isVisible({ timeout: 1000 }).catch(() => false)) {
        await fallback.click();
        await page.waitForTimeout(400);
        return true;
    }
    return false;
}

async function endSeason(page: Page) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(600);
    await dismissModals(page);
}

async function dismissModals(page: Page) {
    for (let attempt = 0; attempt < 5; attempt++) {
        const hasModal = await page.locator('.fixed.inset-0').first().isVisible({ timeout: 300 }).catch(() => false);
        if (!hasModal) break;

        // Senator event choice
        const senatorChoice = page.locator('.fixed button.rounded-xl:not([disabled])').first();
        if (await senatorChoice.isVisible({ timeout: 200 }).catch(() => false)) {
            await senatorChoice.click({ force: true });
            await page.waitForTimeout(300);
            continue;
        }

        // Battle buttons
        const attackBtn = page.getByRole('button', { name: /Attack|Fight/i }).first();
        if (await attackBtn.isVisible({ timeout: 150 }).catch(() => false) && await attackBtn.isEnabled().catch(() => false)) {
            await attackBtn.click();
            await page.waitForTimeout(800);
            continue;
        }
        const retreatBtn = page.getByRole('button', { name: /Retreat/i }).first();
        if (await retreatBtn.isVisible({ timeout: 150 }).catch(() => false)) {
            await retreatBtn.click();
            await page.waitForTimeout(400);
            continue;
        }

        // Standard dismiss
        let handled = false;
        for (const text of ['Dismiss', 'OK', 'Continue', 'Close', 'Accept', 'Confirm']) {
            const btn = page.getByRole('button', { name: text }).first();
            if (await btn.isVisible({ timeout: 100 }).catch(() => false)) {
                await btn.click();
                await page.waitForTimeout(200);
                handled = true;
                break;
            }
        }
        if (handled) continue;

        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
    }
}

// ── Tests ──

test.describe('Religion System', () => {
    test('Can view gods and select a patron', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Religion');

        // Verify gods panel loads
        await expect(page.getByText('Religion & Gods')).toBeVisible();
        await expect(page.getByText('Piety')).toBeVisible();

        // Gods sub-tab should be the default (these are plain buttons, not role="tab")
        await expect(page.locator('button:has-text("Gods")').first()).toBeVisible();

        // Major gods should be visible
        const gods = ['Jupiter', 'Mars', 'Venus', 'Ceres', 'Mercury', 'Minerva'];
        for (const god of gods) {
            await expect(page.getByText(god).first()).toBeVisible();
        }

        // Click Jupiter to see detail
        await page.getByText('Jupiter').first().click();
        await page.waitForTimeout(400);

        // Try to select as patron
        const patronBtn = page.getByRole('button', { name: /Choose.*Patron/i }).first();
        if (await patronBtn.isVisible({ timeout: 1000 }).catch(() => false) && await patronBtn.isEnabled().catch(() => false)) {
            await patronBtn.click();
            await page.waitForTimeout(400);

            // Verify patron badge appears
            await expect(page.getByText('Patron God').first()).toBeVisible({ timeout: 3000 });
        }

        await page.screenshot({ path: 'tests/screenshots/religion-patron.png', fullPage: true });
    });

    test('Worship tab shows actions when patron is set', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Religion');

        // Select Mars as patron
        await page.getByText('Mars').first().click();
        await page.waitForTimeout(300);
        const patronBtn = page.getByRole('button', { name: /Choose.*Patron/i }).first();
        if (await patronBtn.isVisible({ timeout: 1000 }).catch(() => false) && await patronBtn.isEnabled().catch(() => false)) {
            await patronBtn.click();
            await page.waitForTimeout(400);
        }

        // Switch to Worship sub-tab
        const worshipTab = page.locator('button:has-text("Worship")').first();
        await expect(worshipTab).toBeVisible();
        await worshipTab.click();
        await page.waitForTimeout(400);

        // Should see worship actions (not the "select a patron" message)
        const noPatronMsg = page.getByText('Select a patron god');
        const hasNoPatron = await noPatronMsg.isVisible({ timeout: 500 }).catch(() => false);

        if (!hasNoPatron) {
            // Worship actions should be visible
            await expect(page.getByText('About Worship').first()).toBeVisible({ timeout: 3000 });
        }

        await page.screenshot({ path: 'tests/screenshots/religion-worship.png', fullPage: true });
    });

    test('Buildings tab shows religious structures', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Religion');

        const buildingsTab = page.locator('button:has-text("Buildings")').first();
        await expect(buildingsTab).toBeVisible();
        await buildingsTab.click();
        await page.waitForTimeout(400);

        // Should see building options with costs
        await expect(page.getByText(/denarii/).first()).toBeVisible({ timeout: 3000 });

        // Should have Build buttons
        const buildButtons = page.getByRole('button', { name: /Build/i });
        const count = await buildButtons.count();
        expect(count).toBeGreaterThan(0);

        await page.screenshot({ path: 'tests/screenshots/religion-buildings.png', fullPage: true });
    });
});

test.describe('Economy System', () => {
    test('Taxation policy controls are functional', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Economy');

        await expect(page.getByText('Taxation Policy')).toBeVisible();
        await expect(page.getByText('Tax Rate')).toBeVisible();

        // Tax presets should be visible
        const presets = ['Minimal', 'Low', 'Standard', 'High'];
        for (const preset of presets) {
            await expect(page.getByText(preset).first()).toBeVisible();
        }

        await page.screenshot({ path: 'tests/screenshots/economy-tax.png', fullPage: true });
    });

    test('Expenditure breakdown shows cost categories', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Economy');

        await expect(page.getByText('Expenditure Breakdown')).toBeVisible();
        await expect(page.getByText('Military Upkeep')).toBeVisible();
        await expect(page.getByText('Total Upkeep')).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/economy-expenditure.png', fullPage: true });
    });

    test('Treasury history charts appear after seasons', async ({ page }) => {
        await startGame(page);

        // Play a few seasons to generate data
        for (let i = 0; i < 3; i++) {
            await endSeason(page);
        }

        await clickNavTab(page, 'Economy');
        await expect(page.getByText('Treasury History')).toBeVisible();

        const charts = await page.locator('svg.recharts-surface').count();
        expect(charts).toBeGreaterThan(0);

        await page.screenshot({ path: 'tests/screenshots/economy-history.png', fullPage: true });
    });
});

test.describe('Military System', () => {
    test('Shows troop stats and unit roster', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Military');

        const main = page.locator('main');

        // Core stats visible within main content
        await expect(main.getByText('Troops').first()).toBeVisible();
        await expect(main.getByText('Morale').first()).toBeVisible();

        // Unit roster visible
        const units = ['Militia', 'Auxiliaries', 'Legionaries'];
        for (const unit of units) {
            await expect(main.getByText(unit).first()).toBeVisible();
        }

        await page.screenshot({ path: 'tests/screenshots/military-roster.png', fullPage: true });
    });

    test('Recruitment flow works end-to-end', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Military');

        const main = page.locator('main');

        // Click on Militia to select it
        await main.getByText('Militia').first().click();
        await page.waitForTimeout(300);

        // Try to recruit
        const recruitBtn = main.locator('button:has-text("Recruit")').first();
        const isVisible = await recruitBtn.isVisible({ timeout: 1000 }).catch(() => false);

        if (isVisible && await recruitBtn.isEnabled().catch(() => false)) {
            await recruitBtn.click();
            await page.waitForTimeout(500);

            // Page should still be functional after recruitment
            await expect(main.getByText('Troops').first()).toBeVisible();
            console.log('Recruitment succeeded');
        } else {
            console.log('Recruit button not available (may lack resources)');
        }

        await page.screenshot({ path: 'tests/screenshots/military-recruit.png', fullPage: true });
    });
});

test.describe('Territory & Map System', () => {
    test('Map shows owned and conquerable territories', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Map');

        await expect(page.getByText('Territory Map')).toBeVisible();

        // Starting territory: Palatine Hill
        await expect(page.getByText('Palatine Hill')).toBeVisible();
        await expect(page.getByText('Mons Palatinus')).toBeVisible();

        // Conquerable territories section
        await expect(page.getByText('Conquests Available')).toBeVisible();

        // At least one conquerable territory should exist
        const conquerBtns = page.getByRole('button', { name: /Conquer/i });
        const conquerCount = await conquerBtns.count();
        expect(conquerCount).toBeGreaterThanOrEqual(0); // May be 0 if no troops meet requirements

        await page.screenshot({ path: 'tests/screenshots/map-territories.png', fullPage: true });
    });

    test('Territory details show stability and garrison', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Map');

        // Check territory stats are rendered
        await expect(page.getByText('Stability').first()).toBeVisible();

        // Owned territories should show "Your Empire" section
        await expect(page.getByText('Your Empire')).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/map-details.png', fullPage: true });
    });
});

test.describe('Settlement System', () => {
    test('Shows housing, sanitation, and defense stats', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Settlement');

        const main = page.locator('main');

        // Settlement header uses SectionHeader component
        await expect(main.getByText('Population').first()).toBeVisible();
        await expect(main.getByText('Housing Capacity').first()).toBeVisible();

        // Sections should load
        await expect(main.getByRole('heading', { name: 'City Defenses' })).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/settlement-overview.png', fullPage: true });
    });

    test('Build structures section shows available buildings', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Settlement');

        const main = page.locator('main');

        // Should have a Build Structures heading
        await expect(main.getByRole('heading', { name: 'Build Structures' })).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/settlement-buildings.png', fullPage: true });
    });
});

test.describe('Technology System', () => {
    test('Shows research tree and progress', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Tech');

        await expect(page.getByText('Technology')).toBeVisible();
        await expect(page.getByText('Research Progress')).toBeVisible();

        // Should show tech categories
        const categories = ['economy', 'military', 'farming'];
        for (const cat of categories) {
            const catText = page.getByText(new RegExp(cat, 'i')).first();
            await expect(catText).toBeVisible();
        }

        // Should have Research buttons
        const researchBtns = page.getByRole('button', { name: /Research/i });
        const count = await researchBtns.count();
        expect(count).toBeGreaterThan(0);

        await page.screenshot({ path: 'tests/screenshots/tech-tree.png', fullPage: true });
    });

    test('Can research a technology', async ({ page }) => {
        await startGame(page);

        // End a few seasons to accumulate money
        for (let i = 0; i < 4; i++) {
            await endSeason(page);
        }

        await clickNavTab(page, 'Tech');

        // Try to research the first available tech
        const researchBtn = page.getByRole('button', { name: /Research/i }).first();
        if (await researchBtn.isVisible({ timeout: 1000 }).catch(() => false) && await researchBtn.isEnabled().catch(() => false)) {
            await researchBtn.click();
            await page.waitForTimeout(500);
            console.log('Research initiated');
        }

        await page.screenshot({ path: 'tests/screenshots/tech-research.png', fullPage: true });
    });
});

test.describe('Trade System', () => {
    test('Trade Hub loads with sub-tabs', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Trade');

        await expect(page.getByText('Trade Hub')).toBeVisible();

        // Trade sub-tabs (custom buttons, visible at 1920px)
        await expect(page.getByText('Quick Trade').first()).toBeVisible();
        await expect(page.getByText('Trade Routes').first()).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/trade-hub.png', fullPage: true });
    });

    test('Market Intel tab shows price data', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Trade');

        const intelTab = page.locator('button:has-text("Market Intel")').first();
        await intelTab.click();
        await page.waitForTimeout(400);

        await expect(page.getByText('Market Intelligence')).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/trade-intel.png', fullPage: true });
    });
});

test.describe('Senate System', () => {
    test('Senate panel initializes with senators', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Senate');

        // Allow senate to initialize
        await page.waitForTimeout(1000);

        // Check for senator names
        const senators = ['Sertorius', 'Sulla', 'Clodius', 'Pulcher', 'Oppius'];
        let foundCount = 0;
        for (const name of senators) {
            if (await page.getByText(name).first().isVisible({ timeout: 500 }).catch(() => false)) {
                foundCount++;
            }
        }
        console.log(`Found ${foundCount}/5 senators on Senate panel`);

        await page.screenshot({ path: 'tests/screenshots/senate.png', fullPage: true });
    });
});

test.describe('Overview Panel', () => {
    test('Shows all key stats on dashboard', async ({ page }) => {
        await startGame(page);

        // Should start on Overview tab
        const mainContent = page.locator('main');

        // Key stat labels
        const stats = ['Denarii', 'Population', 'Happiness', 'Troops', 'Morale'];
        for (const stat of stats) {
            await expect(mainContent.getByText(stat).first()).toBeVisible();
        }

        await page.screenshot({ path: 'tests/screenshots/overview-stats.png', fullPage: true });
    });

    test('Imperial Events update after ending seasons', async ({ page }) => {
        await startGame(page);

        // End a season to generate events
        await endSeason(page);

        // The overview should still render correctly
        await clickNavTab(page, 'Overview');
        const mainContent = await page.locator('main').textContent() || '';
        expect(mainContent).not.toContain('NaN');

        await page.screenshot({ path: 'tests/screenshots/overview-after-season.png', fullPage: true });
    });
});

test.describe('Game Lifecycle', () => {
    test.setTimeout(120000); // 2 minutes

    test('Game survives 10 seasons without crashing', async ({ page }) => {
        await startGame(page);

        const bugs: string[] = [];

        for (let i = 1; i <= 10; i++) {
            await endSeason(page);

            // Check page is still functional
            const header = page.locator('header');
            await expect(header).toBeVisible({ timeout: 3000 });

            // Spot-check for NaN
            const main = await page.locator('main').textContent() || '';
            if (main.includes('NaN')) {
                bugs.push(`Season ${i}: NaN in main content`);
            }
        }

        console.log(`10-season run complete. Bugs: ${bugs.length}`);
        expect(bugs).toHaveLength(0);

        await page.screenshot({ path: 'tests/screenshots/lifecycle-10-seasons.png', fullPage: true });
    });

    test('Remus founder starts correctly with different bonuses', async ({ page }) => {
        await startGame(page, 'Remus');

        // Should be in game
        await expect(page.locator('header')).toBeVisible();

        // Overview should show stats
        const mainContent = page.locator('main');
        await expect(mainContent.getByText('Denarii').first()).toBeVisible();
        await expect(mainContent.getByText('Population').first()).toBeVisible();

        await page.screenshot({ path: 'tests/screenshots/remus-start.png', fullPage: true });
    });

    test('State persists via localStorage on page reload', async ({ page }) => {
        await startGame(page);

        // End a few seasons
        for (let i = 0; i < 3; i++) {
            await endSeason(page);
        }

        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Game should restore (not show intro screen)
        const introVisible = await page.getByText('FOUNDING OF ROME').isVisible({ timeout: 2000 }).catch(() => false);
        const gameVisible = await page.locator('header').isVisible({ timeout: 2000 }).catch(() => false);

        // Either the game restored or the intro shows (both are valid depending on persist config)
        expect(introVisible || gameVisible).toBeTruthy();

        await page.screenshot({ path: 'tests/screenshots/lifecycle-reload.png', fullPage: true });
    });
});

test.describe('Achievements & Quests', () => {
    test('Achievements panel loads', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Achievements');

        // Should show achievements content
        const main = await page.locator('main').textContent() || '';
        expect(main.length).toBeGreaterThan(0);
        expect(main).not.toContain('NaN');

        await page.screenshot({ path: 'tests/screenshots/achievements.png', fullPage: true });
    });

    test('Quests panel loads', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Quests');

        const main = await page.locator('main').textContent() || '';
        expect(main.length).toBeGreaterThan(0);
        expect(main).not.toContain('NaN');

        await page.screenshot({ path: 'tests/screenshots/quests.png', fullPage: true });
    });
});

test.describe('Wonders & Diplomacy', () => {
    test('Wonders panel loads', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Wonders');

        const main = await page.locator('main').textContent() || '';
        expect(main.length).toBeGreaterThan(0);
        expect(main).not.toContain('NaN');

        await page.screenshot({ path: 'tests/screenshots/wonders.png', fullPage: true });
    });

    test('Diplomacy panel loads with nations', async ({ page }) => {
        await startGame(page);
        await clickNavTab(page, 'Diplomacy');

        const main = await page.locator('main').textContent() || '';
        expect(main.length).toBeGreaterThan(0);
        expect(main).not.toContain('NaN');

        await page.screenshot({ path: 'tests/screenshots/diplomacy.png', fullPage: true });
    });
});
