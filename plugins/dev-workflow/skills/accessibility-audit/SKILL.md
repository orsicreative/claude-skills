---
name: "accessibility-audit"
description: Audit web front-end code (HTML, templates, components, CSS, client JS) against WCAG 2.2 AA and return prioritized fixes. Use after building or changing interactive UI (buttons, forms, menus, dialogs, drawers, carousels, filters), color or typography, focus styles, or media, and as a pre-merge accessibility check. Also use when the user asks "is this accessible?", "check a11y", or about contrast, keyboard navigation, touch target size or screen reader behavior. Invoke manually with /accessibility-audit and an optional file, folder or URL. Not for performance (use /core-web-vitals) or functional bugs.
argument-hint: "src/components/Modal.tsx, a preview URL, or empty for the current diff"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*), mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__new_page, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__lighthouse_audit, mcp__chrome-devtools__press_key, mcp__chrome-devtools__click, mcp__chrome-devtools__resize_page, mcp__chrome-devtools__evaluate_script
---

Audit target: $ARGUMENTS (if empty, whatever the user or calling skill named in the conversation; failing that, the uncommitted changes on the current branch; if there are none, ask what to audit instead of guessing)

# Accessibility audit

Audit front-end code for WCAG 2.2 AA. Criteria new in 2.2 are marked **(2.2)**. 4.1.1 Parsing was removed in 2.2. Don't cite it.

Prefer the cheapest layer that fixes the problem: native HTML elements and attributes first, then CSS, then ARIA, then JS. A real `<button>`, `<dialog>`, `<details>` or `<label>` beats a `<div>` with ARIA and handlers. ARIA that repeats or contradicts native semantics is itself a finding.

This is an audit, not a fix pass. Report findings and fixes; don't edit files unless the user asks you to apply them.

## 1. Scope

- No target given: audit the change. Run `git status`, `git diff` and `git diff --staged`. If nothing has changed, ask what to audit.
- When the target is a diff, judge what the change introduces. Pre-existing problems in the touched files go in a separate "Already present" list, not blamed on the change.
- A file or folder given: read it in full, plus whatever decides what it renders and how it behaves: the parent layout or template, the JS module that wires it up, and the stylesheet for its states.
- A URL given: test it live (step 4) and trace findings back to source if the code is in the repo.
- Don't audit the whole site unless asked.

Templates and components branch. Conditionals, feature flags, props and CMS or admin settings change what actually renders. Audit the branches that ship, not only the default one.

## 2. Find the project's bar

Before auditing, read the project's rules: CLAUDE.md, contributing docs, the design system or component library, and lint config (`eslint-plugin-jsx-a11y`, `axe`, `pa11y`, `lighthouserc.*` accessibility assertions, CI a11y steps). Report which sources you used.

- If the project has a sanctioned component for a pattern (dialog, drawer, menu, tabs, combobox, focus trap), flag hand-rolled versions of it and point to the shared one.
- If CI gates on an accessibility score or rule set, say which findings would move that score or fail that rule, and rank error-level ones first within their severity.
- House rules stricter than WCAG (e.g. 44×44 targets instead of 24×24) are the bar for this project. Say when a finding fails the house rule but passes WCAG.

## 3. Checklist

### Perceivable
- **1.1.1 Non-text content.** Meaningful images have alt text that says what the image conveys. Decorative images have `alt=""`; decorative inline SVGs and icon fonts have `aria-hidden="true"`. Check image helpers and components for an alt prop that is missing or defaulted to the filename.
- **1.3.1 Info and relationships.** Structure is in the markup: real heading levels in order, lists as `<ul>`/`<ol>`, tables with `<th>` and `scope`, landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`), form groups in `<fieldset>`/`<legend>`.
- **1.3.5 Identify input purpose.** Personal-data inputs have the right `autocomplete` token.
- **1.4.1 Use of color.** Color isn't the only signal (errors, required fields, sale prices, selected states, links in body text).
- **1.4.3 Contrast.** ≥ 4.5:1 for normal text, ≥ 3:1 for large text (24px, or 18.66px bold). Include placeholder text, controls that look disabled but are active, and text over images or video. Exempt: truly disabled controls, pure decoration, logos.
- **1.4.10 Reflow / 1.4.4 Resize text.** Works at 320 CSS px wide and 200% zoom: no fixed heights on text containers, no `overflow: hidden` clipping text, no absolute positioning that overlaps when text grows, no horizontal scroll for body content.
- **1.4.11 Non-text contrast.** ≥ 3:1 for control boundaries, focus indicators, icons that carry meaning and chart elements.
- **1.4.12 Text spacing.** Layout survives increased line, letter and word spacing.
- **1.4.13 Content on hover or focus.** Tooltips and popovers are dismissible (Escape), hoverable and persistent.
- **Forced colors.** In `forced-colors: active` (Windows High Contrast) borders, custom checkboxes, icons and focus rings survive. Don't rely on `background-color` alone for a control's shape or state; use `border`, `outline` or system colors (`CanvasText`, `Highlight`).

### Operable
- **2.1.1 Keyboard.** Every action works from the keyboard. Clickable `<div>`/`<span>` without role, `tabindex` and key handling is a fail. Custom widgets (sliders, swatches, tabs, menus, comboboxes) follow the ARIA Authoring Practices key model.
- **2.1.2 No keyboard trap.** Focus can always leave. A modal may trap focus only if it has a keyboard-reachable close control; closing on Escape is the expected convention (APG), not the criterion itself.
- **2.2.2 Pause, stop, hide.** Autoplaying or looping content (video, carousels, marquees) running over 5 s has a visible pause control. Respect `prefers-reduced-motion`.
- **2.4.1 Bypass blocks.** A skip link or landmarks let users jump past repeated navigation.
- **2.4.3 Focus order.** Tab order follows visual and reading order. No positive `tabindex`. Opening a dialog or drawer moves focus into it; closing returns focus to the trigger.
- **2.4.4 Link purpose.** Link and button text makes sense alone or with its context ("Read more" needs an accessible name that says about what).
- **2.4.7 Focus visible.** Every focusable element shows a visible focus style. `outline: none` without a replacement is a fail. Prefer `:focus-visible`.
- **2.4.11 Focus not obscured (2.2).** Focused elements aren't fully hidden by sticky headers, docked bars, cookie banners or chat widgets. `scroll-padding` usually fixes it.
- **2.5.3 Label in name.** The accessible name contains the visible label text.
- **2.5.7 Dragging movements (2.2).** Anything draggable (sliders, range filters, swipers, sortable lists) has a single-pointer alternative such as buttons or tap.
- **2.5.8 Target size (2.2).** Targets are ≥ 24×24 CSS px or spaced so a 24 px circle around each doesn't overlap another. 44×44 (2.5.5, AAA) is a sensible house target. Exempt: inline links in a sentence, unstyled user-agent controls, and targets where the size is essential.
- **Touch feedback.** Hover styles gated behind `@media (hover: hover)` never fire on touch. Interactive elements with hover feedback need a matching `:active` style. Not a WCAG criterion; report as Minor.

### Understandable
- **3.1.1 Language of page.** `<html lang>` is set; **3.1.2** marks passages in another language.
- **3.2.1 / 3.2.2 On focus, on input.** Focusing or changing a control doesn't navigate, submit or move focus unexpectedly. A `<select>` that navigates on change is a fail.
- **3.2.6 Consistent help (2.2).** Help, chat and contact links sit in the same relative place across pages.
- **3.3.1 Error identification.** Errors are described in text, tied to the field (`aria-describedby`), and announced (live region or focus move).
- **3.3.2 Labels or instructions.** Every input has a visible, programmatic `<label>` (placeholder isn't a label). Required fields and formats are stated up front.
- **3.3.7 Redundant entry (2.2).** Users don't retype information already given in the same flow; autofill it or offer to reuse it.
- **3.3.8 Accessible authentication (2.2).** Login and code-entry fields allow paste and password managers. No cognitive-test-only CAPTCHA.

### Robust
- **4.1.2 Name, role, value.** Every control exposes an accessible name, a correct role and its current state: `aria-expanded` + `aria-controls` on disclosure toggles, `aria-pressed` on toggle buttons, `aria-selected` on tabs, `aria-current` on the current nav item, `aria-label` on icon-only buttons.
- **4.1.3 Status messages.** Async results (added to cart, filters applied, form saved, search result counts) are announced through `role="status"` or `aria-live`, without moving focus. The live region exists in the DOM before the message is inserted. Don't make everything live: one region per page area, polite by default, and no announcements for changes the user can already see where they're looking.
- **ARIA misuse.** `role` on an element that already has it natively, `aria-hidden="true"` on a focusable element or its ancestor, `aria-label` on a non-interactive `<div>`, or roles missing their required children. Report each.

## 4. Test live when you can

Static auditing can't prove keyboard, screen reader or contrast behavior that depends on runtime state. When Chrome DevTools MCP is available and there is a running dev server, preview or production URL:

- `lighthouse_audit` for the accessibility category. Cite the score and failing audits, and note that automated tools catch only a fraction of WCAG failures.
- `take_snapshot` to read the accessibility tree: names, roles and states as assistive technology sees them. Compare against what the markup intended.
- Drive the keyboard with `press_key` (Tab, Shift+Tab, Enter, Space, Escape, arrows) through the changed component. Confirm focus order, focus visibility (`take_screenshot`), focus entering and leaving dialogs, and Escape closing them.
- `resize_page` to 320 px wide and check reflow.
- `evaluate_script` to check `matchMedia('(prefers-reduced-motion: reduce)')` is honored by the animation code, and `matchMedia('(forced-colors: active)')` where the project handles it.
- `evaluate_script` to read computed colors for contrast when the pair is set at runtime.

If there is no live target, say so and audit statically. Mark anything that needs a browser or a real screen reader pass as **needs live verification** rather than reporting it as tested. Automated tools and the accessibility tree don't replace a real screen reader; say so when a finding depends on actual announcement behavior. Never invent results.

## 5. Contrast that can't be resolved statically

When foreground or background comes from a CMS or theme setting, user content, a design token resolved at runtime, or an uploaded image or video, the real pair is unknown. Flag it as **manual check** with the setting or token name, not as a fail. Fail it outright only when both colors are known (hardcoded or resolvable tokens) and the computed ratio is below the threshold. For text over media, suggest a scrim, text shadow or solid backing that guarantees the ratio whatever the media.

## Output

```markdown
## Accessibility audit: [target]
**Standard:** WCAG 2.2 AA [+ house rules from: sources] | **Mode:** [static, or live <URL>]

**Issues:** [X] | Critical [X] | Major [X] | Minor [X] | Manual check [X]

### Findings
| # | Where | Issue | WCAG | Severity | Fix |
|---|-------|-------|------|----------|-----|
| 1 | `file:line` | [Issue] | 2.1.1 Keyboard | Critical | [Fix, in project conventions] |

### Contrast
| Element | Foreground | Background | Ratio | Required | Result |
|---------|-----------|------------|-------|----------|--------|
| [Body text] | [color / token / setting] | [color / token / setting] | [X]:1 or manual check | 4.5:1 | pass / fail / manual |

### Keyboard
| Element | Reachable | Enter/Space | Escape | Arrows | Focus visible |
|---------|-----------|-------------|--------|--------|---------------|

### Already present (not introduced by this change)
- [`file:line`, issue, criterion]

### Needs live verification
- [What, and why static auditing can't settle it]
```

Severity: **Critical** blocks a task for some users (can't reach, operate or perceive a required control). **Major** makes a task hard or confusing. **Minor** is friction or a best-practice gap. Sort findings by severity, then by how many users and pages they hit; put anything that fails a CI-gated rule first within its severity. Omit the Contrast, Keyboard or Already present sections when there is nothing to put in them. Mark JS fixes as JS and say whether a native element would remove the need. Skip praise and don't restate the file's contents. If nothing is wrong, say so in one line and list what still needs live verification.

Fixes stay scoped to accessibility. If a fix changes a shared component's behavior or API, say so and route it through the project's approval rules instead of treating it as a local tweak.
