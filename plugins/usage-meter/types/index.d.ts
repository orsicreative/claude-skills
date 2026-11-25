/**
 * One rate-limit window as the engine reports it: `five_hour`, `seven_day`, or another kind.
 * Mirrors `SessionRateLimit`: a contract must be self-contained, so it cannot import it.
 */
export type UsageWindow = { kind: string; percentUsed: number; resetsAt?: string }

/** What the band draws from, written in one update so windows and time never disagree. */
export type UsageSnapshot = {
  /** `null` until the first measurement; an empty list means the account reports no limits. */
  windows: UsageWindow[] | null
  /** Milliseconds since the epoch, refreshed on a timer so countdowns move between turns. */
  now: number
}

declare module 'claude-code' {
  interface PluginState {
    'usage-meter': {
      usage: Shaped<UsageSnapshot>
    }
  }
}
