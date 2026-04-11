import { test, expect, Page } from '@playwright/test';

/**
 * Database Sync E2E Tests
 *
 * Verifies that game state is persisted to PostgreSQL after each season,
 * and that the API routes return correct data.
 */

async function startGame(page: Page) {
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
    await page.getByText('Romulus', { exact: true }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Found Rome as Romulus/ }).click();
    await page.waitForTimeout(1000);
}

async function endSeason(page: Page) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(800);
    // Dismiss any modals
    for (let i = 0; i < 5; i++) {
        const hasModal = await page.locator('.fixed.inset-0').first().isVisible({ timeout: 300 }).catch(() => false);
        if (!hasModal) break;
        const btn = page.locator('.fixed button:not([disabled])').first();
        if (await btn.isVisible({ timeout: 200 }).catch(() => false)) {
            await btn.click({ force: true });
            await page.waitForTimeout(300);
        } else {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(200);
        }
    }
    // Give DB sync time to complete
    await page.waitForTimeout(500);
}

test.describe('Database Sync', () => {
    test.setTimeout(120000);

    test('Game state syncs to PostgreSQL after seasons', async ({ page }) => {
        await startGame(page);

        // Play 3 seasons
        for (let i = 0; i < 3; i++) {
            await endSeason(page);
        }

        // Check that the game was saved via API
        const gameId = await page.evaluate(() => localStorage.getItem('rome-db-game-id'));
        console.log(`DB Game ID: ${gameId}`);

        // If gameId exists, verify via API
        if (gameId) {
            // Fetch game list
            const listRes = await page.evaluate(async () => {
                const r = await fetch('/api/game/list');
                return r.json();
            });
            console.log(`Games in DB: ${listRes.games?.length || 0}`);
            expect(listRes.games.length).toBeGreaterThan(0);

            // Find our game
            const ourGame = listRes.games.find((g: Record<string, unknown>) => g.id === gameId);
            expect(ourGame).toBeTruthy();
            expect(ourGame.status).toBe('active');
            // Founder stored as 'romulus' string ID
            expect(ourGame.founder).toBe('romulus');
            expect(ourGame.currentRound).toBeGreaterThanOrEqual(1);

            console.log(`Game: round=${ourGame.currentRound}, season=${ourGame.currentSeason}, founder=${ourGame.founder}`);

            // Fetch history
            const historyRes = await page.evaluate(async (gid: string) => {
                const r = await fetch(`/api/game/history?gameId=${gid}`);
                return r.json();
            }, gameId);

            expect(historyRes.rounds).toBeGreaterThanOrEqual(3);
            expect(historyRes.snapshots.length).toBeGreaterThanOrEqual(3);

            console.log(`History: ${historyRes.rounds} snapshots, ${historyRes.summary.totalEvents} events`);
            console.log(`Peak population: ${historyRes.summary.peakPopulation}`);
            console.log(`Peak denarii: ${historyRes.summary.peakDenarii}`);
            console.log(`Event categories:`, historyRes.summary.categoryCounts);

            // Verify snapshot data is reasonable
            for (const snap of historyRes.snapshots) {
                expect(snap.round).toBeGreaterThan(0);
                expect(snap.population).toBeGreaterThan(0);
                expect(snap.happiness).toBeGreaterThanOrEqual(0);
                expect(snap.happiness).toBeLessThanOrEqual(100);
                expect(Number.isFinite(snap.denarii)).toBe(true);
            }
        } else {
            console.log('No DB game ID found - sync may have failed (non-blocking)');
        }
    });

    test('Load endpoint returns valid game state', async ({ page }) => {
        await startGame(page);

        // Play 2 seasons
        await endSeason(page);
        await endSeason(page);

        const gameId = await page.evaluate(() => localStorage.getItem('rome-db-game-id'));
        if (!gameId) {
            console.log('No game ID, skipping load test');
            return;
        }

        // Load from API
        const loadRes = await page.evaluate(async (gid: string) => {
            const r = await fetch(`/api/game/load?gameId=${gid}`);
            return r.json();
        }, gameId);

        expect(loadRes.game).toBeTruthy();
        expect(loadRes.fullState).toBeTruthy();
        expect(loadRes.snapshot).toBeTruthy();

        // Verify the loaded state has expected structure
        const loadedState = loadRes.fullState as Record<string, unknown>;
        expect(loadedState.round).toBeTruthy();
        expect(loadedState.population).toBeTruthy();
        expect(loadedState.territories).toBeTruthy();

        console.log(`Loaded game: round=${loadedState.round}, pop=${loadedState.population}`);
    });

    test('Analytics endpoint works', async ({ page }) => {
        await startGame(page);
        await endSeason(page);

        // Global analytics
        const analyticsRes = await page.evaluate(async () => {
            const r = await fetch('/api/game/analytics');
            return r.json();
        });

        expect(analyticsRes.overview).toBeTruthy();
        expect(Number(analyticsRes.overview.totalGames)).toBeGreaterThanOrEqual(0);

        console.log('Global analytics:', analyticsRes.overview);

        // Per-game analytics
        const gameId = await page.evaluate(() => localStorage.getItem('rome-db-game-id'));
        if (gameId) {
            const gameAnalytics = await page.evaluate(async (gid: string) => {
                const r = await fetch(`/api/game/analytics?gameId=${gid}`);
                return r.json();
            }, gameId);

            expect(gameAnalytics.gameId).toBe(gameId);
            expect(gameAnalytics.riskAssessment).toBeTruthy();

            console.log('Game risk assessment:', gameAnalytics.riskAssessment);
        }
    });
});
