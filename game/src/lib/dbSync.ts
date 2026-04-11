/**
 * Database sync module - fires after each season end to persist
 * the game state snapshot and events to PostgreSQL.
 *
 * Runs client-side, calls the API routes. Non-blocking - the game
 * doesn't wait for the DB write to complete.
 */

const DB_GAME_ID_KEY = 'rome-db-game-id';

export function getDbGameId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DB_GAME_ID_KEY);
}

export function setDbGameId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_GAME_ID_KEY, id);
}

export function clearDbGameId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DB_GAME_ID_KEY);
}

/**
 * Save the current game state to PostgreSQL.
 * Called after every endSeason() and on game-ending events.
 */
export async function syncToDatabase(
  state: Record<string, unknown>,
  events: string[],
): Promise<string | null> {
  try {
    const gameId = getDbGameId();

    const res = await fetch('/api/game/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId,
        state,
        events,
      }),
    });

    if (!res.ok) {
      console.warn('[DB Sync] Save failed:', res.status, await res.text());
      return gameId;
    }

    const data = await res.json();

    // Store the game ID for subsequent saves
    if (data.gameId && data.gameId !== gameId) {
      setDbGameId(data.gameId);
    }

    console.log(`[DB Sync] Round ${data.round} saved (game: ${data.gameId})`);
    return data.gameId;
  } catch (error) {
    // Non-blocking - don't crash the game if DB is down
    console.warn('[DB Sync] Error:', error);
    return getDbGameId();
  }
}

/**
 * Mark the game as finished (victory or defeat) in the database.
 */
export async function markGameFinished(
  status: 'victory' | 'defeat',
  reason?: string,
): Promise<void> {
  const gameId = getDbGameId();
  if (!gameId) return;

  try {
    await fetch('/api/game/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId,
        state: { _markFinished: true, status, reason },
        events: [`[System] Game ended: ${status}${reason ? ` - ${reason}` : ''}`],
      }),
    });
  } catch (error) {
    console.warn('[DB Sync] Failed to mark game finished:', error);
  }
}

/**
 * Load a game from the database.
 */
export async function loadFromDatabase(gameId: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`/api/game/load?gameId=${gameId}`);
    if (!res.ok) return null;

    const data = await res.json();
    setDbGameId(gameId);
    return data.fullState as Record<string, unknown>;
  } catch (error) {
    console.warn('[DB Sync] Load failed:', error);
    return null;
  }
}

/**
 * Load a specific round for replay / rollback.
 */
export async function loadRoundFromDatabase(gameId: string, round: number): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch('/api/game/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, round }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data.fullState as Record<string, unknown>;
  } catch (error) {
    console.warn('[DB Sync] Load round failed:', error);
    return null;
  }
}

/**
 * List all saved games.
 */
export async function listGames(): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await fetch('/api/game/list');
    if (!res.ok) return [];

    const data = await res.json();
    return data.games || [];
  } catch (error) {
    console.warn('[DB Sync] List failed:', error);
    return [];
  }
}

/**
 * Get game history (timeline of metrics, events, stats).
 */
export async function getGameHistory(gameId: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`/api/game/history?gameId=${gameId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.warn('[DB Sync] History failed:', error);
    return null;
  }
}

/**
 * Get analytics for a specific game or global.
 */
export async function getAnalytics(gameId?: string): Promise<Record<string, unknown> | null> {
  try {
    const url = gameId ? `/api/game/analytics?gameId=${gameId}` : '/api/game/analytics';
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.warn('[DB Sync] Analytics failed:', error);
    return null;
  }
}
