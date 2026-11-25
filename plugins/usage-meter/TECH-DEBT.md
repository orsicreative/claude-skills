# Tech debt / cleanup

- Pace uses the average rate since the window opened. A recent-rate figure (last few hours, from stored samples) would react faster to a heavy session.
- `Progress` element dropped for text bars: the test harness table lacked it. Revisit for native bars on desktop/mobile.
- Not type-checked with `tsc` yet (TypeScript not installed); `claude plugin validate` and tests pass.
- Window durations for `five_hour` / `seven_day` are assumed (5h, 7d). An unknown kind shows without pace.
