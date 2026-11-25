// Pure usage math: no `$`, no drawing, so it can be tested on its own.
import type { UsageWindow } from '../types'
import {
  FULL_PERCENT,
  MIN_ELAPSED_FRACTION_FOR_PROJECTION,
  PACE_TOLERANCE_POINTS,
  TIME,
  USAGE_THRESHOLDS,
  WINDOW_DEFINITIONS,
  WINDOW_ORDER,
} from './config'

export type UsageLevel = 'normal' | 'warning' | 'error'
export type PaceStatus = 'under' | 'on' | 'over' | 'limit'

export type WindowReading = {
  shortLabel: string
  percentUsed: number
  level: UsageLevel
  msUntilReset?: number
}

export type Pace = {
  status: PaceStatus
  /** Used minus an even pace, in percentage points; positive is ahead of pace. */
  deltaPoints: number
  /** Where usage ends at reset if the rate so far holds; absent while too early to tell. */
  projectedPercent?: number
  /** Time until the limit at the rate so far, when that comes before the reset. */
  msUntilLimit?: number
}

function usageLevel(percentUsed: number): UsageLevel {
  if (percentUsed >= USAGE_THRESHOLDS.errorPercent) return 'error'
  if (percentUsed >= USAGE_THRESHOLDS.warningPercent) return 'warning'
  return 'normal'
}

function msUntil(resetsAt: string | undefined, now: number): number | undefined {
  if (!resetsAt) return undefined
  const resetMs = Date.parse(resetsAt)
  return Number.isFinite(resetMs) ? Math.max(0, resetMs - now) : undefined
}

export function readWindows(windows: readonly UsageWindow[], now: number): WindowReading[] {
  const rank = (kind: string) => {
    const index = WINDOW_ORDER.indexOf(kind)
    return index === -1 ? WINDOW_ORDER.length : index
  }
  return [...windows]
    .sort((first, second) => rank(first.kind) - rank(second.kind))
    .map(window => {
      const definition = WINDOW_DEFINITIONS[window.kind]
      return {
        shortLabel: definition?.shortLabel ?? window.kind,
        percentUsed: window.percentUsed,
        level: usageLevel(window.percentUsed),
        msUntilReset: msUntil(window.resetsAt, now),
      }
    })
}

/** Pace of a window against an even spread across its length; null when its length or reset is unknown. */
export function computePace(window: UsageWindow, now: number): Pace | null {
  const durationMs = WINDOW_DEFINITIONS[window.kind]?.durationMs
  const remainingMs = msUntil(window.resetsAt, now)
  if (durationMs === undefined || remainingMs === undefined) return null

  const elapsedMs = Math.max(0, durationMs - remainingMs)
  const elapsedFraction = Math.min(1, elapsedMs / durationMs)
  const evenPacePercent = elapsedFraction * FULL_PERCENT
  const deltaPoints = window.percentUsed - evenPacePercent
  const remainingPercent = Math.max(0, FULL_PERCENT - window.percentUsed)

  const isTooEarly = elapsedFraction < MIN_ELAPSED_FRACTION_FOR_PROJECTION
  const projectedPercent = isTooEarly ? undefined : window.percentUsed / elapsedFraction
  const percentPerMs = elapsedMs > 0 ? window.percentUsed / elapsedMs : 0
  const msToLimitAtRate = percentPerMs > 0 ? remainingPercent / percentPerMs : Infinity
  const msUntilLimit = !isTooEarly && msToLimitAtRate < remainingMs ? msToLimitAtRate : undefined

  let status: PaceStatus = 'on'
  if (window.percentUsed >= FULL_PERCENT || msUntilLimit !== undefined) status = 'limit'
  else if (deltaPoints > PACE_TOLERANCE_POINTS) status = 'over'
  else if (deltaPoints < -PACE_TOLERANCE_POINTS) status = 'under'

  return { status, deltaPoints, projectedPercent, msUntilLimit }
}

/** "3d 4h", "1h 12m", "12m", "<1m". */
export function formatDuration(ms: number): string {
  const days = Math.floor(ms / TIME.MS_PER_DAY)
  const hours = Math.floor((ms % TIME.MS_PER_DAY) / TIME.MS_PER_HOUR)
  const minutes = Math.floor((ms % TIME.MS_PER_HOUR) / TIME.MS_PER_MINUTE)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return '<1m'
}

export function formatPercent(percent: number): string {
  return `${Math.round(percent)}%`
}

export function formatPoints(points: number): string {
  const rounded = Math.round(points)
  return `${rounded > 0 ? '+' : ''}${rounded} pts`
}

/** How many of `width` cells a percentage fills. */
export function filledCells(percentUsed: number, width: number): number {
  const fraction = Math.min(1, Math.max(0, percentUsed / FULL_PERCENT))
  return Math.round(fraction * width)
}
