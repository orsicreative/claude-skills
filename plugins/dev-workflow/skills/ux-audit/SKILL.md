---
name: "ux-audit"
description: Review web front-end UI (pages, components, flows, templates, CSS, screenshots) against established UX laws (choice overload, chunking, cognitive load, Doherty threshold, Fitts's law, Hick's law, Jakob's law, common region, serial position effect) and return prioritized fixes. Use after building or changing a page layout, navigation, form, checkout or sign-up flow, product or pricing listing, settings screen, or loading and feedback states, and as a pre-merge UX check. Also use when the user asks "is this usable?", "is this too cluttered?", "why are users dropping off here?", or about layout, grouping, number of options or feedback. Invoke manually with /ux-audit and an optional file, folder or URL. Not for accessibility (use /accessibility-audit), performance (use /core-web-vitals) or visual style.
argument-hint: "src/pages/Checkout.tsx, a preview URL, or empty for the current diff"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*), mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__new_page, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__click, mcp__chrome-devtools__resize_page, mcp__chrome-devtools__evaluate_script
---

Audit target: $ARGUMENTS (if empty, whatever the user or calling skill named in the conversation; failing that, the uncommitted changes on the current branch; if there are none, ask what to audit instead of guessing)

# UX audit

Review front-end UI against the UX laws in [references/laws.md](references/laws.md). Read that file before auditing. Every finding cites the law it breaks.

UX laws are heuristics, not pass/fail rules. A finding says what the user will struggle with and why, not that a rule was broken. When a deviation looks deliberate (a product decision, a brand choice, a tested variant), report it as a question, not a defect.

Prefer the smallest change that removes the friction: reorder, regroup, relabel or remove before adding new UI, and markup and CSS before JS.

This is an audit, not a fix pass. Report findings and fixes; don't edit files unless the user asks you to apply them.

## 1. Scope

- No target given: audit the change. Run `git status`, `git diff` and `git diff --staged`. If nothing has changed, ask what to audit.
- When the target is a diff, judge what the change introduces. Pre-existing problems on the touched screens go in a separate "Already present" list, not blamed on the change.
- A file or folder given: read it in full, plus whatever decides what the user actually sees: the parent layout or template, sibling components on the same screen, and the stylesheet for its states (hover, pressed, loading, empty, error).
- A URL given: review it live (step 4) and trace findings back to source if the code is in the repo.
- A flow (checkout, sign-up, onboarding) is audited as a whole: every step, plus what happens between them.
- Don't audit the whole site unless asked.

Templates and components branch. Props, feature flags, CMS settings and data volume change what renders. Audit the states that ship: empty, one item, many items, loading, error and success.

## 2. Find the project's bar

Before auditing, read what the project already decided: CLAUDE.md, contributing docs, the design system or component library, UX guidelines, and the epic or story that produced the change (acceptance criteria often state the intended flow). Report which sources you used.

- If the design system has a pattern for this (card, stepper, empty state, skeleton, toast), flag hand-rolled versions and point to the shared one.
- House rules override the general heuristics. If the project says "max three tiers on pricing pages", that is the bar.
- If analytics or research findings are in the repo or the conversation (drop-off rates, session recordings, test results), use them to rank findings. Never invent them.

## 3. Match the screen to the laws

Not every law applies to every screen. Start with the ones that fit what changed:

| What changed | Check first |
|---|---|
| Navigation, menus, option sets, pricing, catalogs, filters | Choice overload, Hick's law, serial position effect |
| Forms, settings, long content, dashboards | Chunking, cognitive load, common region |
| Checkout, sign-up, onboarding, any multi-step flow | Cognitive load, Hick's law, Doherty threshold |
| Buttons, actions, cards, mobile layouts | Fitts's law |
| Submits, async actions, loading, navigation | Doherty threshold |
| Headers, footers, account, cart, search, common controls | Jakob's law, serial position effect |
| Layout, spacing, cards, grouping | Common region, chunking |

Then skim the rest of the laws for anything obvious. Don't report a law just to cover it.

## 4. Review live when you can

Layout, grouping and visual weight are hard to judge from code alone. When Chrome DevTools MCP is available and there is a running dev server, preview or production URL:

- `take_screenshot` at desktop width and, with `resize_page`, at a phone width. Judge grouping, hierarchy and what draws the eye first.
- `click` through the changed flow. Note every action that gives no visible feedback, and every step that asks the user to remember something from a previous one.
- `evaluate_script` to time how long an action takes to show feedback, when response time is in question. Report the number, not an impression.
- `take_snapshot` to count options or links in a menu or list when the count matters.

If there is no live target, say so and review statically from the markup, styles and component structure. Mark anything that depends on how the screen actually looks or feels as **needs live review** rather than reporting it as checked. Never invent results.

## 5. Stay in your lane

Some laws touch areas other skills own. Report the UX problem here and point to the other skill for the measured part, so findings aren't duplicated:

- Target size and spacing minimums, heading markup, contrast of boundaries: `/accessibility-audit`.
- Response time, INP, slow handlers, layout shift: `/core-web-vitals`.
- Colors, type, visual style and brand: out of scope unless they break a law (e.g. everything the same weight, so nothing reads as primary).

## Output

```markdown
## UX audit: [target]
**Bar:** UX laws [+ house rules from: sources] | **Mode:** [static, or live <URL>]

**Issues:** [X] | High [X] | Medium [X] | Low [X] | Question [X]

### Findings
| # | Where | What the user struggles with | Law | Severity | Fix |
|---|-------|------------------------------|-----|----------|-----|
| 1 | `file:line` or screen | [Problem, from the user's side] | Hick's law | High | [Fix, in project conventions] |

### Questions (possibly deliberate)
- [`file:line`, what deviates from the law, and what would justify keeping it]

### Already present (not introduced by this change)
- [`file:line`, issue, law]

### Needs live review
- [What, and why static review can't settle it]

### For other audits
- [Finding that belongs to /accessibility-audit or /core-web-vitals, one line each]
```

Severity: **High** is likely to make users abandon or fail the task (can't decide, can't find the action, think it didn't work). **Medium** slows users down or causes errors they can recover from. **Low** is friction or polish. **Question** is a deviation that may be deliberate. Sort by severity, then by how central the screen is to the product's main task (checkout and sign-up before settings). Omit sections that have nothing in them. Skip praise and don't restate the file's contents. If nothing is wrong, say so in one line and list what still needs live review.

Fixes stay scoped to the reviewed screens. If a fix changes a shared component's behavior or a flow other teams own, say so and route it through the project's approval rules instead of treating it as a local tweak.
