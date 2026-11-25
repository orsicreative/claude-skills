import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionRateLimit, Timer } from 'claude-code'

import type { UsageSnapshot } from '../types'
import { BAR_WIDTH, COLORS, GLYPHS, REFRESH_INTERVAL_MS, WEEKLY_KIND } from './config'
import { computePace, filledCells, formatDuration, formatPercent, formatPoints, readWindows } from './pace'
import type { Pace, PaceStatus, UsageLevel, WindowReading } from './pace'

const EMPTY_USAGE: UsageSnapshot = { windows: null, now: 0 }
// Bump the tag when UsageSnapshot changes: a value stored under another tag reads as EMPTY_USAGE.
const usage = atom({ plugin: 'usage-meter', key: 'usage' } as const, EMPTY_USAGE, { shape: 'usage-1' })

const LEVEL_COLOR: Record<UsageLevel, string> = {
  normal: COLORS.accent,
  warning: COLORS.warning,
  error: COLORS.error,
}

/** The glyph and signed points carry the status too, so it never rests on color alone. */
const OVER_PACE_LOOK = { glyph: GLYPHS.over, color: COLORS.warning }
const PACE_LOOK: Record<PaceStatus, { glyph: string; color: string }> = {
  under: { glyph: GLYPHS.under, color: COLORS.success },
  on: { glyph: GLYPHS.on, color: COLORS.success },
  over: OVER_PACE_LOOK,
  limit: { ...OVER_PACE_LOOK, color: COLORS.error },
}

/** Stamps the time and, when given, new windows, in one write so a frame never mixes old and new. */
async function record($: EngineInterface, rateLimits?: readonly SessionRateLimit[]) {
  const time = await $.clock.now()
  await update($, usage, current => ({ windows: rateLimits ? [...rateLimits] : current.windows, now: time }))
}

export const register: Register = on => {
  let refreshTimer: Timer | undefined
  const stopRefresh = () => {
    refreshTimer?.cancel()
    refreshTimer = undefined
  }

  on('session.start', async ($, e, next) => {
    // Before the first response the engine may have no reading yet: keep `null` (waiting) rather than `[]` (no limits).
    const { rateLimits } = await $.session.usage()
    await record($, rateLimits.length > 0 ? rateLimits : undefined)

    stopRefresh()
    refreshTimer = $.clock.every(REFRESH_INTERVAL_MS, () => void record($))

    return next(e)
  })

  on('session.end', async ($, e, next) => {
    stopRefresh()
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await record($, e.rateLimits)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const { windows: reported, now: time } = await read($, usage)
    // An account with no limits (API billing) reports an empty list: draw nothing.
    if (reported !== null && reported.length === 0) return next(e)

    const { Box, Text } = $.ui.resolve(e)

    if (reported === null) {
      return (
        <Box flexDirection="row" gap={1}>
          <Text color={COLORS.accent}>{GLYPHS.mark}</Text>
          <Text dimColor>Usage limits appear after the first response</Text>
        </Box>
      )
    }

    const readings = readWindows(reported, time)
    const weekly = reported.find(window => window.kind === WEEKLY_KIND)
    const pace = weekly ? computePace(weekly, time) : null

    const bar = (reading: WindowReading) => {
      const filled = filledCells(reading.percentUsed, BAR_WIDTH)
      return (
        <Text>
          <Text color={LEVEL_COLOR[reading.level]}>{GLYPHS.barFilled.repeat(filled)}</Text>
          <Text dimColor>{GLYPHS.barEmpty.repeat(BAR_WIDTH - filled)}</Text>
        </Text>
      )
    }

    const paceItem = (weeklyPace: Pace) => {
      const look = PACE_LOOK[weeklyPace.status]
      return (
        <Text wrap="truncate-end">
          <Text dimColor>pace </Text>
          <Text color={look.color}>
            {look.glyph} {formatPoints(weeklyPace.deltaPoints)}
          </Text>
          {weeklyPace.projectedPercent === undefined ? null : (
            <Text dimColor> → {formatPercent(weeklyPace.projectedPercent)}</Text>
          )}
        </Text>
      )
    }

    return (
      // One line. Each item is its own child so space-between spreads them evenly across the row;
      // items may shrink and cut with … rather than wrap.
      <Box flexDirection="row" flexWrap="nowrap" justifyContent="space-between" width="100%" gap={1}>
        {readings.map((reading, index) => (
          <Box flexShrink={1} minWidth={0}>
            <Text wrap="truncate-end">
              {index === 0 ? <Text color={COLORS.accent}>{GLYPHS.mark} </Text> : null}
              <Text dimColor>{reading.shortLabel} </Text>
              {bar(reading)}
              <Text color={LEVEL_COLOR[reading.level]}> {formatPercent(reading.percentUsed)}</Text>
              {reading.msUntilReset === undefined ? null : (
                <Text dimColor> {formatDuration(reading.msUntilReset)}</Text>
              )}
            </Text>
          </Box>
        ))}
        {pace ? <Box flexShrink={1} minWidth={0}>{paceItem(pace)}</Box> : null}
      </Box>
    )
  })
}
