import { expect, test } from 'claude-code/testing'

import { TIME } from './config'
import { computePace, formatDuration } from './pace'

const NOW = Date.parse('2026-11-25T12:00:00Z')

const BAND = {
  plugin: 'usage-meter',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 20,
    bodyColumns: 120,
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

// Halfway through the week, 60% used: 10 points ahead, on track to hit the limit.
const WINDOWS = [
  { kind: 'seven_day', percentUsed: 60, resetsAt: new Date(NOW + 3.5 * TIME.MS_PER_DAY).toISOString() },
  { kind: 'five_hour', percentUsed: 42, resetsAt: new Date(NOW + 72 * TIME.MS_PER_MINUTE).toISOString() },
]

function engine(on: any) {
  on('session.start', (_: unknown, e: any) => ({ cwd: e.cwd }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: {}, rateLimits: WINDOWS } }))
  on('clock.now', () => ({ value: NOW }))
  on('clock.every', () => ({ value: undefined }))
}

test('pace math: halfway through the week at 60% is ahead and hits the limit early', () => {
  const pace = computePace(WINDOWS[0], NOW)
  expect(pace?.status).toBe('limit')
  expect(Math.round(pace?.deltaPoints ?? 0)).toBe(10)
  expect(Math.round(pace?.projectedPercent ?? 0)).toBe(120)
  expect(formatDuration(pace?.msUntilLimit ?? 0)).toBe('2d 8h')
})

test('pace math: under an even pace', () => {
  const pace = computePace({ ...WINDOWS[0], percentUsed: 20 }, NOW)
  expect(pace?.status).toBe('under')
  expect(pace?.msUntilLimit).toBe(undefined)
})

test('the row draws both windows and the pace on one line', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  const text = (await ui.findAll({ type: 'Text' })).map(found => found.text).join(' ')
  expect(text).toContain('42%')
  expect(text).toContain('60%')
  expect(text).toContain('1h 12m')
  expect(text).toContain('+10 pts')
  await ui.unmount()
})
