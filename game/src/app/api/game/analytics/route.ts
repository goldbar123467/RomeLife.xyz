import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { games, eventsLog, systemStats, seasonSnapshots } from '@/db/schema';
import { eq, sql, desc, and, lt } from 'drizzle-orm';

/**
 * GET /api/game/analytics
 *
 * Cross-game analytics: which systems cause the most defeats,
 * average victory round, common failure patterns, etc.
 */
export async function GET(req: NextRequest) {
  try {
    const gameId = req.nextUrl.searchParams.get('gameId');

    // ── Per-game analytics ──
    if (gameId) {
      return NextResponse.json(await getGameAnalytics(gameId));
    }

    // ── Global analytics ──
    const [totalGamesResult] = await db.select({ count: sql<string>`count(*)` }).from(games);
    const [activeGamesResult] = await db.select({ count: sql<string>`count(*)` }).from(games).where(eq(games.status, 'active'));
    const [victoriesResult] = await db.select({ count: sql<string>`count(*)` }).from(games).where(eq(games.status, 'victory'));
    const [defeatsResult] = await db.select({ count: sql<string>`count(*)` }).from(games).where(eq(games.status, 'defeat'));

    // Average round at defeat
    const [avgDefeatRound] = await db.select({
      avg: sql<string>`avg(current_round)`,
    }).from(games).where(eq(games.status, 'defeat'));

    // Average round at victory
    const [avgVictoryRound] = await db.select({
      avg: sql<string>`avg(current_round)`,
    }).from(games).where(eq(games.status, 'victory'));

    // Most common defeat reasons
    const defeatReasons = await db.select({
      reason: games.defeatReason,
      count: sql<string>`count(*)`,
    })
      .from(games)
      .where(eq(games.status, 'defeat'))
      .groupBy(games.defeatReason)
      .orderBy(desc(sql`count(*)`));

    // Most common event categories
    const eventCategories = await db.select({
      category: eventsLog.category,
      count: sql<string>`count(*)`,
    })
      .from(eventsLog)
      .groupBy(eventsLog.category)
      .orderBy(desc(sql`count(*)`));

    // Crisis events breakdown
    const crisisBreakdown = await db.select({
      eventType: eventsLog.eventType,
      count: sql<string>`count(*)`,
    })
      .from(eventsLog)
      .where(eq(eventsLog.category, 'crisis'))
      .groupBy(eventsLog.eventType)
      .orderBy(desc(sql`count(*)`));

    const totalGames = parseInt(totalGamesResult?.count || '0');
    const victories = parseInt(victoriesResult?.count || '0');
    const defeats = parseInt(defeatsResult?.count || '0');

    return NextResponse.json({
      overview: {
        totalGames,
        activeGames: parseInt(activeGamesResult?.count || '0'),
        victories,
        defeats,
        winRate: (victories + defeats) > 0
          ? (victories / (victories + defeats) * 100).toFixed(1) + '%'
          : 'N/A',
      },
      timing: {
        avgDefeatRound: avgDefeatRound?.avg ? Math.round(parseFloat(avgDefeatRound.avg)) : null,
        avgVictoryRound: avgVictoryRound?.avg ? Math.round(parseFloat(avgVictoryRound.avg)) : null,
      },
      defeatReasons,
      eventCategories,
      crisisBreakdown,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to compute analytics', details: String(error) },
      { status: 500 }
    );
  }
}

async function getGameAnalytics(gameId: string) {
  // Starvation rounds
  const starvationRounds = await db.select({
    round: systemStats.round,
    grainStock: systemStats.grainStock,
  })
    .from(systemStats)
    .where(and(eq(systemStats.gameId, gameId), eq(systemStats.isStarving, true)));

  // Stability danger zones (avg stability < 30)
  const lowStabilityRounds = await db.select({
    round: systemStats.round,
    avgStability: systemStats.avgStability,
  })
    .from(systemStats)
    .where(and(eq(systemStats.gameId, gameId), lt(systemStats.avgStability, 30)));

  // Senate crisis rounds
  const senateCrisisRounds = await db.select({
    round: eventsLog.round,
    message: eventsLog.message,
  })
    .from(eventsLog)
    .where(and(
      eq(eventsLog.gameId, gameId),
      eq(eventsLog.category, 'senate'),
    ));

  // Economy trajectory
  const economyTrend = await db.select({
    round: seasonSnapshots.round,
    denarii: seasonSnapshots.denarii,
    population: seasonSnapshots.population,
    happiness: seasonSnapshots.happiness,
  })
    .from(seasonSnapshots)
    .where(eq(seasonSnapshots.gameId, gameId))
    .orderBy(seasonSnapshots.round);

  return {
    gameId,
    starvationRounds,
    lowStabilityRounds,
    senateCrisisRounds: senateCrisisRounds.length,
    economyTrend,
    riskAssessment: {
      starvationRisk: starvationRounds.length > 0 ? 'HIGH' : 'LOW',
      stabilityRisk: lowStabilityRounds.length > 2 ? 'HIGH' : lowStabilityRounds.length > 0 ? 'MEDIUM' : 'LOW',
      senateRisk: senateCrisisRounds.length > 5 ? 'HIGH' : senateCrisisRounds.length > 2 ? 'MEDIUM' : 'LOW',
    },
  };
}
