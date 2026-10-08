---
name: "epic-planning"
description: Break one large idea (an epic) into ordered, vertically sliced user stories ready to build with /user-story. Invoke manually with /epic-planning followed by a single idea. Plans only; it does not build anything.
argument-hint: "We need an invoice system that lets customers view and pay invoices"
disable-model-invocation: true
---

The text after `/epic-planning` is one epic: $ARGUMENTS

Your job is to turn it into a short, ordered set of user stories that can each be handed to `/user-story` and built on their own. You plan; you don't write code. A planning mistake here spreads into every story, so spend your effort on getting the slices and the open questions right.

## 1. Check it's one epic

An epic is one coherent capability for one goal ("customers can view and pay invoices"). If the input bundles separate capabilities ("build invoicing and then a wishlist"), say so, name the separate epics you see, and offer to plan the first one. Don't refuse, and don't quietly merge them into one plan.

## Input from /project-planning

If the epic came from `/project-planning`, it carries project constraints, in/out of scope, dependencies, settled decisions and flags. Treat them as decided upstream:

- Copy project constraints straight into your epic constraints.
- Don't re-ask settled decisions. Ask only what the block leaves open.
- Stay inside the scope boundary. Work listed as owned by another epic isn't yours to plan.
- Assume the epics it depends on are built as planned: their in-scope outcomes exist, even if the code doesn't yet.
- A "Shares code with" line means another epic changes the same code and one blocks the other. Plan the stories that touch that code to build on what the blocking epic delivers, not to redo it.
- The project's epic boundaries are a business-level best guess. If your engineering review finds this epic colliding with another epic's code in a way the project plan missed, don't work around it inside this epic. Report it under **Cross-epic findings** so the project plan can be updated.
- If something handed down looks wrong against the code, say so in Assumptions rather than silently changing it.

## 2. Understand what already exists

- Read CLAUDE.md. Its rules constrain how stories are worded (e.g. if it says server-side first, don't write stories that imply client-heavy solutions).
- Look at the codebase for what this epic touches: existing models, routes, pages, components, auth. Don't plan stories for things that already work, and use the project's real names for places ("billing panel", not "a page").
- If there's no codebase available, say so in one line and plan from the idea alone.

## 3. Ask the expensive questions first

At epic level, a wrong guess spreads into every story, so ask before slicing. Ask up to 4 sharp questions, only about things that would change the shape of the plan. If everything that matters is already settled (e.g. by a `/project-planning` block), ask none and say so:

- Who the users/roles are and who can see what (permissions, multi-user data)
- Data model or ownership decisions
- Third-party choices (payment provider, email service) or new dependencies
- Scope boundaries (customer side only, or admin side too?)

Everything else: make a reasonable call and record it as an assumption. If the person has said to just go, skip the questions and list your answers as assumptions instead.

## 4. Write the epic

- **Epic:** one line naming the capability.
- **Goal:** one or two sentences on the outcome for the user.
- **Epic acceptance criteria:** 2-4 outcome-level statements that are true when the whole epic is done. Stay high-level here ("customers can find and pay any open invoice without contacting support").
- **Epic constraints:** filled in during step 5.

## 5. Look at it from every angle

Before slicing, walk the epic through each perspective that applies and note what each one needs:

- **Primary user** (e.g. customer): what they see and do.
- **Other roles**: admins, staff, support. Who creates, edits or manages this data? (If out of scope, list it under Out of scope rather than dropping it silently.)
- **Security and privacy**: who may see what, data ownership, sensitive fields, encryption, audit needs.
- **Data and operations**: migrating or backfilling existing data, retention, jobs, notifications, failure and edge cases (failed payment, duplicate submit).
- **Developer/maintainer**: observability, testability, constraints from CLAUDE.md.

Then decide where each concern goes:

- **A rule every story must respect** (e.g. "a customer can only access their own invoices", "invoice data encrypted at rest") → an **epic constraint**, AND an acceptance criterion on each story it touches. Don't make it a separate later story: story 1 would ship without it, and an access-control gap is exactly the kind of thing that must never ship even briefly.
- **Standalone work with its own result** (audit log of invoice access, backfilling existing invoices, a reminder job) → its own story, often written from a non-customer angle ("As a support agent…", "As the business…"). Use "As a developer" only when no user or business role fits.

## 6. Slice into stories

Slice **vertically**: every story delivers something a user can see or do, end to end, and could be demoed alone. Never slice by layer ("build the data model", "build the API", "build the UI"). Layer slices can't be tested on their own and fight /user-story's "stay inside the story" rule. The first story will usually carry the data model it needs; that's expected.

Good slices for "customers can view and pay invoices":
1. As a customer, I can see a list of my invoices in my billing panel.
2. As a customer, I can open an invoice and see its line items.
3. As a customer, I can pay an open invoice.
4. As a customer, I get a confirmation after paying.
5. As a customer, overdue invoices are clearly flagged.

For each story write:

- **Story:** "As a ___, I want ___, so that ___", made specific to this project (real page/feature names). This is where you refine the epic's intent into the codebase.
- **Acceptance criteria:** 2-4 concrete, testable outcomes. No implementation detail. Make sure criteria don't overlap between stories; if two stories would both build the same view, one owns it.
- **Depends on:** earlier story numbers, or none.
- **Flags:** any of `data model`, `migration`, `new dependency`, `permissions`, `frontend-design`. The first four are the things /user-story will stop and ask about, so flagging them now sets expectations. Flag `frontend-design` when the story builds a large new UI component or heavily reworks an existing one. Moving or lightly adjusting existing components doesn't qualify.

Aim for 3-8 stories. If you get past 8, the epic is probably two epics; say so and suggest where to split. Order stories so each one builds on what's already shipped, with the riskiest or most foundational first.

## 7. Engineering review

Before showing the plan, review it as the engineering manager would: read `../plan-review/SKILL.md` (relative to this skill's base directory) and follow it against this plan and the codebase. Apply its plan changes, then show its verdict, findings and build order in an **Engineering review** section right after the story table. If it found nothing, one line saying so is enough.

## 8. Summary

Steps 4-7 are your working. Don't print them separately; their results go in the summary. Show the person a short "What exists" note (step 2), the questions (step 3), then the full plan in this shape:

**Epic:** name — goal
**Epic acceptance criteria:** bulleted list
**Epic constraints:** cross-cutting rules every story must respect (security, privacy, data)

| # | Story | Depends on | Flags |
|---|-------|-----------|-------|

Then, for each story, a ready-to-paste block:

```
/user-story As a customer, I want to see my invoices in my billing panel, so that I know what I owe.
Epic: Invoices (story 1 of 5)
Depends on: none
Acceptance criteria:
- ...
- ...
[If the engineering review found shared code:] Shares code with story 4 (mark invoice as paid): both change invoice status handling in src/invoices.ts. Build after story 4, or this story owns that change and story 4 builds on it.
[If frontend-design flagged:] If you are an AI agent executing this story, use /frontend-design for the new invoice list UI.
```

**Assumptions** — every place the epic was silent and you picked an answer, one line each so the person can say "no, the other way."

**Out of scope** — things the epic touches but this plan deliberately doesn't cover (e.g. admin invoice creation).

**Cross-epic findings** (only if the review found any) — collisions with other epics' code the project plan didn't account for, each with the change it suggests to the project plan (a new dependency between epics, or moving work to the epic that owns that code).

## 9. Refine, then post

After the summary, ask: "Want to refine anything, or is it ready to post?"

- **Refine:** apply changes and show the updated summary. Repeat until they're happy.
- **Ready:** check which planning integrations are connected (e.g. Jira, ClickUp, Linear). If one or more are, ask which to use and which project/board/list, then create the epic (or reuse it if `/project-planning` already created it) and its stories as children, in order, with story text, acceptance criteria, flags and dependencies linked. Report back with links to what was created.
- **None connected, or they don't want a tracker:** ask how they want the plan kept (e.g. a markdown file in the repo, a doc, or just left in the chat) and do that.

Never post or write anything without that explicit go-ahead.

## 10. Offer to build the stories

Once posted, offer two ways forward:

- **One at a time (default):** they paste each block into `/user-story` when they're ready.
- **Autorun:** you build the stories now, following the engineering review's build order. Read `../user-story/SKILL.md` (relative to this skill's base directory) and follow it for each story, using that story's block as its input. Before starting, ask once:
  - Stop for review after each story, or run through and review at the end?
  - Commit after each story (on a branch, one commit per story), or leave all changes uncommitted?
  - Keep a progress file at `plans/<epic-slug>/` (the default), so the run can be resumed if the session ends?

  Build one story at a time, even where the build order allows parallel work, so each story's safety check sees the code the previous one left. When `/user-story` stops (its safety check finds a break, or it needs a yes on a data model change, migration, permission or new dependency), autorun pauses there and asks. It never skips past. If the stories are in a tracker, move each one along as it's built.

  Each story is built with its attention on its own block, and over a long run earlier work drops out of context, so stories drift into writing similar helpers, queries or views. When all the epic's stories are built, read `../code-audit/SKILL.md` and run it on everything this epic changed (the epic's diff plus the code it calls), focused on duplication and dead code. Apply its PRESERVING fixes (merging duplicates into one shared function, removing code nothing uses), verify, and commit them separately if commits are on. Its AMBIGUOUS items go in the final report, not into silent changes.

  **Progress file.** Unless they said no, keep two files in `plans/<epic-slug>/` (when run from `/project-planning`, use the project's folder):
  - `plan.md`: the approved plan, exactly as shown, with every paste block. Written once at the start and rewritten only when the plan changes (a reconcile, a refine).
  - `progress.json`: the run's state, updated after every step, before moving on:
    ```json
    {
      "settings": { "reviewStops": "end", "commits": true, "branch": "reviews" },
      "epics": [
        { "id": 1, "name": "Write a review", "status": "built", "audit": "done",
          "stories": [ { "id": 1, "status": "built", "commit": "a1b2c3d" },
                       { "id": 2, "status": "blocked", "note": "needs a yes on the migration" } ] }
      ],
      "next": { "epic": 1, "story": 2 }
    }
    ```
    Statuses: `planned`, `building`, `built`, `blocked` (with a note saying why). `audit` is `pending` or `done`.

  **Resuming.** If the person asks to resume, or `plans/` already has a run for this epic or project, read `plan.md` and `progress.json` instead of re-planning. Check `progress.json` against the code: are the commits there, and is the branch checked out? Say where the run stopped and anything that doesn't match, then continue from `next`. The pre-build check of the next story catches anything that changed in between.

  End with one combined report: each story's Assumptions, Decisions worth a second look and Not done, plus the files changed and the audit's findings.
