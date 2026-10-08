# orsicreative-skills

Claude Code plugin marketplace with two plugins:

- `dev-workflow`: five skills that chain together. Plan a project into epics, plan each epic into stories, check both plans against the code, build the stories, audit the result.
- `shopify-theme`: review skills for the Stardust Shopify theme.

## Install

```
/plugin marketplace add orsicreative/claude-skills
/plugin install dev-workflow@orsicreative-skills
/plugin install shopify-theme@orsicreative-skills
```

## dev-workflow skills

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

## shopify-theme skills

### `/core-web-vitals [target]`
Reviews Liquid sections, JS modules or asset changes in the Stardust theme for Core Web Vitals, checking CLS first (the error-level gate in `lighthouserc.js`), then LCP, then TBT. Prefers CSS, HTML and server-rendered Liquid over JS fixes. If Chrome DevTools MCP and a preview URL are available it measures real numbers, otherwise it reviews statically. Reports `file:line`, the metric hurt, why, and a fix in house style; it doesn't edit files unless asked. With no target it reviews the current diff. It also triggers on its own after above-the-fold, image or dynamic-content changes.

```
/core-web-vitals sections/main-product.liquid
```
