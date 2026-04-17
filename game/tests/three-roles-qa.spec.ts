import { test, expect, Page } from '@playwright/test';

// ============================================
// Three-Role QA playthrough
// Noob, Avg Gamer, Goat Gamer
// Records snapshots of game state and screenshots
// ============================================

type Snapshot = {
    round: number;
    season?: string;
    denarii?: number;
    population?: number;
    happiness?: number;
    troops?: number;
    piety?: number;
    morale?: number;
    stage?: string;
};

async function startGame(page: Page, founder: 'Romulus' | 'Remus' = 'Romulus') {
    await page.goto('/');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    // Wait for intro animations (Begin Your Legacy button has 2.4s entry delay)
    await page.waitForTimeout(3500);

    const beginBtn = page.getByRole('button', { name: /Begin Your Legacy/i });
    await beginBtn.waitFor({ state: 'visible', timeout: 15000 });
    // Try up to 3 clicks with extra dispatch fallback to defeat animation frame swallow
    for (let attempt = 0; attempt < 3; attempt++) {
        if (!(await beginBtn.isVisible({ timeout: 300 }).catch(() => false))) break;
        await beginBtn.click({ force: true });
        await page.waitForTimeout(1500);
        if (!(await beginBtn.isVisible({ timeout: 300 }).catch(() => false))) break;
        // DOM-level dispatch as last-resort nudge
        await beginBtn.evaluate((el: HTMLElement) => el.click()).catch(() => {});
        await page.waitForTimeout(1500);
    }

    const founderLabel = page.getByText(founder, { exact: true }).first();
    await founderLabel.waitFor({ state: 'visible', timeout: 12000 });
    await founderLabel.click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: new RegExp(`Found Rome as ${founder}`, 'i') }).click();
    await page.waitForTimeout(1500);
}

async function readState(page: Page): Promise<Snapshot> {
    return await page.evaluate(() => {
        // Game exposes zustand store on window.__gameStore (dev builds only).
        const winAny = window as any;
        const store = winAny.__gameStore || winAny.gameStore;
        if (!store || typeof store.getState !== 'function') {
            throw new Error('window.__gameStore not found - store not exposed to window. Check gameStore.ts dev expose.');
        }
        const s = store.getState();
        return {
            round: s.round,
            season: s.season,
            denarii: s.denarii,
            population: s.population,
            happiness: s.happiness,
            troops: s.troops,
            piety: s.piety,
            morale: s.morale,
            stage: s.stage,
        };
    });
}

async function dismissAllModals(page: Page) {
    for (let attempt = 0; attempt < 8; attempt++) {
        const hasModal = await page.locator('.fixed.inset-0').first().isVisible({ timeout: 300 }).catch(() => false);
        if (!hasModal) break;

        const senatorChoice = page.locator('.fixed button.rounded-xl:not([disabled])').first();
        if (await senatorChoice.isVisible({ timeout: 200 }).catch(() => false)) {
            await senatorChoice.click({ force: true }).catch(() => {});
            await page.waitForTimeout(300);
            continue;
        }

        for (const t of ['Attack', 'Fight', 'Retreat']) {
            const btn = page.locator(`.fixed button:has-text("${t}")`).first();
            if (await btn.isVisible({ timeout: 150 }).catch(() => false)) {
                await btn.click({ force: true }).catch(() => {});
                await page.waitForTimeout(500);
                break;
            }
        }

        for (const t of ['Dismiss', 'OK', 'Continue', 'Close', 'Accept', 'Confirm']) {
            const btn = page.locator(`button:has-text("${t}")`).first();
            if (await btn.isVisible({ timeout: 150 }).catch(() => false)) {
                await btn.click({ force: true }).catch(() => {});
                await page.waitForTimeout(200);
                break;
            }
        }
    }
}

async function endSeason(page: Page) {
    await dismissAllModals(page);
    // Try button first
    const endBtn = page.getByRole('button', { name: /End Season|Next Turn|End Turn/i }).first();
    if (await endBtn.isVisible({ timeout: 300 }).catch(() => false)) {
        await endBtn.click({ force: true }).catch(() => {});
    } else {
        await page.keyboard.press('Space');
    }
    await page.waitForTimeout(500);
    await dismissAllModals(page);
}

async function clickSidebarTab(page: Page, label: string) {
    const tab = page.locator(`button[role="tab"]:has(span:text("${label}"))`).first();
    if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tab.click({ force: true }).catch(() => {});
        await page.waitForTimeout(300);
    }
}

test.describe('Three-Role QA', () => {
    test.setTimeout(240_000);

    test('Noob Gamer - just presses space', async ({ page }) => {
        const log: Snapshot[] = [];
        const issues: string[] = [];
        await startGame(page, 'Romulus');

        for (let i = 0; i < 15; i++) {
            await endSeason(page);
            const s = await readState(page);
            log.push(s);
            if (s.stage === 'results' || s.stage === 'victory' || s.stage === 'failure') break;
        }

        // Quick stagnation check
        const rounds = log.map(l => l.round).filter(n => typeof n === 'number');
        const unique = new Set(rounds);
        if (rounds.length > 4 && unique.size <= rounds.length / 2) {
            issues.push(`STAGNATION: ${rounds.length} season presses produced only ${unique.size} unique rounds`);
        }

        // Screenshot final state
        await page.screenshot({ path: 'test-results/noob-final.png', fullPage: true });

        console.log('NOOB LOG:', JSON.stringify(log, null, 2));
        console.log('NOOB ISSUES:', JSON.stringify(issues, null, 2));
    });

    test('Avg Gamer - worship + conquer + wonder', async ({ page }) => {
        const log: Snapshot[] = [];
        const issues: string[] = [];
        await startGame(page, 'Romulus');

        // Try to select Jupiter as patron and play 25 seasons
        await clickSidebarTab(page, 'Religion');
        await page.waitForTimeout(500);
        const jupiter = page.getByText('Jupiter', { exact: false }).first();
        if (await jupiter.isVisible({ timeout: 1000 }).catch(() => false)) {
            await jupiter.click({ force: true }).catch(() => {});
            await page.waitForTimeout(400);
            const setPatron = page.getByRole('button', { name: /patron|choose/i }).first();
            if (await setPatron.isVisible({ timeout: 500 }).catch(() => false)) {
                await setPatron.click({ force: true }).catch(() => {});
            }
        }

        for (let i = 0; i < 25; i++) {
            // Try to worship once per season
            await clickSidebarTab(page, 'Religion');
            const worshipBtn = page.getByRole('button', { name: /worship|pray|offering/i }).first();
            if (await worshipBtn.isVisible({ timeout: 400 }).catch(() => false) &&
                await worshipBtn.isEnabled({ timeout: 200 }).catch(() => false)) {
                await worshipBtn.click({ force: true }).catch(() => {});
                await page.waitForTimeout(300);
            }

            await clickSidebarTab(page, 'Overview');
            await endSeason(page);
            const s = await readState(page);
            log.push(s);
            if (s.stage === 'results' || s.stage === 'victory' || s.stage === 'failure') break;
        }

        await page.screenshot({ path: 'test-results/avg-final.png', fullPage: true });
        console.log('AVG LOG:', JSON.stringify(log, null, 2));
        console.log('AVG ISSUES:', JSON.stringify(issues, null, 2));
    });

    test('Goat Gamer - aggressive econ push', async ({ page }) => {
        const log: Snapshot[] = [];
        const issues: string[] = [];
        await startGame(page, 'Remus');

        // Try to raise taxes aggressively
        await clickSidebarTab(page, 'Economy');
        const taxUp = page.getByRole('button', { name: /\+|increase|raise/i }).first();
        for (let i = 0; i < 5; i++) {
            if (await taxUp.isVisible({ timeout: 300 }).catch(() => false)) {
                await taxUp.click({ force: true }).catch(() => {});
                await page.waitForTimeout(150);
            }
        }

        for (let i = 0; i < 35; i++) {
            await clickSidebarTab(page, 'Overview');
            await endSeason(page);
            const s = await readState(page);
            log.push(s);
            if (s.stage === 'results' || s.stage === 'victory' || s.stage === 'failure') break;
        }

        await page.screenshot({ path: 'test-results/goat-final.png', fullPage: true });
        console.log('GOAT LOG:', JSON.stringify(log, null, 2));
        console.log('GOAT ISSUES:', JSON.stringify(issues, null, 2));
    });
});
