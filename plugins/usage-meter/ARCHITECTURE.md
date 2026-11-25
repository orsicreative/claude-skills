# Architecture

Claude Code mod (function hooks plugin). No build step, no dependencies.

| File | Role |
| --- | --- |
| `.claude-plugin/plugin.json` | Manifest, version |
| `types/index.d.ts` | `$.state` contract: `usage` (windows + now, one write) |
| `hooks/config.ts` | Every tunable: window definitions, thresholds, widths, colors, glyphs |
| `hooks/pace.ts` | Pure logic: window readings, pace math, formatting. No `$`, no drawing |
| `hooks/register.tsx` | Hooks: data in, state, drawing |
| `hooks/usage-meter.test.tsx` | `claude plugin test .` |

## Data flow

1. `session.start`: seed windows from `$.session.usage()`, start a one-minute timer that refreshes `now`.
2. `session.measure` (engine push after each turn and whenever a window moves a point): `record` writes windows and time in one update.
3. `ui.render` on `AbovePrompt`: reads the `usage` atom, runs `pace.ts`, draws the one-line row. Reads subscribe, so writes redraw.

## Pace model

Window start = `resetsAt - duration`. Even pace = elapsed share x 100. Projection = used / elapsed share (hidden in the first 2% of the week). Time to limit = remaining percent / average rate so far; when it falls before reset the pace turns red.
