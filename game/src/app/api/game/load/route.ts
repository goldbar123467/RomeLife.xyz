import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { games, seasonSnapshots } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

/**
 * GET /api/game/load?gameId=xxx
 *
 * Loads the latest snapshot for a given game, restoring full state.
 */
export async function GET(req: NextRequest) {
  try {
    const gameId = req.nextUrl.searchParams.get('gameId');
    if (!gameId) {
      return NextResponse.json({ error: 'gameId required' }, { status: 400 });
    }

    // Get the game record
    const [game] = await db.select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get the latest snapshot
    const [latestSnapshot] = await db.select()
      .from(seasonSnapshots)
      .where(eq(seasonSnapshots.gameId, gameId))
      .orderBy(desc(seasonSnapshots.round))
      .limit(1);

    if (!latestSnapshot) {
      return NextResponse.json({ error: 'No snapshots found' }, { status: 404 });
    }

    return NextResponse.json({
      game,
      snapshot: {
        round: latestSnapshot.round,
        season: latestSnapshot.season,
        denarii: latestSnapshot.denarii,
        population: latestSnapshot.population,
        happiness: latestSnapshot.happiness,
        troops: latestSnapshot.troops,
      },
      fullState: latestSnapshot.fullState,
    });
  } catch (error) {
    console.error('Load error:', error);
    return NextResponse.json(
      { error: 'Failed to load game', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/game/load?gameId=xxx&round=5
 *
 * Loads a specific round's snapshot (for replay / rollback).
 */
export async function POST(req: NextRequest) {
  try {
    const { gameId, round } = await req.json();
    if (!gameId || round === undefined) {
      return NextResponse.json({ error: 'gameId and round required' }, { status: 400 });
    }

    const [snapshot] = await db.select()
      .from(seasonSnapshots)
      .where(and(
        eq(seasonSnapshots.gameId, gameId),
        eq(seasonSnapshots.round, round),
      ))
      .limit(1);

    if (!snapshot) {
      return NextResponse.json({ error: `No snapshot for round ${round}` }, { status: 404 });
    }

    return NextResponse.json({
      round: snapshot.round,
      season: snapshot.season,
      fullState: snapshot.fullState,
    });
  } catch (error) {
    console.error('Load round error:', error);
    return NextResponse.json(
      { error: 'Failed to load round', details: String(error) },
      { status: 500 }
    );
  }
}
