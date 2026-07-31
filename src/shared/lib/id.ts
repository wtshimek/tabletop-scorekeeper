/** Works on HTTP LAN IPs where crypto.randomUUID is unavailable (non-secure context). */
export function createId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch {
    // non-secure context throws or omits randomUUID
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`
}
