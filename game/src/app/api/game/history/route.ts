import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { seasonSnapshots, eventsLog, systemStats } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

/**
 * GET /api/game/history?gameId=xxx
 *
 * Returns the full timeline of a game: metrics per round, events, and system stats.
 * Powers charts, replay, and analytics views.
 */
export async function GET(req: NextRequest) {
  try {
    const gameId = req.nextUrl.searchParams.get('gameId');
    if (!gameId) {
      return NextResponse.json({ error: 'gameId required' }, { status: 400 });
    }

    // Fetch all snapshots (metrics per round)
    const snapshots = await db.select({
      round: seasonSnapshots.round,
      season: seasonSnapshots.season,
      denarii: seasonSnapshots.denarii,
      population: seasonSnapshots.population,
      happiness: seasonSnapshots.happiness,
      morale: seasonSnapshots.morale,
      troops: seasonSnapshots.troops,
      reputation: seasonSnapshots.reputation,
      piety: seasonSnapshots.piety,
      territoriesOwned: seasonSnapshots.territoriesOwned,
      buildingCount: seasonSnapshots.buildingCount,
    })
      .from(seasonSnapshots)
      .where(eq(seasonSnapshots.gameId, gameId))
      .orderBy(asc(seasonSnapshots.round));

    // Fetch all events
    const events = await db.select({
      round: eventsLog.round,
      season: eventsLog.season,
      category: eventsLog.category,
      eventType: eventsLog.eventType,
      message: eventsLog.message,
      effects: eventsLog.effects,
    })
      .from(eventsLog)
      .where(eq(eventsLog.gameId, gameId))
      .orderBy(asc(eventsLog.round));

    // Fetch system stats
    const stats = await db.select()
      .from(systemStats)
      .where(eq(systemStats.gameId, gameId))
      .orderBy(asc(systemStats.round));

    // Group events by round
    const eventsByRound: Record<number, typeof events> = {};
    for (const event of events) {
      if (!eventsByRound[event.round]) eventsByRound[event.round] = [];
      eventsByRound[event.round].push(event);
    }

    // Event category summary
    const categoryCounts: Record<string, number> = {};
    for (const event of events) {
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    }

    return NextResponse.json({
      rounds: snapshots.length,
      snapshots,
      events: eventsByRound,
      stats,
      summary: {
        totalEvents: events.length,
        categoryCounts,
        peakPopulation: Math.max(...snapshots.map(s => s.population), 0),
        peakDenarii: Math.max(...snapshots.map(s => s.denarii), 0),
        peakTroops: Math.max(...snapshots.map(s => s.troops), 0),
        maxTerritories: Math.max(...snapshots.map(s => s.territoriesOwned), 0),
      },
    });
  } catch (error) {
    const err = error as { code?: string; message?: string };
    const code = err?.code || err?.message || 'unknown';
    console.warn(`[history] db unavailable: ${code}`);
    return NextResponse.json(
      { ok: false, error: 'history unavailable' },
      { status: 503 }
    );
  }
}
