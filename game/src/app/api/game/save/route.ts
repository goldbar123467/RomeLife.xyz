import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { games, seasonSnapshots, eventsLog, systemStats } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface SavePayload {
  gameId?: string;
  state: Record<string, unknown>;
  events?: string[];
}

/**
 * POST /api/game/save
 *
 * Saves the current game state as a season snapshot.
 * Creates a new game row on first save, updates it on subsequent saves.
 * Parses events into categorized log entries and extracts system stats.
 */
export async function POST(req: NextRequest) {
  try {
    const body: SavePayload = await req.json();
    const { state, events: rawEvents } = body;
    let { gameId } = body;

    const round = (state.round as number) || 1;
    const season = (state.season as string) || 'spring';
    // Founder can be a string ID or an object with an .id property
    const rawFounder = state.founder;
    const founder = typeof rawFounder === 'object' && rawFounder !== null
      ? (rawFounder as { id: string }).id
      : (rawFounder as string | null);
    const patronGod = state.patronGod as string | null;
    const denarii = Math.round(state.denarii as number) || 0;
    const population = Math.round(state.population as number) || 0;
    const happiness = (state.happiness as number) || 0;
    const morale = (state.morale as number) || 0;
    const troops = Math.round(state.troops as number) || 0;
    const reputation = (state.reputation as number) || 0;
    const piety = (state.piety as number) || 0;

    const territories = (state.territories as Array<{ owned: boolean; stability: number; garrison: number }>) || [];
    const ownedTerritories = territories.filter(t => t.owned);
    const buildings = (state.buildings as Array<{ count: number }>) || [];
    const buildingCount = buildings.reduce((sum, b) => sum + (b.count || 0), 0);

    // ── Handle game-finish marker ──
    const markFinished = state._markFinished as boolean | undefined;
    if (markFinished && gameId) {
      const finishStatus = (state.status as string) || 'defeat';
      const finishReason = (state.reason as string) || undefined;
      await db.update(games)
        .set({
          status: finishStatus,
          ...(finishStatus === 'victory' ? { victoryType: finishReason } : { defeatReason: finishReason }),
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(games.id, gameId));

      return NextResponse.json({ gameId, finished: true });
    }

    // ── Upsert game row ──
    if (!gameId) {
      const [newGame] = await db.insert(games).values({
        founder,
        patronGod,
        status: 'active',
        currentRound: round,
        currentSeason: season,
      }).returning();
      gameId = newGame.id;
    } else {
      await db.update(games)
        .set({
          patronGod,
          currentRound: round,
          currentSeason: season,
          updatedAt: new Date(),
        })
        .where(eq(games.id, gameId));
    }

    // ── Insert season snapshot ──
    await db.insert(seasonSnapshots).values({
      gameId,
      round,
      season,
      denarii,
      population,
      happiness,
      morale,
      troops,
      reputation,
      piety,
      territoriesOwned: ownedTerritories.length,
      buildingCount,
      fullState: state,
    });

    // ── Parse and insert events ──
    if (rawEvents && rawEvents.length > 0) {
      const parsedEvents = rawEvents.map(msg => {
        const { category, eventType } = categorizeEvent(msg);
        return {
          gameId: gameId!,
          round,
          season,
          category,
          eventType,
          message: msg,
          effects: extractEffects(msg),
        };
      });
      await db.insert(eventsLog).values(parsedEvents);
    }

    // ── Insert system stats ──
    const godFavor = (state.godFavor as Record<string, number>) || {};
    const totalFavor = Object.values(godFavor).reduce((s, v) => s + v, 0);

    const senate = state.senate as { senators?: Record<string, { relation: number }> } | null;
    let avgSenatorRelation = 0;
    if (senate?.senators) {
      const relations = Object.values(senate.senators).map(s => s.relation || 0);
      avgSenatorRelation = relations.length > 0 ? relations.reduce((s, r) => s + r, 0) / relations.length : 0;
    }

    const diplomacy = state.diplomacy as { activeEnvoys: number } | null;
    const inventory = state.inventory as Record<string, number> | null;

    await db.insert(systemStats).values({
      gameId,
      round,
      netIncome: denarii - ((state as Record<string, unknown>).previousDenarii as number || denarii),
      totalFavor,
      avgSenatorRelation,
      activeEnvoys: diplomacy?.activeEnvoys || 0,
      avgStability: ownedTerritories.length > 0
        ? ownedTerritories.reduce((s, t) => s + t.stability, 0) / ownedTerritories.length
        : 0,
      totalGarrison: ownedTerritories.reduce((s, t) => s + t.garrison, 0),
      grainStock: inventory?.grain || 0,
      isStarving: (state.consecutiveStarvation as number) > 0,
    });

    return NextResponse.json({ gameId, round, saved: true });
  } catch (error) {
    const err = error as { code?: string; message?: string };
    const code = err?.code || err?.message || 'unknown';
    console.warn(`[save] db unavailable: ${code}`);
    return NextResponse.json(
      { ok: false, error: 'save unavailable' },
      { status: 503 }
    );
  }
}

// ── Event categorization ──

function categorizeEvent(msg: string): { category: string; eventType: string } {
  if (msg.startsWith('[Treasury]')) return { category: 'treasury', eventType: extractType(msg) };
  if (msg.startsWith('[Trade]')) return { category: 'trade', eventType: extractType(msg) };
  if (msg.startsWith('[Senate]')) return { category: 'senate', eventType: extractType(msg) };
  if (msg.startsWith('[Territory]')) return { category: 'territory', eventType: extractType(msg) };
  if (msg.startsWith('[Combat]') || msg.startsWith('[Battle]')) return { category: 'battle', eventType: extractType(msg) };
  if (msg.startsWith('[Wonder]') || msg.startsWith('[Build]')) return { category: 'wonder', eventType: extractType(msg) };
  if (msg.startsWith('[Achievement]') || msg.startsWith('[Quest]')) return { category: 'achievement', eventType: extractType(msg) };
  if (msg.startsWith('[Venus]') || msg.startsWith('[Minerva]') || msg.startsWith('[Mars]') || msg.startsWith('[Jupiter]') || msg.startsWith('[Ceres]') || msg.startsWith('[Mercury]')) return { category: 'religion', eventType: extractType(msg) };
  if (msg.startsWith('[Crisis]')) return { category: 'crisis', eventType: extractType(msg) };
  if (msg.includes('starvation') || msg.includes('Famine')) return { category: 'crisis', eventType: 'starvation' };
  return { category: 'system', eventType: 'generic' };
}

function extractType(msg: string): string {
  const match = msg.match(/\[(\w+)\]\s*(.+?)[:!]/);
  if (match) return match[2].toLowerCase().replace(/\s+/g, '_').slice(0, 50);
  return msg.slice(0, 50).toLowerCase().replace(/\s+/g, '_');
}

function extractEffects(msg: string): Record<string, number> | null {
  const effects: Record<string, number> = {};
  const denariiMatch = msg.match(/([+-]?\d+)\s*denarii/i);
  if (denariiMatch) effects.denarii = parseInt(denariiMatch[1]);
  const repMatch = msg.match(/([+-]?\d+)\s*reputation/i);
  if (repMatch) effects.reputation = parseInt(repMatch[1]);
  const happyMatch = msg.match(/([+-]?\d+)\s*happiness/i);
  if (happyMatch) effects.happiness = parseInt(happyMatch[1]);
  const moraleMatch = msg.match(/([+-]?\d+)\s*morale/i);
  if (moraleMatch) effects.morale = parseInt(moraleMatch[1]);
  return Object.keys(effects).length > 0 ? effects : null;
}
