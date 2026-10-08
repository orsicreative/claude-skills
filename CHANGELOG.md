# Changelog

## 1.1.1 — 2026-10-08
- `/user-story`: frontend-design is invoked through the Skill tool (the old "/frontend-design" wording never fired during autorun). Also triggers on the `frontend-design` flag and on the first UI story of a project with no visual design yet.
- `/epic-planning`: always flags `frontend-design` on the first UI story of a new project; autorun records the chosen design direction in `plan.md` so later stories follow it.
- Autorun reads every skill file it uses up front. Each epic's code audit runs in full before the next epic starts and saves its report to `plans/<slug>/audit-epic-<id>.md`. `progress.json` points `audit` to that file instead of saying `done`, and records only what actually ran. Other session modes (e.g. lazy or minimal) can't skip workflow steps.
- Autorun writes `progress.json` at explicit points (story start, built, blocked, audit done) instead of the vague "after every step".

## 1.1.0 — 2026-10-07
- `/project-planning`: break a project into epics with paste-ready `/epic-planning` blocks, engineering review; tracker capture and optional autorun (plan only, or plan and build epic by epic).
- `/plan-review`: engineering-manager review of epic/story order against the code (collisions, migration order, contract breaks, parallel lanes). Runs automatically in both planners.
- `/user-story`: pre-build safety check using `/plan-review`'s checks (dependencies built, conflicting branches/PRs, contract or migration breaks); stops if the story will break something. Also checks sibling stories (built or not) that share code and decides which one owns the shared change.
- Epic order is a business-level best guess: the project review stays coarse and provisional, epic and story reviews report cross-epic findings, and plan-only autorun ends with a reconcile step showing what changed against the project plan.
- Adding new code to a shared file no longer counts as a collision; only changes to the same existing code do.
- Plan-and-build autorun runs `/code-audit` (duplication and dead code) after each epic and once across the whole project, so stories don't each write their own version of the same function.
- Autorun keeps a progress file in `plans/<slug>/` (`plan.md` plus `progress.json`, updated after every step), so a new session can resume from the next unbuilt story.
- Planners show only the summary (no duplicated working steps).
- Shared-code findings travel down the chain as a "Shares code with" line in each `/epic-planning` and `/user-story` block.
- `/epic-planning`: runs `/plan-review` before its summary; respects constraints, scope and settled decisions handed down from `/project-planning`; reuses an epic already created in the tracker; story blocks carry epic and dependencies; optional autorun builds stories through `/user-story` in build order.

## 1.0.0 — 2026-10-07
- dev-workflow plugin: `/epic-planning`, `/user-story`, `/code-audit`.
