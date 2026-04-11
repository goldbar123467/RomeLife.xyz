import { test, expect, Page } from '@playwright/test';

/**
 * Victory Playthrough Test - 50 Rounds
 *
 * Attempts to achieve victory by playing through up to 50 seasons,
 * recruiting troops, conquering territories, managing senators, and
 * tracking game health metrics (NaN bugs, stagnation, etc.)
 *
 * Victory Conditions:
 * - Eternal City: 10 territories, 500 pop, 75% happiness
 * - Commerce: 15,000 denarii, 35 reputation
 * - Conqueror: 8 territories, 180 troops
 * - Glory: 350 pop, 90% happiness
 * - Industrial: 15 buildings, 10,000 denarii
 */

const SENATORS = ['Sertorius', 'Sulla', 'Clodius', 'Pulcher', 'Oppius'] as const;

interface GameStats {
    round: number;
    season: string;
    year: number;
    denarii: number;
    population: number;
    happiness: number;
    troops: number;
    territories: number;
    reputation: number;
    senators: { name: string; relation: number }[];
}

test.describe('Victory Playthrough - 50 Rounds', () => {
    test.setTimeout(600000); // 10 minutes max

    test('Full victory attempt - maximize all systems', async ({ page }) => {
        // ── Start fresh game ──
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
        await page.waitForTimeout(500);

        // Select Romulus (military focus for conquests)
        await page.getByText('Romulus', { exact: true }).first().click();
        await page.waitForTimeout(300);
        const foundBtn = page.getByRole('button', { name: /Found Rome as Romulus/ });
        await expect(foundBtn).toBeVisible({ timeout: 3000 });
        await foundBtn.click();
        await page.waitForTimeout(1000);

        console.log('\n' + '='.repeat(60));
        console.log('VICTORY PLAYTHROUGH - 50 ROUNDS MAX');
        console.log('='.repeat(60) + '\n');

        const stats: GameStats[] = [];
        const bugs: string[] = [];
        let outcome: 'victory' | 'defeat' | 'timeout' = 'timeout';
        let victoryType: string | undefined;
        const maxRounds = 50;
        const seasonNames = ['Spring', 'Summer', 'Autumn', 'Winter'];

        // Senator tracking
        const senatorHistory: { round: number; relations: { [key: string]: number } }[] = [];
        let senatorCrises = 0;

        for (let round = 1; round <= maxRounds; round++) {
            const seasonName = seasonNames[(round - 1) % 4];
            const year = Math.floor((round - 1) / 4) + 753;

            console.log(`\n--- Round ${round}: ${seasonName} ${year} BC ---`);

            // Hard 30s timeout per round
            const roundTimeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`TIMEOUT: Round ${round} stuck for 30 seconds`)), 30000)
            );

            // Collect stats
            const currentStats = await collectGameStats(page, round, seasonName, year);
            stats.push(currentStats);

            // Track senators
            const senatorRelations: { [key: string]: number } = {};
            for (const s of currentStats.senators) {
                senatorRelations[s.name] = s.relation;
            }
            senatorHistory.push({ round, relations: senatorRelations });

            // Log stats
            console.log(`  Denarii: ${currentStats.denarii} | Pop: ${currentStats.population} | Happy: ${currentStats.happiness}%`);
            console.log(`  Troops: ${currentStats.troops} | Territories: ${currentStats.territories} | Rep: ${currentStats.reputation}`);

            const senSummary = currentStats.senators
                .map(s => `${s.name.slice(0, 3)}:${s.relation >= 0 ? '+' : ''}${s.relation}`)
                .join(' | ');
            console.log(`  Senators: ${senSummary}`);

            // Senator crisis detection
            const crits = currentStats.senators.filter(s => s.relation <= -50);
            if (crits.length > 0) {
                senatorCrises++;
                console.log(`  *** SENATOR CRISIS: ${crits.map(s => s.name).join(', ')} ***`);
            }

            // Bug detection: NaN
            const pageContent = await page.locator('main').textContent() || '';
            if (pageContent.includes('NaN')) {
                const msg = `Round ${round}: NaN found in page content`;
                if (!bugs.includes(msg)) bugs.push(msg);
            }

            // ── Round actions ──
            const roundWork = async () => {
                if (round <= 10) {
                    await earlyGameActions(page, round);
                } else if (round <= 25) {
                    await midGameActions(page, round);
                } else if (round <= 40) {
                    await lateGameActions(page, round);
                } else {
                    await victoryPushActions(page);
                }

                // Manage senators every 4 rounds
                if (round % 4 === 0) {
                    await manageSenators(page);
                }

                // End season
                await page.keyboard.press('Space');
                await page.waitForTimeout(600);

                // Dismiss modals (max 8 attempts)
                await dismissModals(page, 8);
            };

            try {
                await Promise.race([roundWork(), roundTimeout]);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                if (msg.includes('TIMEOUT')) {
                    bugs.push(msg);
                    console.log(`  *** ${msg} ***`);
                    await page.screenshot({ path: `tests/screenshots/victory/timeout-round-${round}.png`, fullPage: true }).catch(() => {});
                    await page.keyboard.press('Escape').catch(() => {});
                    await page.waitForTimeout(300);
                } else {
                    throw err;
                }
            }

            // ── Check for victory ──
            const victoryCheck = await page.locator('text=Play Again').first().isVisible({ timeout: 500 }).catch(() => false);
            const resultsCheck = await page.getByText(/Final Treasury|Empire Statistics/).first().isVisible({ timeout: 500 }).catch(() => false);

            if (victoryCheck || resultsCheck) {
                const bodyText = await page.locator('body').textContent() || '';
                // Determine if it's a victory or defeat
                if (bodyText.includes('Famine') || bodyText.includes('Collapse') || bodyText.includes('Revolt') || bodyText.includes('Defeat')) {
                    outcome = 'defeat';
                    console.log(`\n*** DEFEAT at round ${round} ***`);
                } else {
                    outcome = 'victory';
                    if (bodyText.includes('Eternal City')) victoryType = 'Eternal City';
                    else if (bodyText.includes('Commerce')) victoryType = 'Commerce';
                    else if (bodyText.includes('Conqueror')) victoryType = 'Conqueror';
                    else if (bodyText.includes('Glory')) victoryType = 'Glory';
                    else if (bodyText.includes('Industrial')) victoryType = 'Industrial';
                    console.log(`\n${'*'.repeat(50)}`);
                    console.log(`*** VICTORY: ${victoryType || 'Unknown'} at round ${round}! ***`);
                    console.log(`${'*'.repeat(50)}`);
                }
                await page.screenshot({ path: `tests/screenshots/victory/result-round-${round}.png`, fullPage: true });
                break;
            }

            // Milestone screenshots
            if (round % 10 === 0) {
                await page.screenshot({ path: `tests/screenshots/victory/round-${round}.png`, fullPage: true });
            }
        }

        // ── Final Report ──
        const senatorReport = generateSenatorReport(senatorHistory, senatorCrises);

        console.log('\n' + '='.repeat(60));
        console.log('FINAL REPORT');
        console.log('='.repeat(60));
        console.log(`Outcome: ${outcome.toUpperCase()}${victoryType ? ` (${victoryType})` : ''}`);
        console.log(`Total rounds: ${stats.length}`);
        console.log(`Bugs found: ${bugs.length}`);
        bugs.forEach(b => console.log(`  - ${b}`));

        console.log('\n--- SENATOR REPORT ---');
        console.log(senatorReport);

        if (stats.length > 0) {
            const final = stats[stats.length - 1];
            console.log('\nFinal State:');
            console.log(`  Denarii: ${final.denarii} | Pop: ${final.population} | Happy: ${final.happiness}%`);
            console.log(`  Troops: ${final.troops} | Territories: ${final.territories} | Rep: ${final.reputation}`);
        }

        await page.screenshot({ path: 'tests/screenshots/victory/final-state.png', fullPage: true });

        // Assertions
        expect(stats.length).toBeGreaterThan(0);
        // No NaN bugs should exist
        expect(bugs.filter(b => b.includes('NaN'))).toHaveLength(0);
    });
});

// ============================================
// Helpers
// ============================================

async function collectGameStats(page: Page, round: number, season: string, year: number): Promise<GameStats> {
    const bodyText = await page.locator('body').textContent() || '';

    const extractNum = (patterns: string[]): number => {
        for (const pattern of patterns) {
            const regex = new RegExp(`${pattern}[^\\d]*(\\d+[,.]?\\d*)`, 'i');
            const match = bodyText.match(regex);
            if (match) return parseInt(match[1].replace(/[,\.]/g, ''));
        }
        return 0;
    };

    const senators: { name: string; relation: number }[] = [];
    for (const name of SENATORS) {
        let relation = 0;
        const pat = new RegExp(`${name}[\\s\\S]{0,200}Relation([+-]?\\d+)`, 'i');
        const m = bodyText.match(pat);
        if (m) relation = parseInt(m[1]);
        senators.push({ name, relation });
    }

    return {
        round, season, year,
        denarii: extractNum(['denarii', 'gold', 'treasury']),
        population: extractNum(['population', 'pop']),
        happiness: extractNum(['happiness', 'happy']),
        troops: extractNum(['troops', 'soldiers', 'military']),
        territories: extractNum(['territories', 'territory']),
        reputation: extractNum(['reputation', 'rep']),
        senators
    };
}

async function clickNavTab(page: Page, label: string) {
    const tab = page.locator(`nav[role="navigation"] button[role="tab"]:has(span:text("${label}"))`).first();
    if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(300);
        return true;
    }
    const fallback = page.locator('nav[role="navigation"] button').filter({ hasText: label }).first();
    if (await fallback.isVisible({ timeout: 500 }).catch(() => false)) {
        await fallback.click();
        await page.waitForTimeout(300);
        return true;
    }
    return false;
}

async function earlyGameActions(page: Page, round: number) {
    // Round 3: Select patron god (Mars for military)
    if (round === 3) {
        try {
            if (await clickNavTab(page, 'Religion')) {
                // Click on Mars god card
                const mars = page.getByText('Mars').first();
                if (await mars.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await mars.click();
                    await page.waitForTimeout(300);

                    // Choose Mars as patron
                    const chooseBtn = page.getByRole('button', { name: /Choose.*Patron/i }).first();
                    if (await chooseBtn.isVisible({ timeout: 1000 }).catch(() => false) && await chooseBtn.isEnabled().catch(() => false)) {
                        await chooseBtn.click();
                        console.log('  [Action] Selected Mars as patron');
                    }
                }
            }
        } catch (e) { /* non-critical */ }
    }

    // Worship every 4 rounds
    if (round % 4 === 0) {
        try {
            if (await clickNavTab(page, 'Religion')) {
                const worshipTab = page.getByRole('tab', { name: 'Worship' });
                if (await worshipTab.isVisible({ timeout: 500 }).catch(() => false)) {
                    await worshipTab.click();
                    await page.waitForTimeout(300);
                }
                const worshipBtn = page.getByRole('button', { name: /Worship|Sacrifice/i }).first();
                if (await worshipBtn.isVisible({ timeout: 500 }).catch(() => false) && await worshipBtn.isEnabled().catch(() => false)) {
                    await worshipBtn.click();
                    console.log('  [Action] Worshipped');
                }
            }
        } catch (e) { /* non-critical */ }
    }
}

async function midGameActions(page: Page, round: number) {
    // Recruit every 3 rounds
    if (round % 3 === 0) {
        try {
            if (await clickNavTab(page, 'Military')) {
                // Click on a unit card to select it
                const militia = page.getByText('Militia').first();
                if (await militia.isVisible({ timeout: 500 }).catch(() => false)) {
                    await militia.click();
                    await page.waitForTimeout(200);
                }
                const recruitBtn = page.getByRole('button', { name: /Recruit/i }).first();
                if (await recruitBtn.isVisible({ timeout: 500 }).catch(() => false) && await recruitBtn.isEnabled().catch(() => false)) {
                    await recruitBtn.click();
                    await page.waitForTimeout(200);
                    console.log('  [Action] Recruited troops');
                }
            }
        } catch (e) { /* non-critical */ }
    }

    // Conquer every 5 rounds
    if (round % 5 === 0) {
        await attemptConquest(page);
    }
}

async function lateGameActions(page: Page, round: number) {
    // Build every 4 rounds
    if (round % 4 === 0) {
        try {
            if (await clickNavTab(page, 'Settlement')) {
                const buildBtn = page.getByRole('button', { name: /Build|Construct/i }).first();
                if (await buildBtn.isVisible({ timeout: 500 }).catch(() => false) && await buildBtn.isEnabled().catch(() => false)) {
                    await buildBtn.click();
                    console.log('  [Action] Built structure');
                }
            }
        } catch (e) { /* non-critical */ }
    }

    // Continue recruiting every 2 rounds
    if (round % 2 === 0) {
        try {
            if (await clickNavTab(page, 'Military')) {
                const militia = page.getByText('Militia').first();
                if (await militia.isVisible({ timeout: 500 }).catch(() => false)) {
                    await militia.click();
                    await page.waitForTimeout(200);
                }
                const recruitBtn = page.getByRole('button', { name: /Recruit/i }).first();
                if (await recruitBtn.isVisible({ timeout: 500 }).catch(() => false) && await recruitBtn.isEnabled().catch(() => false)) {
                    await recruitBtn.click();
                    console.log('  [Action] Recruited troops');
                }
            }
        } catch (e) { /* non-critical */ }
    }

    // Conquer every 3 rounds late game
    if (round % 3 === 0) {
        await attemptConquest(page);
    }
}

async function victoryPushActions(page: Page) {
    // Max aggression: recruit and conquer every round
    try {
        if (await clickNavTab(page, 'Military')) {
            const militia = page.getByText('Militia').first();
            if (await militia.isVisible({ timeout: 300 }).catch(() => false)) {
                await militia.click();
                await page.waitForTimeout(150);
            }
            const recruitBtn = page.getByRole('button', { name: /Recruit/i }).first();
            if (await recruitBtn.isVisible({ timeout: 300 }).catch(() => false) && await recruitBtn.isEnabled().catch(() => false)) {
                await recruitBtn.click();
            }
        }
    } catch (e) { /* non-critical */ }

    await attemptConquest(page);
}

async function attemptConquest(page: Page) {
    try {
        if (await clickNavTab(page, 'Map')) {
            const conquerBtn = page.getByRole('button', { name: /Conquer/i }).first();
            if (await conquerBtn.isVisible({ timeout: 500 }).catch(() => false) && await conquerBtn.isEnabled().catch(() => false)) {
                await conquerBtn.click();
                await page.waitForTimeout(500);
                console.log('  [Action] Attempted conquest');

                // Handle battle screen
                const fightBtn = page.getByRole('button', { name: /Fight|Attack|Battle/i }).first();
                if (await fightBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await fightBtn.click();
                    await page.waitForTimeout(1000);
                    // Dismiss battle results
                    await dismissModals(page, 3);
                }
            }
        }
    } catch (e) { /* non-critical */ }
}

async function manageSenators(page: Page) {
    try {
        if (await clickNavTab(page, 'Senate')) {
            const balancedBtn = page.getByRole('button', { name: /Balanced/i }).first();
            if (await balancedBtn.isVisible({ timeout: 2000 }).catch(() => false) && await balancedBtn.isEnabled().catch(() => false)) {
                await balancedBtn.click();
                await page.waitForTimeout(200);

                const confirmBtn = page.getByRole('button', { name: /Confirm Allocation/i });
                if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false) && await confirmBtn.isEnabled().catch(() => false)) {
                    await confirmBtn.click();
                    console.log('  [Action] Senate allocation confirmed');
                }
            }
        }
    } catch (e) { /* non-critical */ }
}

async function dismissModals(page: Page, maxAttempts = 5) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const hasModal = await page.locator('.fixed.inset-0').first().isVisible({ timeout: 300 }).catch(() => false);
        if (!hasModal) break;

        // Senator event: click first available choice button
        const senatorModal = page.locator('text=Your Response:').first();
        if (await senatorModal.isVisible({ timeout: 200 }).catch(() => false)) {
            const selectors = [
                '.fixed button.rounded-xl:not([disabled])',
                '.fixed button:has(.bg-green-500)',
            ];
            for (const sel of selectors) {
                const btn = page.locator(sel).first();
                if (await btn.isVisible({ timeout: 200 }).catch(() => false)) {
                    await btn.click({ force: true });
                    await page.waitForTimeout(400);
                    console.log('  [Action] Handled senator event');
                    break;
                }
            }
            continue;
        }

        // Battle: attack if possible, otherwise retreat
        const attackBtn = page.getByRole('button', { name: /Attack|Fight/i }).first();
        if (await attackBtn.isVisible({ timeout: 200 }).catch(() => false) && await attackBtn.isEnabled().catch(() => false)) {
            await attackBtn.click();
            await page.waitForTimeout(1000);
            continue;
        }
        const retreatBtn = page.getByRole('button', { name: /Retreat/i }).first();
        if (await retreatBtn.isVisible({ timeout: 200 }).catch(() => false)) {
            await retreatBtn.click();
            await page.waitForTimeout(500);
            continue;
        }

        // Standard dismiss buttons
        let handled = false;
        for (const text of ['Dismiss', 'OK', 'Continue', 'Close', 'Accept', 'Confirm']) {
            const btn = page.getByRole('button', { name: text }).first();
            if (await btn.isVisible({ timeout: 150 }).catch(() => false)) {
                await btn.click();
                await page.waitForTimeout(200);
                handled = true;
                break;
            }
        }
        if (handled) continue;

        // Escape fallback
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);

        // Nuclear: any button inside a .fixed container
        const anyBtn = page.locator('.fixed button:not([disabled])').first();
        if (await anyBtn.isVisible({ timeout: 200 }).catch(() => false)) {
            await anyBtn.click();
            await page.waitForTimeout(400);
            continue;
        }
    }
}

function generateSenatorReport(
    history: { round: number; relations: { [key: string]: number } }[],
    crises: number
): string {
    if (history.length === 0) return 'No senator data collected.';

    const initial = history[0].relations;
    const final = history[history.length - 1].relations;

    // Track trends per senator
    const trends: { [key: string]: string } = {};
    for (const s of SENATORS) {
        const start = initial[s] || 0;
        const end = final[s] || 0;
        const change = end - start;
        if (change > 20) trends[s] = 'improved significantly';
        else if (change > 0) trends[s] = 'improved slightly';
        else if (change < -20) trends[s] = 'deteriorated significantly';
        else if (change < 0) trends[s] = 'deteriorated slightly';
        else trends[s] = 'stable';
    }

    // Most volatile
    let maxSwing = 0;
    let volatileSenator = SENATORS[0];
    for (const s of SENATORS) {
        let min = 100, max = -100;
        for (const h of history) {
            const r = h.relations[s] || 0;
            if (r < min) min = r;
            if (r > max) max = r;
        }
        if (max - min > maxSwing) {
            maxSwing = max - min;
            volatileSenator = s;
        }
    }

    // Lowest point
    let lowestRel = 0, lowestSenator = '', lowestRound = 0;
    for (const h of history) {
        for (const s of SENATORS) {
            const r = h.relations[s] || 0;
            if (r < lowestRel) {
                lowestRel = r;
                lowestSenator = s;
                lowestRound = h.round;
            }
        }
    }

    const avgFinal = SENATORS.reduce((sum, s) => sum + (final[s] || 0), 0) / SENATORS.length;

    let report = `Over ${history.length} rounds. `;
    report += `Most volatile: ${volatileSenator} (${maxSwing}pt swing). `;
    if (lowestSenator) report += `Lowest: ${lowestRel} with ${lowestSenator} at round ${lowestRound}. `;
    report += `${crises} crises. Avg final relation: ${avgFinal.toFixed(1)}.`;

    const improving = SENATORS.filter(s => (trends[s] || '').includes('improved'));
    const declining = SENATORS.filter(s => (trends[s] || '').includes('deteriorated'));
    if (improving.length) report += ` Improved: ${improving.join(', ')}.`;
    if (declining.length) report += ` Declined: ${declining.join(', ')}.`;

    return report;
}
