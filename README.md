# orsicreative-skills

Claude Code plugin marketplace. One plugin, `dev-workflow`, with five skills that chain together (plan a project into epics, plan each epic into stories, check both plans against the code, build the stories, audit the result) and a standalone Core Web Vitals review.

## Install

```
/plugin marketplace add orsicreative/claude-skills
/plugin install dev-workflow@orsicreative-skills
```

## Skills

### `/project-planning <project>`
Top of the chain. Breaks a whole project into ordered epics (by capability, never by layer), each with scope boundaries, dependencies, release (MVP or later) and the project-wide constraints every epic must respect. Ends with one self-contained `/epic-planning` block per epic, ready to paste, post to a tracker (Jira, ClickUp, Linear), or autorun in the same session: plan every epic, or go epic by epic, planning each one and building its stories before planning the next against the real code. Plans only, writes no code.

```
/project-planning A client portal where customers manage their account, invoices and support tickets
```

### `/epic-planning <idea>`
Breaks one large idea into ordered, vertically sliced user stories, each with acceptance criteria and ready for `/user-story`. Reads CLAUDE.md and the codebase first, asks 2-4 questions that would change the plan's shape, and records everything else as assumptions. Accepts blocks from `/project-planning` and treats their constraints and settled decisions as given. Can autorun its stories through `/user-story` in build order, pausing whenever a story needs a yes, then runs `/code-audit` on the epic's changes to merge duplicated functions. Progress is kept in `plans/<slug>/` so a new session can resume where the last one stopped. Plans only, writes no code.

```
/epic-planning We need an invoice system that lets customers view and pay invoices
```

### `/plan-review [plan]`
Engineering-manager review of a project or epic plan against the real code. Finds where the planned order or parallel work will break things (two items touching the same file or table, migrations in the wrong order, contract changes, half-shipped states) and returns the smallest fix: reorder, add a dependency, move a change to one owner, add a flag, or split out enabling work. Every finding cites `file:line`. Runs automatically inside `/project-planning` and `/epic-planning`, and as a pre-build check in `/user-story`; run it yourself on any existing plan.

```
/plan-review the epic plan above
```

### `/user-story <story>`
Builds a feature from a user story, treating it as an outcome to reach rather than step-by-step instructions. Writes acceptance criteria (or sharpens ones from `/epic-planning`), follows existing patterns and CLAUDE.md rules, and keeps the diff small. Before building, re-checks that the story is still safe to build now (dependencies built, no sibling story or branch changing the same code, nothing left half-shipped) and stops if not. Asks first only for costly-to-undo decisions or new dependencies. Always ends by reporting assumptions and decisions.

```
/user-story As a customer, I want to download an invoice as PDF so I can file it
```

### `/code-audit [target]`
Line-by-line audit of a file, folder, PR or codebase. Works out what the code is *meant* to do, then fixes it toward that intent: bugs, security, performance, dead code, duplication, standards. Reports before touching anything, sorts fixes by risk, verifies as it goes, and ends with a coverage ledger. Say "audit only" to stop at the report. Also triggers on its own when you ask to review, harden or clean up code.

```
/code-audit src/billing
```

### `/core-web-vitals [target]`
Reviews front-end changes for LCP, CLS and INP. Uses the project's own budgets (`lighthouserc`, `budget.json`, bundle size limits, CLAUDE.md) when it has them, otherwise Google's "good" thresholds, and flags what a change adds even when the page total stays under budget. Prefers markup and CSS fixes over JS. Measures with Chrome DevTools MCP when a dev server or URL is available, otherwise reviews statically. Reports `file:line`, the metric hurt, why, and a fix in the project's conventions; it doesn't edit files unless asked. With no target it reviews the current diff. Also triggers on its own after image, above-the-fold, font, third-party script or interaction changes.

```
/core-web-vitals src/components/Hero.tsx
```
