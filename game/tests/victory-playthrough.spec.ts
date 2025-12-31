import { test, expect } from '@playwright/test';

/**
 * Victory Playthrough Test - 50 Rounds
 *
 * Attempts to achieve victory by maxing all game systems.
 * Tracks senator relations throughout and reports on political gameplay.
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

interface RunReport {
    runNumber: number;
    totalRounds: number;
    outcome: 'victory' | 'defeat' | 'timeout';
    victoryType?: string;
    finalStats: GameStats;
    senatorReport: string;
    bugs: string[];
}

test.describe('Victory Playthrough - 50 Rounds', () => {
    test.setTimeout(600000); // 10 minutes max

    test('Full victory attempt - maximize all systems', async ({ page }) => {
        // Clear localStorage to prevent state restoration from previous runs
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        // Reload to start fresh
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Start game
        await page.click('text=Begin Your Legacy');
        await page.waitForTimeout(500);

        // Select Romulus (military focus for conquests)
        await page.click('text=Romulus');
        await page.waitForTimeout(300);

        const selectButton = page.locator('button:has-text("Found Rome"), button:has-text("Select"), button:has-text("Choose")').first();
        if (await selectButton.isVisible()) {
            await selectButton.click();
        }
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

        // Senator tracking for report
        const senatorHistory: { round: number; relations: { [key: string]: number } }[] = [];
        let senatorCrises = 0;
        let senatorEventsTriggered = 0;

        for (let round = 1; round <= maxRounds; round++) {
            const seasonName = seasonNames[(round - 1) % 4];
            const year = Math.floor((round - 1) / 4) + 753;

            console.log(`\n--- Round ${round}: ${seasonName} ${year} BC ---`);

            // Hard 30 second timeout using Promise.race
            const roundTimeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`TIMEOUT: Round ${round} stuck for 30 seconds`)), 30000)
            );

            // Collect stats from page
            const currentStats = await collectGameStats(page, round, seasonName, year);
            stats.push(currentStats);

            // Track senator relations
            const senatorRelations: { [key: string]: number } = {};
            for (const senator of currentStats.senators) {
                senatorRelations[senator.name] = senator.relation;
            }
            senatorHistory.push({ round, relations: senatorRelations });

            // Log key stats
            console.log(`  Denarii: ${currentStats.denarii} | Pop: ${currentStats.population} | Happy: ${currentStats.happiness}%`);
            console.log(`  Troops: ${currentStats.troops} | Territories: ${currentStats.territories} | Rep: ${currentStats.reputation}`);

            // Log senator status
            const senatorSummary = currentStats.senators
                .map(s => `${s.name.slice(0, 3)}:${s.relation >= 0 ? '+' : ''}${s.relation}`)
                .join(' | ');
            console.log(`  Senators: ${senatorSummary}`);

            // Check for senator crises
            const criticalSenators = currentStats.senators.filter(s => s.relation <= -50);
            if (criticalSenators.length > 0) {
                senatorCrises++;
                console.log(`  *** SENATOR CRISIS: ${criticalSenators.map(s => s.name).join(', ')} ***`);
            }

            // Check for NaN/undefined bugs
            const pageContent = await page.content();
            if (pageContent.includes('NaN')) {
                const bugMsg = `Round ${round}: NaN found in page content`;
                if (!bugs.includes(bugMsg)) bugs.push(bugMsg);
            }
            if (pageContent.match(/undefined(?!.*\btype\b)/)) {
                const bugMsg = `Round ${round}: undefined found in page content`;
                if (!bugs.includes(bugMsg)) bugs.push(bugMsg);
            }

            // Wrap entire round in Promise.race for hard 30s timeout
            const roundWork = async () => {
                // Strategic actions based on phase
                if (round <= 10) {
                    await earlyGameActions(page, round, bugs);
                } else if (round <= 25) {
                    await midGameActions(page, round, bugs);
                } else if (round <= 40) {
                    await lateGameActions(page, round, bugs);
                } else {
                    await victoryPushActions(page, round, bugs);
                }

                // Always manage senators
                await manageSenators(page, round, bugs);

                // End season
                await page.keyboard.press('Space');
                await page.waitForTimeout(600);

                // Handle modals - max 6 attempts
                for (let modalAttempt = 0; modalAttempt < 6; modalAttempt++) {
                    const hasModal = await page.locator('.fixed.inset-0').first().isVisible({ timeout: 200 }).catch(() => false);
                    if (!hasModal) break;
                    await dismissModals(page);
                    await page.waitForTimeout(150);
                }
            };

            try {
                await Promise.race([roundWork(), roundTimeout]);
            } catch (err: any) {
                if (err.message?.includes('TIMEOUT')) {
                    bugs.push(err.message);
                    console.log(`  *** ${err.message} ***`);
                    await page.screenshot({ path: `tests/screenshots/victory/timeout-round-${round}.png`, fullPage: true }).catch(() => {});
                    await page.keyboard.press('Escape').catch(() => {});
                    await page.waitForTimeout(300);
                    // Continue to next round after timeout
                } else {
                    throw err;
                }
            }

            // Check for senator events
            const pageTextAfter = await page.locator('body').textContent() || '';
            if (pageTextAfter.includes('Senator') && (pageTextAfter.includes('event') || pageTextAfter.includes('Event'))) {
                senatorEventsTriggered++;
            }

            // Check for victory - look for actual victory screen with "You have achieved" or results screen
            const victoryScreen = page.locator('text=You have achieved, text=Victory!, text=Congratulations, text=You Won');
            const victoryCheck = await victoryScreen.first().isVisible({ timeout: 500 }).catch(() => false);
            // Also check for results screen
            const resultsScreen = await page.locator('[data-testid="results-screen"], text=Your Legacy, text=Final Score').first().isVisible({ timeout: 500 }).catch(() => false);

            if (victoryCheck || resultsScreen) {
                outcome = 'victory';
                // Try to determine victory type
                const victoryText = await page.locator('body').textContent() || '';
                if (victoryText.includes('Eternal City')) victoryType = 'Eternal City';
                else if (victoryText.includes('Commerce')) victoryType = 'Commerce';
                else if (victoryText.includes('Conqueror')) victoryType = 'Conqueror';
                else if (victoryText.includes('Glory')) victoryType = 'Glory';
                else if (victoryText.includes('Industrial')) victoryType = 'Industrial';

                console.log(`\n${'*'.repeat(50)}`);
                console.log(`*** VICTORY ACHIEVED: ${victoryType || 'Unknown'} at round ${round}! ***`);
                console.log(`${'*'.repeat(50)}`);

                await page.screenshot({ path: `tests/screenshots/victory/victory-round-${round}.png`, fullPage: true });
                break;
            }

            // Check for defeat
            const defeatCheck = await page.locator('text=Game Over, text=Defeat, text=Failed').first().isVisible({ timeout: 500 }).catch(() => false);
            if (defeatCheck) {
                outcome = 'defeat';
                console.log(`\n*** DEFEAT at round ${round} ***`);
                await page.screenshot({ path: `tests/screenshots/victory/defeat-round-${round}.png`, fullPage: true });
                break;
            }

            // Take milestone screenshots
            if (round === 10 || round === 25 || round === 40 || round === 50) {
                await page.screenshot({ path: `tests/screenshots/victory/round-${round}.png`, fullPage: true });
            }
        }

        // Generate senator gameplay report
        const senatorReport = generateSenatorReport(senatorHistory, senatorCrises, senatorEventsTriggered);

        // Final report
        console.log('\n' + '='.repeat(60));
        console.log('FINAL REPORT');
        console.log('='.repeat(60));
        console.log(`Outcome: ${outcome.toUpperCase()}${victoryType ? ` (${victoryType})` : ''}`);
        console.log(`Total rounds played: ${stats.length}`);
        console.log(`Bugs found: ${bugs.length}`);
        if (bugs.length > 0) {
            console.log('Bugs:');
            bugs.forEach(b => console.log(`  - ${b}`));
        }

        // Senator report
        console.log('\n--- SENATOR GAMEPLAY REPORT ---');
        console.log(senatorReport);

        // Final stats
        if (stats.length > 0) {
            const final = stats[stats.length - 1];
            console.log('\nFinal Game State:');
            console.log(`  Denarii: ${final.denarii}`);
            console.log(`  Population: ${final.population}`);
            console.log(`  Happiness: ${final.happiness}%`);
            console.log(`  Troops: ${final.troops}`);
            console.log(`  Territories: ${final.territories}`);
            console.log(`  Reputation: ${final.reputation}`);
        }

        // Take final screenshot
        await page.screenshot({ path: 'tests/screenshots/victory/final-state.png', fullPage: true });

        // Test assertions
        expect(stats.length).toBeGreaterThan(0);
    });
});

// Helper functions

async function collectGameStats(page: any, round: number, season: string, year: number): Promise<GameStats> {
    const bodyText = await page.locator('body').textContent() || '';

    const extractNum = (patterns: string[]): number => {
        for (const pattern of patterns) {
            const regex = new RegExp(`${pattern}[^\\d]*(\\d+[,.]?\\d*)`, 'i');
            const match = bodyText.match(regex);
            if (match) {
                return parseInt(match[1].replace(/[,\.]/g, ''));
            }
        }
        return 0;
    };

    // Extract senator relations
    const senators: { name: string; relation: number }[] = [];
    for (const senatorName of SENATORS) {
        let relation = 0;
        // Try to find relation value near senator name
        const relationPattern = new RegExp(`${senatorName}[\\s\\S]{0,200}Relation([+-]?\\d+)`, 'i');
        const match = bodyText.match(relationPattern);
        if (match) {
            relation = parseInt(match[1]);
        }
        senators.push({ name: senatorName, relation });
    }

    return {
        round,
        season,
        year,
        denarii: extractNum(['denarii', 'gold', 'treasury']),
        population: extractNum(['population', 'pop']),
        happiness: extractNum(['happiness', 'happy']),
        troops: extractNum(['troops', 'soldiers', 'military']),
        territories: extractNum(['territories', 'territory']),
        reputation: extractNum(['reputation', 'rep']),
        senators
    };
}

async function earlyGameActions(page: any, round: number, bugs: string[]) {
    // Round 3: Select patron god (Mars for military bonus)
    if (round === 3) {
        try {
            const religionBtn = page.locator('button:has-text("Religion")').first();
            if (await religionBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await religionBtn.click();
                await page.waitForTimeout(300);

                const marsBtn = page.locator('text=Mars').first();
                if (await marsBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await marsBtn.click();
                    await page.waitForTimeout(200);

                    const chooseBtn = page.locator('button:has-text("Choose Patron")').first();
                    if (await chooseBtn.isVisible({ timeout: 1000 }).catch(() => false) && await chooseBtn.isEnabled().catch(() => false)) {
                        await chooseBtn.click();
                        console.log('  [Action] Selected Mars as patron');
                    }
                }
            }
        } catch (e) {
            bugs.push(`Round ${round}: Error selecting patron god`);
        }
    }

    // Worship every 4 rounds in early game
    if (round % 4 === 0) {
        try {
            const religionBtn = page.locator('button:has-text("Religion")').first();
            if (await religionBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await religionBtn.click();
                await page.waitForTimeout(300);

                const worshipBtn = page.locator('button:has-text("Worship"), button:has-text("Sacrifice")').first();
                if (await worshipBtn.isVisible({ timeout: 1000 }).catch(() => false) && await worshipBtn.isEnabled().catch(() => false)) {
                    await worshipBtn.click();
                    console.log('  [Action] Worshipped');
                }
            }
        } catch (e) {}
    }
}

async function midGameActions(page: any, round: number, bugs: string[]) {
    // Recruit troops every 3 rounds
    if (round % 3 === 0) {
        try {
            const militaryBtn = page.locator('button:has-text("Military")').first();
            if (await militaryBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await militaryBtn.click();
                await page.waitForTimeout(300);

                const recruitBtn = page.locator('button:has-text("Recruit")').first();
                if (await recruitBtn.isVisible({ timeout: 1000 }).catch(() => false) && await recruitBtn.isEnabled().catch(() => false)) {
                    await recruitBtn.click();
                    await page.waitForTimeout(200);
                    console.log('  [Action] Recruited troops');
                }
            }
        } catch (e) {}
    }

    // Try to conquer every 5 rounds
    if (round % 5 === 0) {
        try {
            const mapBtn = page.locator('button:has-text("Map")').first();
            if (await mapBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await mapBtn.click();
                await page.waitForTimeout(300);

                const conquerBtn = page.locator('button:has-text("Conquer"), button:has-text("Attack")').first();
                if (await conquerBtn.isVisible({ timeout: 1000 }).catch(() => false) && await conquerBtn.isEnabled().catch(() => false)) {
                    await conquerBtn.click();
                    await page.waitForTimeout(500);
                    console.log('  [Action] Attempted conquest');

                    // Handle battle if it starts
                    const battleBtn = page.locator('button:has-text("Fight"), button:has-text("Battle"), button:has-text("Attack")').first();
                    if (await battleBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                        await battleBtn.click();
                        await page.waitForTimeout(500);
                    }
                }
            }
        } catch (e) {}
    }
}

async function lateGameActions(page: any, round: number, bugs: string[]) {
    // Build buildings every 4 rounds
    if (round % 4 === 0) {
        try {
            const settlementBtn = page.locator('button:has-text("Settlement"), button:has-text("Build")').first();
            if (await settlementBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await settlementBtn.click();
                await page.waitForTimeout(300);

                const buildBtn = page.locator('button:has-text("Build"), button:has-text("Construct")').first();
                if (await buildBtn.isVisible({ timeout: 1000 }).catch(() => false) && await buildBtn.isEnabled().catch(() => false)) {
                    await buildBtn.click();
                    console.log('  [Action] Built structure');
                }
            }
        } catch (e) {}
    }

    // Continue recruiting
    if (round % 2 === 0) {
        try {
            const militaryBtn = page.locator('button:has-text("Military")').first();
            if (await militaryBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await militaryBtn.click();
                await page.waitForTimeout(300);

                const recruitBtn = page.locator('button:has-text("Recruit")').first();
                if (await recruitBtn.isVisible({ timeout: 1000 }).catch(() => false) && await recruitBtn.isEnabled().catch(() => false)) {
                    await recruitBtn.click();
                    console.log('  [Action] Recruited troops');
                }
            }
        } catch (e) {}
    }
}

async function victoryPushActions(page: any, round: number, bugs: string[]) {
    // Max aggression - recruit and conquer every round
    try {
        const militaryBtn = page.locator('button:has-text("Military")').first();
        if (await militaryBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await militaryBtn.click();
            await page.waitForTimeout(200);

            const recruitBtn = page.locator('button:has-text("Recruit")').first();
            if (await recruitBtn.isVisible({ timeout: 1000 }).catch(() => false) && await recruitBtn.isEnabled().catch(() => false)) {
                await recruitBtn.click();
            }
        }
    } catch (e) {}

    try {
        const mapBtn = page.locator('button:has-text("Map")').first();
        if (await mapBtn.isVisible({ timeout: 500 }).catch(() => false)) {
            await mapBtn.click();
            await page.waitForTimeout(200);

            const conquerBtn = page.locator('button:has-text("Conquer")').first();
            if (await conquerBtn.isVisible({ timeout: 1000 }).catch(() => false) && await conquerBtn.isEnabled().catch(() => false)) {
                await conquerBtn.click();
            }
        }
    } catch (e) {}
}

async function manageSenators(page: any, round: number, bugs: string[]) {
    // Manage senators every 4 rounds
    if (round % 4 === 0) {
        try {
            const senateBtn = page.locator('button:has-text("Senate")').first();
            if (await senateBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await senateBtn.click();
                await page.waitForTimeout(300);

                // Use balanced allocation - add timeout to prevent hanging
                const balancedBtn = page.locator('button:has-text("Balanced")').first();
                if (await balancedBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    if (await balancedBtn.isEnabled().catch(() => false)) {
                        await balancedBtn.click();
                        await page.waitForTimeout(200);

                        const confirmBtn = page.locator('button:has-text("Confirm Allocation")');
                        if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                            if (await confirmBtn.isEnabled().catch(() => false)) {
                                await confirmBtn.click();
                                console.log('  [Action] Confirmed senate allocation');
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.log('  [Debug] manageSenators error:', e);
        }
    }
}

async function dismissModals(page: any) {
    // Try multiple times to clear all modals
    for (let attempt = 0; attempt < 5; attempt++) {
        // First, handle senator event modals - look for "Your Response:" text
        try {
            const senatorModal = page.locator('text=Your Response:').first();
            if (await senatorModal.isVisible({ timeout: 300 }).catch(() => false)) {
                // Click on the first choice button - they're rounded-xl buttons in the modal
                // Try multiple selectors to find the clickable choice
                const selectors = [
                    '.fixed button.rounded-xl:not([disabled])',  // rounded choice buttons
                    '.fixed .rounded-xl button:not([disabled])', // button inside rounded container
                    '.fixed button:has-text("relation")',        // buttons showing relation change
                    '.fixed button:has(.bg-green-500)',          // buttons with green effect badges
                    '.fixed .p-4.rounded-xl',                    // the choice container itself
                ];

                for (const selector of selectors) {
                    const btn = page.locator(selector).first();
                    if (await btn.isVisible({ timeout: 200 }).catch(() => false)) {
                        await btn.click({ force: true });
                        await page.waitForTimeout(400);
                        console.log('  [Action] Handled senator event');
                        break;
                    }
                }
                continue;
            }
        } catch (e) {}

        // Handle battle screen - click Retreat if visible and no attack
        try {
            const retreatBtn = page.locator('button:has-text("Retreat")').first();
            const attackBtn = page.locator('button:has-text("Attack"), button:has-text("Fight")').first();

            // If attack button is visible and enabled, attack
            if (await attackBtn.isVisible({ timeout: 200 }).catch(() => false)) {
                if (await attackBtn.isEnabled().catch(() => false)) {
                    await attackBtn.click();
                    await page.waitForTimeout(1000);
                    console.log('  [Action] Attacked in battle');
                    continue;
                }
            }

            // Otherwise retreat if possible
            if (await retreatBtn.isVisible({ timeout: 200 }).catch(() => false)) {
                await retreatBtn.click();
                await page.waitForTimeout(500);
                console.log('  [Action] Retreated from battle');
                continue;
            }
        } catch (e) {}

        // Handle standard modals with text buttons
        let handled = false;
        const modalButtons = ['Dismiss', 'OK', 'Continue', 'Close', 'Accept', 'Confirm'];
        for (const btnText of modalButtons) {
            try {
                const btn = page.locator(`button:has-text("${btnText}")`).first();
                if (await btn.isVisible({ timeout: 200 }).catch(() => false)) {
                    await btn.click();
                    await page.waitForTimeout(200);
                    handled = true;
                    break;
                }
            } catch (e) {}
        }
        if (handled) continue;

        // Press Escape to dismiss any modal
        try {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(200);
        } catch (e) {}

        // Click on any visible modal backdrop (the dark overlay area)
        try {
            const backdrop = page.locator('.fixed.inset-0').first();
            if (await backdrop.isVisible({ timeout: 200 }).catch(() => false)) {
                // Click in the corner to hit the backdrop, not the modal content
                await backdrop.click({ position: { x: 10, y: 10 } });
                await page.waitForTimeout(300);
                console.log('  [Action] Clicked backdrop');
            }
        } catch (e) {}

        // Nuclear option: find ANY enabled button inside a .fixed container and click it
        try {
            const anyFixedBtn = page.locator('.fixed button:not([disabled])').first();
            if (await anyFixedBtn.isVisible({ timeout: 200 }).catch(() => false)) {
                await anyFixedBtn.click();
                await page.waitForTimeout(500);
                console.log('  [Action] Clicked modal button (nuclear option)');
                continue;
            }
        } catch (e) {}

        // If no modal was found, break out of retry loop
        const anyModal = page.locator('.fixed.inset-0').first();
        if (!(await anyModal.isVisible({ timeout: 100 }).catch(() => false))) {
            break;
        }
    }
}

function generateSenatorReport(
    history: { round: number; relations: { [key: string]: number } }[],
    crises: number,
    events: number
): string {
    if (history.length === 0) return 'No senator data collected.';

    const initial = history[0].relations;
    const final = history[history.length - 1].relations;

    let report = '';

    // Track trends
    const trends: { [key: string]: string } = {};
    for (const senator of SENATORS) {
        const start = initial[senator] || 0;
        const end = final[senator] || 0;
        const change = end - start;
        if (change > 20) trends[senator] = 'improved significantly';
        else if (change > 0) trends[senator] = 'improved slightly';
        else if (change < -20) trends[senator] = 'deteriorated significantly';
        else if (change < 0) trends[senator] = 'deteriorated slightly';
        else trends[senator] = 'remained stable';
    }

    // Find most volatile senator
    let maxSwing = 0;
    let volatileSenator = SENATORS[0];
    for (const senator of SENATORS) {
        let min = 100, max = -100;
        for (const h of history) {
            const rel = h.relations[senator] || 0;
            if (rel < min) min = rel;
            if (rel > max) max = rel;
        }
        const swing = max - min;
        if (swing > maxSwing) {
            maxSwing = swing;
            volatileSenator = senator;
        }
    }

    // Find lowest point
    let lowestRel = 0;
    let lowestSenator = '';
    let lowestRound = 0;
    for (const h of history) {
        for (const senator of SENATORS) {
            const rel = h.relations[senator] || 0;
            if (rel < lowestRel) {
                lowestRel = rel;
                lowestSenator = senator;
                lowestRound = h.round;
            }
        }
    }

    // Calculate average final relations
    const avgFinal = SENATORS.reduce((sum, s) => sum + (final[s] || 0), 0) / SENATORS.length;

    report = `Over ${history.length} rounds, senator relations showed varied dynamics. `;
    report += `The most volatile relationship was with ${volatileSenator} (${maxSwing} point swing). `;
    if (lowestSenator) {
        report += `The lowest point reached was ${lowestRel} with ${lowestSenator} in round ${lowestRound}. `;
    }
    report += `${crises} critical senator crises occurred during the playthrough. `;
    report += `Final average relation across all senators was ${avgFinal.toFixed(1)}. `;

    // Summarize individual trends
    const improving = SENATORS.filter(s => trends[s].includes('improved'));
    const declining = SENATORS.filter(s => trends[s].includes('deteriorated'));

    if (improving.length > 0) {
        report += `Relations improved with ${improving.join(', ')}. `;
    }
    if (declining.length > 0) {
        report += `Relations declined with ${declining.join(', ')}. `;
    }

    return report;
}
