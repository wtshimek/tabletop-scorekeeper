const GAME_PREFIX = 'scorekeeper:v1:game:'

export function gameStorageKey(gameId: string): string {
  return `${GAME_PREFIX}${gameId}`
}

export function loadRaw(gameId: string): string | null {
  try {
    return localStorage.getItem(gameStorageKey(gameId))
  } catch {
    return null
  }
}

export function saveRaw(gameId: string, value: string): void {
  localStorage.setItem(gameStorageKey(gameId), value)
}

export function clearGameStorage(gameId: string): void {
  localStorage.removeItem(gameStorageKey(gameId))
}

export function hasStoredSession(gameId: string): boolean {
  const raw = loadRaw(gameId)
  return raw != null && raw !== '' && raw !== 'null'
}

/** One-time copy from a legacy key into the namespaced game key. */
export function migrateLegacyKey(gameId: string, legacyKey: string): void {
  try {
    if (loadRaw(gameId)) return
    const legacy = localStorage.getItem(legacyKey)
    if (!legacy) return
    saveRaw(gameId, legacy)
    localStorage.removeItem(legacyKey)
  } catch {
    // ignore
  }
}
