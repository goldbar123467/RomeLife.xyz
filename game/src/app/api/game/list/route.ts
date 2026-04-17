import { NextResponse } from 'next/server';
import { db } from '@/db';
import { games, seasonSnapshots } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

/**
 * GET /api/game/list
 *
 * Returns all saved games with their latest stats.
 */
export async function GET() {
  try {
    const allGames = await db.select({
      id: games.id,
      founder: games.founder,
      patronGod: games.patronGod,
      status: games.status,
      victoryType: games.victoryType,
      defeatReason: games.defeatReason,
      currentRound: games.currentRound,
      currentSeason: games.currentSeason,
      createdAt: games.createdAt,
      updatedAt: games.updatedAt,
      finishedAt: games.finishedAt,
    })
      .from(games)
      .orderBy(desc(games.updatedAt));

    // Get latest snapshot stats for each game
    const gameList = await Promise.all(allGames.map(async (game) => {
      const [latestSnapshot] = await db.select({
        denarii: seasonSnapshots.denarii,
        population: seasonSnapshots.population,
        happiness: seasonSnapshots.happiness,
        troops: seasonSnapshots.troops,
        territoriesOwned: seasonSnapshots.territoriesOwned,
      })
        .from(seasonSnapshots)
        .where(eq(seasonSnapshots.gameId, game.id))
        .orderBy(desc(seasonSnapshots.round))
        .limit(1);

      const [snapshotCount] = await db.select({
        count: sql<string>`count(*)`,
      })
        .from(seasonSnapshots)
        .where(eq(seasonSnapshots.gameId, game.id));

      return {
        ...game,
        latestStats: latestSnapshot || null,
        totalSnapshots: parseInt(snapshotCount?.count || '0'),
      };
    }));

    return NextResponse.json({ games: gameList });
  } catch (error) {
    const err = error as { code?: string; message?: string };
    const code = err?.code || err?.message || 'unknown';
    console.warn(`[list] db unavailable: ${code}`);
    return NextResponse.json(
      { ok: false, error: 'list unavailable' },
      { status: 503 }
    );
  }
}
