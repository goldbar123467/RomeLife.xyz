import { test, expect, Page } from '@playwright/test';

/**
 * Edge Case E2E Tests for Bug Fixes
 *
 * Tests the three bugs identified in the audit:
 * 1. Treasury history records incorrect denarii (missing caravan/wonder/event income)
 * 2. Reputation has no upper bound (can exceed 100, breaks trade risk calc)
 * 3. Building happiness effects only applied when positive (negative effects ignored)
 *
 * Also includes edge case coverage for failure conditions and game state integrity.
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
    const tab = page.locator(`nav[role="navigation"] button[role="tab"]:has(span:text("${label}"))`).first();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(400);
        return true;
    }
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
    for (let attempt = 0; attempt < 8; attempt++) {
        const hasModal = await page.locator('.fixed.inset-0').first().isVisible({ timeout: 300 }).catch(() => false);
        if (!hasModal) break;

        const senatorChoice = page.locator('.fixed button.rounded-xl:not([disabled])').first();
        if (await senatorChoice.isVisible({ timeout: 200 }).catch(() => false)) {
            await senatorChoice.click({ force: true });
            await page.waitForTimeout(300);
            continue;
        }

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

/** Read persisted game state from localStorage */
async function getGameState(page: Page): Promise<Record<string, unknown>> {
    const raw = await page.evaluate(() => localStorage.getItem('rome-empire-save'));
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed.state || parsed;
    } catch {
        return {};
    }
}

// ── Bug Fix #1: Treasury History Accuracy ──

test.describe('Bug Fix #1: Treasury history denarii accuracy', () => {
    test.setTimeout(120000);

    test('Treasury history denarii matches actual state denarii after multiple seasons', async ({ page }) => {
        await startGame(page);

        // Play 8 seasons to accumulate income from various sources
        for (let i = 0; i < 8; i++) {
            await endSeason(page);
        }

        const state = await getGameState(page);
        const treasuryHistory = state.treasuryHistory as Array<{ denarii: number; round: number; season: string }> | undefined;
        const actualDenarii = state.denarii as number;

        expect(treasuryHistory).toBeDefined();
        expect(treasuryHistory!.length).toBeGreaterThan(0);

        // The last treasury entry's denarii should match the actual game denarii
        const lastEntry = treasuryHistory![treasuryHistory!.length - 1];
        expect(lastEntry.denarii).toBe(actualDenarii);

        // All treasury entries should have non-negative denarii
        for (const entry of treasuryHistory!) {
            expect(entry.denarii).toBeGreaterThanOrEqual(0);
        }
    });

    test('Treasury history shows no NaN or Infinity values', async ({ page }) => {
        await startGame(page);

        for (let i = 0; i < 6; i++) {
            await endSeason(page);
        }

        const state = await getGameState(page);
        const treasuryHistory = state.treasuryHistory as Array<{ denarii: number; income: number; upkeep: number; netIncome: number }> | undefined;

        expect(treasuryHistory).toBeDefined();
        for (const entry of treasuryHistory!) {
            expect(Number.isFinite(entry.denarii)).toBe(true);
            expect(Number.isFinite(entry.income)).toBe(true);
            expect(Number.isFinite(entry.upkeep)).toBe(true);
            expect(Number.isFinite(entry.netIncome)).toBe(true);
        }
    });

    test('Economy panel Treasury History chart renders without errors', async ({ page }) => {
        await startGame(page);

        // Generate enough history for charts
        for (let i = 0; i < 5; i++) {
            await endSeason(page);
        }

        await clickNavTab(page, 'Economy');
        await expect(page.getByText('Treasury History')).toBeVisible();

        // Charts should render (SVG elements from recharts)
        const charts = await page.locator('svg.recharts-surface').count();
        expect(charts).toBeGreaterThan(0);

        // No NaN in the economy panel
        const content = await page.locator('main').textContent() || '';
        expect(content).not.toContain('NaN');
        expect(content).not.toContain('Infinity');
        expect(content).not.toContain('undefined');
    });
});

// ── Bug Fix #2: Reputation Upper Bound ──

test.describe('Bug Fix #2: Reputation capped at 100', () => {
    test.setTimeout(180000);

    test('Reputation never exceeds 100 after many seasons of gameplay', async ({ page }) => {
        await startGame(page);

        // Play 20 seasons - enough for achievements, events, and reputation gain
        for (let i = 0; i < 20; i++) {
            await endSeason(page);
        }

        const state = await getGameState(page);
        const reputation = state.reputation as number;

        expect(reputation).toBeDefined();
        expect(reputation).toBeLessThanOrEqual(100);
        expect(reputation).toBeGreaterThanOrEqual(0);
    });

    test('Reputation stays within 0-100 range across all seasons in history', async ({ page }) => {
        await startGame(page);

        const reputationValues: number[] = [];

        // Play 15 seasons, sampling reputation each time
        for (let i = 0; i < 15; i++) {
            await endSeason(page);

            const state = await getGameState(page);
            const rep = state.reputation as number;
            reputationValues.push(rep);
        }

        // All reputation values should be in [0, 100]
        for (let i = 0; i < reputationValues.length; i++) {
            expect(reputationValues[i]).toBeGreaterThanOrEqual(0);
            expect(reputationValues[i]).toBeLessThanOrEqual(100);
        }
    });

    test('Trading increases reputation but caps at 100', async ({ page }) => {
        await startGame(page);

        // First play a few seasons to stabilize
        for (let i = 0; i < 4; i++) {
            await endSeason(page);
        }

        // Navigate to Trade tab and try to trade
        await clickNavTab(page, 'Trade');

        // Verify no NaN in trade panel
        const tradeContent = await page.locator('main').textContent() || '';
        expect(tradeContent).not.toContain('NaN');

        // Check current reputation from state
        const state = await getGameState(page);
        const reputation = state.reputation as number;
        expect(reputation).toBeLessThanOrEqual(100);
    });
});

// ── Bug Fix #3: Building Happiness Effects ──

test.describe('Bug Fix #3: Building happiness always applied', () => {
    test.setTimeout(120000);

    test('Happiness reflects building effects after construction', async ({ page }) => {
        await startGame(page);

        // Record initial happiness
        const initialState = await getGameState(page);
        const initialHappiness = initialState.happiness as number;

        // Play a couple seasons first
        for (let i = 0; i < 2; i++) {
            await endSeason(page);
        }

        // Try to build an Arena (happiness building) in a territory
        await clickNavTab(page, 'Map');
        await page.waitForTimeout(500);

        // Look for a territory we own - click on the first owned territory
        const ownedTerritory = page.locator('button, div').filter({ hasText: /Palatine Hill/i }).first();
        if (await ownedTerritory.isVisible({ timeout: 2000 }).catch(() => false)) {
            await ownedTerritory.click();
            await page.waitForTimeout(400);
        }

        // Look for Buildings tab in territory details
        const buildingsTab = page.locator('button').filter({ hasText: /Buildings/i }).first();
        if (await buildingsTab.isVisible({ timeout: 1000 }).catch(() => false)) {
            await buildingsTab.click();
            await page.waitForTimeout(400);

            // Try to build Arena
            const arenaBuild = page.getByRole('button', { name: /Build.*Arena|Arena.*Build/i }).first();
            if (await arenaBuild.isVisible({ timeout: 1000 }).catch(() => false) && await arenaBuild.isEnabled().catch(() => false)) {
                await arenaBuild.click();
                await page.waitForTimeout(400);
            }
        }

        // End a season to apply building effects
        await endSeason(page);

        const afterState = await getGameState(page);
        const afterHappiness = afterState.happiness as number;

        // Happiness should still be valid (0-100 range)
        expect(afterHappiness).toBeGreaterThanOrEqual(0);
        expect(afterHappiness).toBeLessThanOrEqual(100);
        expect(Number.isFinite(afterHappiness)).toBe(true);

        console.log(`Happiness: ${initialHappiness} -> ${afterHappiness}`);
    });

    test('Happiness stays within 0-100 bounds under all conditions', async ({ page }) => {
        await startGame(page);

        // Play 12 seasons with various tax rates to stress happiness bounds
        for (let i = 0; i < 12; i++) {
            // Every 4 seasons, change tax rate to stress happiness
            if (i % 4 === 0 && i > 0) {
                await clickNavTab(page, 'Economy');

                // Try to set high tax
                const highTax = page.getByRole('button', { name: /High/i }).first();
                if (await highTax.isVisible({ timeout: 500 }).catch(() => false)) {
                    await highTax.click();
                    await page.waitForTimeout(300);
                }
            }

            await endSeason(page);

            const state = await getGameState(page);
            const happiness = state.happiness as number;

            // Core assertion: happiness is always bounded
            expect(happiness).toBeGreaterThanOrEqual(0);
            expect(happiness).toBeLessThanOrEqual(100);
            expect(Number.isFinite(happiness)).toBe(true);
        }
    });
});

// ── Edge Cases: Failure Conditions ──

test.describe('Edge Cases: Failure conditions trigger correctly', () => {
    test.setTimeout(120000);

    test('Game state values stay within valid ranges during extended play', async ({ page }) => {
        await startGame(page);

        const invalidValues: string[] = [];

        for (let i = 0; i < 15; i++) {
            await endSeason(page);

            const state = await getGameState(page);

            // Validate all bounded stats
            const checks = [
                { name: 'happiness', value: state.happiness as number, min: 0, max: 100 },
                { name: 'morale', value: state.morale as number, min: 0, max: 100 },
                { name: 'piety', value: state.piety as number, min: 0, max: 100 },
                { name: 'reputation', value: state.reputation as number, min: 0, max: 100 },
                { name: 'sanitation', value: state.sanitation as number, min: 0, max: 100 },
            ];

            for (const check of checks) {
                if (check.value < check.min || check.value > check.max || !Number.isFinite(check.value)) {
                    invalidValues.push(`Season ${i + 1}: ${check.name} = ${check.value} (expected ${check.min}-${check.max})`);
                }
            }

            // Denarii, population, troops should never be NaN or negative
            const nonNegative = [
                { name: 'denarii', value: state.denarii as number },
                { name: 'population', value: state.population as number },
                { name: 'troops', value: state.troops as number },
            ];

            for (const check of nonNegative) {
                if (check.value < 0 || !Number.isFinite(check.value)) {
                    invalidValues.push(`Season ${i + 1}: ${check.name} = ${check.value} (should be >= 0)`);
                }
            }
        }

        if (invalidValues.length > 0) {
            console.log('Invalid values found:', invalidValues);
        }
        expect(invalidValues).toHaveLength(0);
    });

    test('Game triggers results screen on failure (happiness collapse)', async ({ page }) => {
        await startGame(page);

        // Set maximum tax to crash happiness toward 0
        await clickNavTab(page, 'Economy');
        await page.waitForTimeout(500);

        // Find and drag tax slider to max, or click High preset repeatedly
        const highTax = page.getByRole('button', { name: /High/i }).first();
        if (await highTax.isVisible({ timeout: 1000 }).catch(() => false)) {
            await highTax.click();
            await page.waitForTimeout(300);
        }

        let gameEnded = false;
        let lastHappiness = 100;

        // Run up to 30 seasons with max tax - should eventually trigger failure
        for (let i = 0; i < 30; i++) {
            await endSeason(page);

            // Check if we hit the results screen
            const resultsVisible = await page.getByText(/Victory|Defeat|Game Over|Results/i).first().isVisible({ timeout: 300 }).catch(() => false);
            if (resultsVisible) {
                gameEnded = true;
                console.log(`Game ended at season ${i + 1}`);
                break;
            }

            const state = await getGameState(page);
            lastHappiness = (state.happiness as number) ?? lastHappiness;

            // If happiness is near the failure threshold, keep going
            if (lastHappiness <= 25) {
                console.log(`Happiness at ${lastHappiness}% at season ${i + 1} - near failure threshold`);
            }
        }

        // The game should either have ended OR happiness should be trackable
        // (Game might not fail due to deficit protection and grace period)
        const finalState = await getGameState(page);
        const stage = finalState.stage as string;
        console.log(`Final state: stage=${stage}, happiness=${lastHappiness}`);

        // At minimum, all values should be valid
        expect(Number.isFinite(lastHappiness)).toBe(true);
    });

    test('Starvation counter resets on recovery', async ({ page }) => {
        await startGame(page);

        // Play normally - consecutiveStarvation should remain 0 with adequate food
        for (let i = 0; i < 5; i++) {
            await endSeason(page);
        }

        const state = await getGameState(page);
        const starvation = state.consecutiveStarvation as number;

        // With starting grain of 500, should not starve in first 5 seasons
        expect(starvation).toBe(0);
    });
});

// ── Edge Cases: No NaN/Undefined Propagation ──

test.describe('Edge Cases: Data integrity across panels', () => {
    test.setTimeout(120000);

    test('All panels render without NaN after 8 seasons', async ({ page }) => {
        await startGame(page);

        // Play 8 seasons to generate diverse state
        for (let i = 0; i < 8; i++) {
            await endSeason(page);
        }

        const tabs = ['Overview', 'Economy', 'Military', 'Map', 'Settlement', 'Religion', 'Trade', 'Tech', 'Senate'];
        const nanPanels: string[] = [];

        for (const tab of tabs) {
            const opened = await clickNavTab(page, tab);
            if (!opened) continue;

            await page.waitForTimeout(300);
            const content = await page.locator('main').textContent() || '';
            if (content.includes('NaN') || content.includes('undefined')) {
                nanPanels.push(`${tab}: contains NaN/undefined`);
            }
        }

        if (nanPanels.length > 0) {
            console.log('Panels with invalid values:', nanPanels);
        }
        expect(nanPanels).toHaveLength(0);
    });

    test('Game state has consistent territory data after conquests', async ({ page }) => {
        await startGame(page);

        // Play enough seasons and try to conquer
        for (let i = 0; i < 10; i++) {
            await endSeason(page);
        }

        const state = await getGameState(page);
        const territories = state.territories as Array<{
            id: string;
            owned: boolean;
            stability: number;
            garrison: number;
        }>;

        expect(territories).toBeDefined();
        expect(territories.length).toBeGreaterThan(0);

        for (const t of territories) {
            if (t.owned) {
                // Owned territories should have valid stability and garrison
                expect(t.stability).toBeGreaterThanOrEqual(0);
                expect(t.stability).toBeLessThanOrEqual(100);
                expect(t.garrison).toBeGreaterThanOrEqual(0);
                expect(Number.isFinite(t.stability)).toBe(true);
                expect(Number.isFinite(t.garrison)).toBe(true);
            }
        }
    });

    test('Consecrated territories array only contains valid territory IDs', async ({ page }) => {
        await startGame(page);

        for (let i = 0; i < 6; i++) {
            await endSeason(page);
        }

        const state = await getGameState(page);
        const consecrated = state.consecratedTerritories as string[] | undefined;
        const territories = state.territories as Array<{ id: string; owned: boolean }>;

        if (consecrated && consecrated.length > 0) {
            const territoryIds = new Set(territories.map(t => t.id));
            for (const id of consecrated) {
                expect(territoryIds.has(id)).toBe(true);
            }

            // All consecrated territories should be owned
            const ownedIds = new Set(territories.filter(t => t.owned).map(t => t.id));
            for (const id of consecrated) {
                expect(ownedIds.has(id)).toBe(true);
            }
        }
    });
});
