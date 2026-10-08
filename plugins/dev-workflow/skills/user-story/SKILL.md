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
5. Check it's safe to build now. The plan was made before the code you're about to touch existed in its current form, so re-check it at the last moment. Run the checks in section 3 of `../plan-review/SKILL.md` (relative to this skill's base directory) for this one story. If that file isn't available, these are the minimum:
   - Are the stories it depends on (its "Depends on" line) actually built?
   - Does other work touch the same code? Look at sibling stories in the same epic (a "Shares code with" line, the epic plan, or the tracker), whether built, in progress or not started yet, and at other branches and open PRs (`git branch`, `gh pr list` if available). Two separate stories often change the same code (emailing an invoice and marking it paid both touch invoice status). Decide which one owns the shared change. Build only what this story needs, shaped so the other story can extend it instead of rewriting it.
   - Would shipping this story on its own break a contract, need a migration in a set order, or leave the app half-changed or unsafe?

   If something will break, stop and say what, with the `file:line`. Fixing it changes the plan (reorder, add a dependency, add a flag), and that's the person's call. If the collision is with another epic's work, call it a cross-epic finding: the epic order or boundaries need another look in the project plan, not a workaround inside this story. Risks you can handle inside the story (a compatibility step, a test around untested code) go into your approach and get noted under Decisions.

## Ask first only when

- The ambiguity is expensive to undo (data model changes, migrations, permissions, anything touching shared or multi-user data).
- You'd need to add a dependency. Name it, say what it replaces, and wait for a yes.

Everything else: make a reasonable call, keep moving, and record it as an assumption.

## While building

- Stay inside the story. No extra features, no refactors of unrelated code.
- Keep the diff small and reviewable.
- Prefer what the platform already provides before writing custom code.
- If you are an AI agent, invoke the `frontend-design` skill with the Skill tool (not by reading a file) before building UI when any of these hold: the story carries the `frontend-design` flag; it builds a large new UI component or heavily reworks an existing one; or the app has no established visual design yet (new project, default or unstyled markup), in which case this story sets the visual direction the rest follow. Moving or lightly adjusting existing components doesn't need it. If a design direction was already set (e.g. a "Design direction" section in the run's `plan.md`), follow it instead of inventing a new one.

## When finished, always end with these three sections

**Assumptions** — every place the story was silent and you picked an answer. One line each, so I can say "no, the other way."

**Decisions worth a second look** — choices where a reasonable person might have gone differently, with a short why.

**Not done** — anything in the story you skipped, deferred, or only partly handled.

Then list the files you changed. Do not summarize what the code does line by line.
