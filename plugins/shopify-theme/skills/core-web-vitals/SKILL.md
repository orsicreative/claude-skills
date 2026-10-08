---
name: "core-web-vitals"
description: Review Liquid sections, JS modules or asset changes in the Stardust Shopify theme for Core Web Vitals impact (CLS, LCP, TBT/FID). Use after touching image markup, above-the-fold sections, or JS that loads or renders dynamic content, and as a pre-merge performance check. Invoke manually with /core-web-vitals and an optional file, folder or diff target. Not for general accessibility or functional bugs.
argument-hint: "sections/main-product.liquid, or empty for the current diff"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*), mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__new_page, mcp__chrome-devtools__performance_start_trace, mcp__chrome-devtools__performance_stop_trace, mcp__chrome-devtools__performance_analyze_insight, mcp__chrome-devtools__lighthouse_audit, mcp__chrome-devtools__list_network_requests, mcp__chrome-devtools__take_screenshot
---

Review target: $ARGUMENTS (if empty, the uncommitted changes on the current branch)

# Core Web Vitals review

Review this Shopify theme (Stardust) for Core Web Vitals: CLS, LCP, TBT/FID. Treat every JS-based fix as a last resort and say so when you recommend one. CSS, HTML and server-rendered Liquid beat a script every time.

This is a review. Report findings and fixes; don't edit files unless the user asks you to apply them.

## 1. Scope

- No target given: review the change. Run `git status` and `git diff` (plus `git diff --staged`).
- A file or folder given: read it directly.
- Don't audit the whole theme unless asked.

## 2. Use the theme's own budgets

Read `lighthouserc.js` for the actual thresholds instead of generic web advice. When last checked they were CLS ≤ 0.1 (error), LCP ≤ 4000ms (warn) and TBT ≤ 15000ms (warn). If the file says otherwise, the file wins. Note the change in your report.

CLS and accessibility are the two gates that block a merge here. Treat everything else as advisory. Accessibility is out of scope for this review.

## 3. Checklist, in priority order

CLS comes first because it is the error-level gate. LCP is next, then JS weight and TBT.

### CLS
- Every `<img>` and `<video>` has explicit `width`/`height` or an `aspect-ratio`. Flag any that don't.
- No full-section loading spinners: a zero-height section causes a large shift when content loads. The required pattern is a server-rendered skeleton (`animate-pulse bg-gray-200`) at the real content's dimensions.
- Dynamically loaded containers (search results, reviews, recommendations) stay visible with skeletons. They are never hidden until the fetch resolves (see `docs/architecture` and the CLS section of CLAUDE.md).
- Re-fetches use `opacity-50` while loading, never a height change.
- Web fonts: any new `@font-face` needs a `font-display` setting and reserved layout space.

### LCP
- The likely LCP element (hero image, main product image, above-the-fold heading) is server-rendered in Liquid, not injected by JS.
- `loading="lazy" decoding="async"` goes on below-the-fold images only. An LCP candidate must not be lazy-loaded.
- New critical-path modules: decide whether a `<link rel="modulepreload">` belongs in `scripts.liquid`. Feature modules (SearchSpring, Rebuy, Wishlist) stay gated behind their setting and are imported dynamically, never loaded eagerly.
- Render-blocking resources: flag a new `<script>` without `type="module"` or `defer`, a new synchronous third-party embed, or a new blocking `<link rel="stylesheet">`.

### TBT / JS weight
- Could this be CSS instead of JS? Consider `:has()`, `@container`, and `@starting-style` (if it fits the Safari 16.4+ support floor).
- DOM writes are batched with `requestAnimationFrame`. Flag layout thrashing (read/write/read/write loops).
- A new dependency or polyfill for theme JS is a **blocking** architecture question under CLAUDE.md. Flag it; don't wave it through.
- Event delegation beats per-element listeners. Check for leaked listeners or observers (a missing `destroy()` cleanup).

## 4. Measure when you can

When Chrome DevTools MCP is available and there is a running dev server or preview URL, measure instead of guessing. `navigate_page` to the page, then wrap the interaction in `performance_start_trace` / `performance_stop_trace` (or run `lighthouse_audit`). Cite the real LCP and CLS numbers in your findings, not a theoretical read of the markup.

If there is no live target, say so and review statically. Never invent numbers.

## 5. Fixes follow house style

Every finding gets a fix, and the fix follows house style:
- Tailwind utility classes, never arbitrary values (`pt-1.5`, not `pt-[6px]`).
- `data-*` attributes as selectors, not classes.
- Native HTML and CSS before a JS module.
- If the fix touches a feature module, keep the provider/UI split.

If the only real fix is JS, label it as JS and say it's the fallback, not the first choice.

## Output

For each issue give `file:line`, the metric it hurts, why, and the fix. Order the issues by priority, CLS-breaking ones first. Skip praise and don't restate the file's contents. If nothing is wrong, say so in one line.
