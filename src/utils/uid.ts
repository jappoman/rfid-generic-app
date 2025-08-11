/**
 * Generate a short, readable unique id for client-side usage.
 * Not cryptographically secure. Use server-side IDs for persisted records.
 */
export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Optional helper to add a prefix, e.g. uidWithPrefix('ws_')
 */
export function uidWithPrefix(prefix = ""): string {
  return `${prefix}${uid()}`;
}
