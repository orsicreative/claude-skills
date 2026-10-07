# orsicreative-skills

Claude Code plugin marketplace. One plugin, `dev-workflow`, with three skills that chain together: plan an epic, build its stories, audit the result.

## Install

```
/plugin marketplace add orsicreative/claude-skills
/plugin install dev-workflow@orsicreative-skills
```

## Skills

### `/epic-planning <idea>`
Breaks one large idea into ordered, vertically sliced user stories, each with acceptance criteria and ready for `/user-story`. Reads CLAUDE.md and the codebase first, asks 2-4 questions that would change the plan's shape, and records everything else as assumptions. Plans only, writes no code.

```
/epic-planning We need an invoice system that lets customers view and pay invoices
```

### `/user-story <story>`
Builds a feature from a user story, treating it as an outcome to reach rather than step-by-step instructions. Writes acceptance criteria (or sharpens ones from `/epic-planning`), follows existing patterns and CLAUDE.md rules, and keeps the diff small. Asks first only for costly-to-undo decisions or new dependencies. Always ends by reporting assumptions and decisions.

```
/user-story As a customer, I want to download an invoice as PDF so I can file it
```

### `/code-audit [target]`
Line-by-line audit of a file, folder, PR or codebase. Works out what the code is *meant* to do, then fixes it toward that intent: bugs, security, performance, dead code, duplication, standards. Reports before touching anything, sorts fixes by risk, verifies as it goes, and ends with a coverage ledger. Say "audit only" to stop at the report. Also triggers on its own when you ask to review, harden or clean up code.

```
/code-audit src/billing
```
