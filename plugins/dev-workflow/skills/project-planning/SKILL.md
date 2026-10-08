---
name: "project-planning"
description: Break a whole project or product into ordered epics, each ready to refine with /epic-planning (which then produces stories for /user-story). Invoke manually with /project-planning followed by the project idea. Plans only; it does not build anything.
argument-hint: "A client portal where customers manage their account, invoices and support tickets"
disable-model-invocation: true
---

The text after `/project-planning` is a project: $ARGUMENTS

This is the top of a three-level chain: `/project-planning` makes epics, `/epic-planning` turns each epic into stories, `/user-story` builds each story. `/plan-review` checks the order against the code at every level. Your job is to turn the project into a short, ordered set of epics that can each be handed to `/epic-planning` on its own. You plan; you don't write code and you don't write stories. Decisions made here flow into every epic and every story below them, so put your effort into the epic boundaries, the order, and the project-wide rules.

## 1. Check it's a project

A project is several capabilities serving one product or goal ("a client portal: accounts, invoices, support"). If the input is really one capability ("customers can pay invoices"), say so and suggest `/epic-planning` instead. Rule of thumb: if the whole thing fits in one epic of 3-8 stories, it's an epic. If it bundles unrelated products, name them and offer to plan the first one. Don't refuse, and don't quietly merge them.

## 2. Understand what already exists

- Read CLAUDE.md. Its rules become project constraints (e.g. "server side first", "no new dependency without asking").
- Read the architecture doc, README, changelog and tech-debt notes if they exist.
- Look at the codebase: stack, hosting, auth, data stores, main areas of the app. Don't plan epics for capabilities that already work; plan the gaps. Use the project's real names for areas.
- No codebase (greenfield): say so in one line. The first epic will need to stand the project up (see step 6).

## 3. Ask the expensive questions first

A wrong guess here spreads into every epic and every story. Ask 3-5 sharp questions, only about things that would change which epics exist or their order:

- Who the users and roles are, and what each can see or do
- Where the first release ends (what's the MVP, what's later)
- Hard constraints: stack, hosting, budget, compliance (GDPR, PCI, HIPAA), deadlines
- Third-party systems to integrate with or choose (payments, email, auth provider, CMS)
- What already exists outside the code (existing data to migrate, a current system to replace)

Make a reasonable call on everything else and record it as an assumption. If the person said to just go, skip the questions and list your answers as assumptions.

## 4. Write the project

- **Project:** one line naming it.
- **Goal:** one or two sentences on the outcome for users and the business.
- **Success criteria:** 2-5 outcome-level statements that are true when the project is done ("customers resolve billing questions without emailing support").
- **Project constraints:** filled in during step 5.

## 5. Look at it from every angle

Walk the project through each perspective that applies:

- **Users and roles:** each role's main journeys from first visit to the thing they came to do. Journeys usually reveal the epics.
- **Admin, staff and support:** who creates, manages and fixes the data the users see.
- **Security, privacy, compliance:** authentication, who can see whose data, sensitive fields, audit trails, consent, retention.
- **Data:** the main entities and who owns them, migration from an existing system, backups.
- **Integrations:** payments, email, analytics, external APIs.
- **Quality bars:** performance targets (e.g. Core Web Vitals), accessibility, devices, languages.
- **Running it:** deployment, environments, monitoring, error reporting, notifications.

Then put each concern in one place:

- **A rule every epic must respect** ("users only ever see their own organisation's data", "all pages render server-side", "WCAG 2.2 AA") → a **project constraint**. Don't make it its own epic: epic 1 would ship without it.
- **A capability with its own outcome** (admin user management, data migration, notifications) → its own epic.
- **Something deliberately not done now** → project-level Out of scope, so it's a decision, not an omission.

## 6. Slice into epics

An epic is one coherent capability for one goal, delivering something a user can see or do, that `/epic-planning` can break into 3-8 stories. Slice by capability or user journey. Never slice by layer or technology ("backend epic", "database epic", "frontend epic"): those can't be demoed alone and force every story into an artificial split.

**Greenfield projects:** make epic 1 a walking skeleton, the thinnest end-to-end version that a real user can reach on the real hosting ("a visitor can sign up, log in and see an empty dashboard on the live site"). It carries the setup work (repo, hosting, deploy, auth if needed) while still being a user-visible slice. Later epics build on real infrastructure instead of assuming it.

Good epics for "client portal: accounts, invoices, support" (existing site, no portal yet):
1. Customer accounts: customers can sign in and manage their profile.
2. Invoices: customers can view and pay their invoices.
3. Support tickets: customers can raise and follow support tickets.
4. Staff console: staff can find a customer and see their invoices and tickets.
5. Notifications: customers get emails when an invoice is due or a ticket is answered.

For each epic write:

- **Epic:** name and a one-sentence goal.
- **In scope:** 2-5 bullets of what it covers, as outcomes.
- **Out of scope:** things a reader might expect here but another epic owns ("invoice emails: Notifications epic") or that the project defers. Clear boundaries stop two epics from planning the same story.
- **Depends on:** earlier epic numbers, or none.
- **Release:** MVP or later (or the milestone names the person uses).
- **Flags:** any of `data model`, `migration`, `new dependency`, `permissions`, `third-party`, `compliance`. These tell `/epic-planning` where its expensive questions will be.
- **Settled decisions:** answers from step 3 and assumptions from this plan that this epic relies on, so `/epic-planning` doesn't ask them again.

Aim for 3-10 epics. Past 10, the project probably has more than one release; say so and suggest where to cut. Order epics so each builds on what's already shipped, foundational and riskiest first, MVP before later. Plan every epic fully now, even the last one: what each epic covers is decided up front, and only the build order is left to work out. Aim for epics that don't cross. Where two epics would change the same existing code, one blocks the other, so make it a dependency. At this level that's a business-level best guess: real overlaps often only show up when the stories are planned. Treat the epic order as provisional until then (see the reconcile in step 10).

## 7. Engineering review

Before showing the plan, review it as the engineering manager would: read `../plan-review/SKILL.md` (relative to this skill's base directory) and follow it against this plan and the codebase. At project level keep the review coarse: shared data, shared screens or components, cross-cutting rules. File-level detail belongs to each epic's own review. Apply its plan changes, then show its verdict, findings and a provisional build order in an **Engineering review** section right after the epic table. If it found nothing, one line saying so is enough.

## 8. Summary

Steps 4-7 are your working. Don't print them separately; their results go in the summary. Show the person a short "What exists" note (step 2), the questions (step 3), then the full plan in this shape:

**Project:** name — goal
**Success criteria:** bulleted list
**Project constraints:** rules every epic must respect

| # | Epic | Depends on | Release | Flags |
|---|------|-----------|---------|-------|

Then, for each epic, a ready-to-paste block. Each block must stand on its own, because it may be pasted into a tracker or a fresh session with no other context:

```
/epic-planning Invoices: customers can view and pay their invoices in the portal.
Project: Client portal — customers manage their account, invoices and support without contacting us.
Project constraints:
- Customers only ever see their own organisation's data.
- Pages render server-side; JavaScript only enhances.
In scope:
- Customers see a list of their invoices and open one.
- Customers pay an open invoice online.
Out of scope:
- Invoice due emails (Notifications epic).
- Staff editing invoices (Staff console epic).
Depends on: Customer accounts (epic 1), assume it is built.
Settled decisions:
- Payments through Stripe.
Flags: third-party, permissions
Shares code with: Staff console (epic 4), both read invoices through the same billing queries. This epic owns those queries and blocks Staff console, which builds on them.
```

Include a "Shares code with" line only when the engineering review found shared code, naming the other epic, the code, and which one blocks the other. One line can name several epics. The blocked epic also lists the blocker under Depends on.

**Assumptions** — every place the project was silent and you picked an answer, one line each so the person can say "no, the other way."

**Out of scope** — what the whole project deliberately doesn't cover.

**Risks and open questions** — things that could change the plan later (an unchosen vendor, an unknown data volume).

## 9. Refine, then capture

After the summary, ask: "Want to refine anything, or is it ready to capture?"

- **Refine:** apply changes and show the updated summary. Repeat until they're happy.
- **Ready:** check which planning integrations are connected (e.g. Jira, ClickUp, Linear). If one or more are, ask which to use and where. Create a project-level container if the tool has one (Jira initiative or parent, ClickUp folder or list, Linear project), then one epic per plan epic, in order, with the epic's paste block as its description and dependencies linked. Report back with links.
- **No tracker, or they don't want one:** ask how they want it kept (a markdown file in the repo, a doc, or left in the chat) and do that.

Never post or write anything without that explicit go-ahead.

## 10. Offer to plan (and build) the epics

Once captured, offer two ways forward:

- **Paste manually:** they run each block through `/epic-planning` themselves.
- **Autorun:** you work through some or all epics now, in order. Read `../epic-planning/SKILL.md` (relative to this skill's base directory) and follow it for each epic, using that epic's block as its input. Keep its questions to things the block didn't settle. When running through to the end, skip each epic's own refine and capture questions: use the capture choice already made here, and leave refining to the end. If the epics went into a tracker, put each epic's stories under the epic already created there instead of creating a new one. Before starting, ask both questions at once: whether to stop for review after each epic or run through to the end, and which depth they want:
  - **Plan only (default):** plan every epic into stories, in build order. Later epics aren't guesses: each one plans against the scope and boundaries of the epics that block it, so assume that planned work exists. `/user-story`'s pre-build check catches anything the real builds changed.
  - **Plan and build:** plan every epic into stories first, then build epic by epic in build order using `/epic-planning`'s autorun step. An epic starts only when the epics blocking it are fully built, including its own code audit (see `/epic-planning` step 10). When every epic is built, run `../code-audit/SKILL.md` once more across everything the project changed, to catch duplicates between epics that no single epic's audit could see. Ask its build questions (review stops, commits, progress file) once for the whole run, not per epic. The progress file lives in `plans/<project-slug>/` and covers every epic. To resume a project, read it and continue from `next`, as `/epic-planning` step 10 describes. If a story's pre-build check stops on a cross-epic finding, pause the run and reconcile (below) before going on.

  When every epic is planned, **reconcile**. Collect the cross-epic findings from every epic's engineering review. Update the epic dependencies, scope boundaries and epic blocks to match. Show what changed against the project plan, one line each ("Epic 3 now also depends on epic 2: both change the review status query"), or say nothing changed. This includes story criteria in epics already planned. Show only the changed lines of each block, not full reprints. Then end with the **full build order**: epics in sequence, with each epic's story order inside it, e.g. "Epic 1: 1 → 2 → (3 ∥ 4) | Epic 2: 1 → 2 → 3", or with epics in parallel "Epic 1: 1 → 2 → 3 | then (Epic 2: 1 → 2 ∥ Epic 3: 1 → 2 → 3)". If the epics are in a tracker, ask before updating them there.

Either way, nothing gets posted or written without explicit approval.
