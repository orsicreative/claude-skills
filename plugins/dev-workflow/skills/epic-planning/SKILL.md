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

## 2. Understand what already exists

- Read CLAUDE.md. Its rules constrain how stories are worded (e.g. if it says server-side first, don't write stories that imply client-heavy solutions).
- Look at the codebase for what this epic touches: existing models, routes, pages, components, auth. Don't plan stories for things that already work, and use the project's real names for places ("billing panel", not "a page").
- If there's no codebase available, say so in one line and plan from the idea alone.

## 3. Ask the expensive questions first

At epic level, a wrong guess spreads into every story, so ask before slicing. Ask 2-4 sharp questions, only about things that would change the shape of the plan:

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

## 7. Summary

End with the full plan in this shape:

**Epic:** name — goal
**Epic acceptance criteria:** bulleted list
**Epic constraints:** cross-cutting rules every story must respect (security, privacy, data)

| # | Story | Depends on | Flags |
|---|-------|-----------|-------|

Then, for each story, a ready-to-paste block:

```
/user-story As a customer, I want to see my invoices in my billing panel, so that I know what I owe.
Acceptance criteria:
- ...
- ...
[If frontend-design flagged:] If you are an AI agent executing this story, use /frontend-design for the new invoice list UI.
```

**Assumptions** — every place the epic was silent and you picked an answer, one line each so the person can say "no, the other way."

**Out of scope** — things the epic touches but this plan deliberately doesn't cover (e.g. admin invoice creation).

## 8. Refine, then post

After the summary, ask: "Want to refine anything, or is it ready to post?"

- **Refine:** apply changes and show the updated summary. Repeat until they're happy.
- **Ready:** check which planning integrations are connected (e.g. Jira, ClickUp, Linear). If one or more are, ask which to use and which project/board/list, then create the epic and its stories as children, in order, with story text, acceptance criteria, flags and dependencies linked. Report back with links to what was created.
- **None connected, or they don't want a tracker:** ask how they want the plan kept (e.g. a markdown file in the repo, a doc, or just left in the chat) and do that.

Never post or write anything without that explicit go-ahead.
