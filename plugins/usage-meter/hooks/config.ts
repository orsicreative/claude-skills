const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR
const HOURS_IN_SESSION_WINDOW = 5
const DAYS_IN_WEEKLY_WINDOW = 7

export const TIME = { MS_PER_MINUTE, MS_PER_HOUR, MS_PER_DAY } as const

/** The window the pace tracker follows. */
export const WEEKLY_KIND = 'seven_day'

/** How each reported window is named and how long it lasts. A kind not listed shows by its own name with no pace math. */
export const WINDOW_DEFINITIONS: Record<string, { shortLabel: string; durationMs: number }> = {
  five_hour: { shortLabel: '5h', durationMs: HOURS_IN_SESSION_WINDOW * MS_PER_HOUR },
  seven_day: { shortLabel: '7d', durationMs: DAYS_IN_WEEKLY_WINDOW * MS_PER_DAY },
}

/** The order windows draw in: the order of WINDOW_DEFINITIONS; other kinds follow in reported order. */
export const WINDOW_ORDER = Object.keys(WINDOW_DEFINITIONS)

/** Percent-used levels where a window's bar turns from accent to warning to error. */
export const USAGE_THRESHOLDS = { warningPercent: 75, errorPercent: 90 } as const

/** Points either side of an even pace still counted as "on pace". */
export const PACE_TOLERANCE_POINTS = 5

/** Before this share of the week has passed, a projection is too noisy to show. */
export const MIN_ELAPSED_FRACTION_FOR_PROJECTION = 0.02

export const FULL_PERCENT = 100

/** How often countdowns refresh between turns. */
export const REFRESH_INTERVAL_MS = MS_PER_MINUTE

export const BAR_WIDTH = 8

/** Claude Code's own palette keys, so the band follows the person's theme. */
export const COLORS = {
  accent: 'claude',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const

export const GLYPHS = {
  mark: '✻',
  barFilled: '━',
  barEmpty: '─',
  under: '▼',
  on: '●',
  over: '▲',
} as const
