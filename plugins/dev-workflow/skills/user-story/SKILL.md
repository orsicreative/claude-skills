---
name: "user-story"
description: Build a feature from a user story. Invoke manually with /user-story followed by the story text. Treats the story as an outcome to solve, not step-by-step instructions, and always reports assumptions and decisions at the end.
argument-hint: "As a user, I want to..."
---

The text after `/user-story` is a user story: $ARGUMENTS

Treat it as the outcome to achieve, not as implementation instructions. Choosing the solution is part of your job.

## Before building

1. Re-read CLAUDE.md. Its rules are hard constraints on whatever solution you pick.
2. Look at how similar things are already done in this codebase and follow those patterns.
3. If acceptance criteria were provided with the story (e.g. from /epic-planning), use them as the starting point: sharpen them against the code you just looked at, add any that are clearly missing, and note any you changed. Otherwise write 3-6 acceptance criteria that describe what must be true for the user. Either way: outcomes only, no implementation detail. Show them in a short list, then continue. Don't wait for approval.
4. Pick the simplest approach that satisfies those criteria and the CLAUDE.md rules.

## Ask first only when

- The ambiguity is expensive to undo (data model changes, migrations, permissions, anything touching shared or multi-user data).
- You'd need to add a dependency. Name it, say what it replaces, and wait for a yes.

Everything else: make a reasonable call, keep moving, and record it as an assumption.

## While building

- Stay inside the story. No extra features, no refactors of unrelated code.
- Keep the diff small and reviewable.
- Prefer what the platform already provides before writing custom code.
- If you are an AI agent executing this story and it builds a large new UI component or heavily reworks an existing one, use /frontend-design before building that UI. Moving or lightly adjusting existing components doesn't need it.

## When finished, always end with these three sections

**Assumptions** — every place the story was silent and you picked an answer. One line each, so I can say "no, the other way."

**Decisions worth a second look** — choices where a reasonable person might have gone differently, with a short why.

**Not done** — anything in the story you skipped, deferred, or only partly handled.

Then list the files you changed. Do not summarize what the code does line by line.
