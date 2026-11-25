# usage-meter

Shows your Claude usage limits on one line above the prompt while you work:

```
✻ 5h ━━━──── 42% 1h 12m       7d ━━━━━─── 60% 3d 12h       pace ▲ +10 pts → 120%
```

- **5h** and **7d** windows: bar, percent used and time until reset. Bars turn amber at 75% and red at 90%.
- **pace**: points ahead of (`+`) or behind (`-`) an even spread across the week, and where you land at reset if you keep this rate. `▼` under pace, `●` on pace (within 5 points), `▲` ahead of pace; red when the current rate hits the limit before reset.

Items spread evenly across the row and cut short with `…` on narrow terminals instead of wrapping.

Figures come from the rate-limit data of Claude's own responses, so they appear after the first reply of a session. Accounts with no usage limits (API key billing) see nothing.
