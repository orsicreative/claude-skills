---
name: "core-web-vitals"
description: Review web front-end code (HTML, templates, components, CSS, client JS, asset and image changes) for Core Web Vitals impact (LCP, CLS, INP) and return prioritized fixes. Use after touching image or media markup, above-the-fold content, fonts, third-party scripts, or JS that renders dynamic content or handles user input, and as a pre-merge performance check. Also use when the user asks why a page is slow, janky or jumpy. Invoke manually with /core-web-vitals and an optional file, folder or URL. Not for backend performance, general accessibility or functional bugs.
argument-hint: "src/components/Hero.tsx, a preview URL, or empty for the current diff"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*), mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__new_page, mcp__chrome-devtools__performance_start_trace, mcp__chrome-devtools__performance_stop_trace, mcp__chrome-devtools__performance_analyze_insight, mcp__chrome-devtools__lighthouse_audit, mcp__chrome-devtools__list_network_requests, mcp__chrome-devtools__take_screenshot
---

Review target: $ARGUMENTS (if empty, the uncommitted changes on the current branch)

# Core Web Vitals review

Review front-end code for the three Core Web Vitals: **LCP** (loading), **CLS** (visual stability) and **INP** (responsiveness). INP replaced FID in 2024. Don't review against FID.

Prefer the cheapest layer that fixes the problem: markup and server rendering, then CSS, then JS. Every script you add costs parse, compile and main-thread time, which is the INP budget. When the only real fix is JS, label it as JS and say it is the fallback.

This is a review. Report findings and fixes; don't edit files unless the user asks you to apply them.

## 1. Scope

- No target given: review the change. Run `git status`, `git diff` and `git diff --staged`.
- A file or folder given: read it directly, plus whatever it renders into (layout, template, parent component) when that decides above-the-fold placement.
- A URL given: measure it (step 4) and trace findings back to source if the code is in the repo.
- Don't audit the whole site unless asked.

Before reviewing, read the project's rules: CLAUDE.md, contributing docs, and the styling and component conventions the code already uses. Fixes must fit them.

## 2. Find the budgets

Use the project's own budgets when it has them: `lighthouserc.*`, `budget.json`, bundler size limits (`size-limit`, `bundlesize`, webpack `performance` hints), CI performance steps, or numbers in CLAUDE.md. Report which source you used.

Otherwise use Google's "good" thresholds, at the 75th percentile of real page loads:

| Metric | Good | Poor |
|---|---|---|
| LCP | ≤ 2.5 s | > 4.0 s |
| CLS | ≤ 0.1 | > 0.25 |
| INP | ≤ 200 ms | > 500 ms |
| TBT (lab proxy for INP) | ≤ 200 ms | > 600 ms |

A loose project budget is not permission to regress. Judge what the change itself adds: a new layout shift, a later LCP, or a new long task over 50 ms is a finding even when the page total stays under budget.

## 3. Checklist

Rank findings by how much of a metric they cost on the pages users actually hit, worst first. Within a tie, put whatever breaks the project's error-level budget first.

### CLS
- Every `<img>`, `<video>`, `<iframe>` and embed has `width`/`height` attributes or a CSS `aspect-ratio`. Flag any that don't.
- Space is reserved for anything that arrives late: ads, embeds, cookie banners, reviews, recommendations, search results. Use a placeholder or skeleton at the real content's size, rendered with the page. A zero-height container or a spinner that collapses when content arrives is a shift.
- Content is never inserted above existing content unless it responds to a user action. Banners go in reserved space or overlay.
- Loading containers stay visible. Show a skeleton during the first load. During re-fetches, dim the old content instead of hiding it or changing its height.
- Fonts: every `@font-face` sets `font-display`. Use `swap` or `optional`, and size the fallback (`size-adjust`, `ascent-override`) so the swap doesn't reflow text. Preload only the one or two fonts used above the fold.
- Animations and transitions use `transform` and `opacity`, not `top`, `left`, `width`, `height` or `margin`.

### LCP
- Identify the likely LCP element per page type (hero image, main product or article image, headline). It should be in the server-sent HTML, not injected by client JS or only discovered through a CSS `background-image`.
- The LCP image is never `loading="lazy"`. Give it `fetchpriority="high"`. If it's discovered late (CSS background, JS-picked source), add `<link rel="preload" as="image">` with `imagesrcset`/`imagesizes` when it's responsive.
- `loading="lazy"` and `decoding="async"` go on images below the fold only.
- Images are sized for their slot (`srcset` + `sizes`) and in a modern format (AVIF/WebP) where the pipeline supports it. Use the framework's or platform's image helper if there is one.
- Render-blocking resources: a new `<script>` in `<head>` without `defer`, `async` or `type="module"`, a new blocking stylesheet, a synchronous third-party tag, or `@import` chains in CSS.
- New critical-origin requests (font host, image CDN) get `preconnect`. Non-critical third parties don't.
- Server response: new redirects, uncached or per-request rendering of a page that could be cached, or a data fetch that now blocks the HTML. TTFB counts toward LCP.

### INP and main-thread work
- Could this be CSS or HTML instead of JS? For example `:has()`, container queries, `@starting-style`, `<details>`, `<dialog>`, the `popover` attribute, scroll-snap, `position: sticky`. Check each against the project's browser support target.
- Event handlers do the minimum before the next paint: give visual feedback first, then defer the rest (`requestAnimationFrame` then `setTimeout`, or `scheduler.yield()` where supported).
- Long loops and big renders are broken into chunks that yield to the main thread. Flag any task likely to run over 50 ms.
- No layout thrashing: don't alternate DOM reads (`offsetHeight`, `getBoundingClientRect`) with writes in a loop. Batch reads, then writes.
- Large or offscreen DOM: consider `content-visibility: auto` for long below-the-fold sections, and virtualize long lists.
- Input handlers on scroll, resize and typing are passive, debounced or throttled as appropriate.
- Listeners and observers are cleaned up when components unmount. Prefer event delegation over per-element listeners for repeated items.
- Hydration and framework cost: a large client-hydrated tree for mostly static content is a finding. Suggest server-only or island rendering if the framework supports it.

### JS weight
- A new dependency or polyfill: check its size and whether the browser target already covers it. Flag it as an architecture question rather than waving it through.
- Non-critical features (chat, reviews, recommendations, wishlists, analytics extras) load on demand or after load, using dynamic `import()`, an interaction trigger or a visibility trigger, never in the main bundle.
- Third-party tags are loaded `async` or after load, and gated behind the feature or consent that needs them.
- `modulepreload` or `preload` is used only for code needed on the critical path. Preloading everything competes with the LCP resource.

### Applies to all three
- Back/forward cache eligibility: no `unload` handlers, and no `Cache-Control: no-store` on pages that don't need it. A bfcache restore makes every metric instant.

## 4. Measure when you can

Field data beats lab data. If the project has real-user monitoring (the `web-vitals` library, RUM or analytics) or the site is in the Chrome UX Report, cite those numbers.

For lab data, when Chrome DevTools MCP is available and there is a running dev server, preview or production URL:
- `navigate_page`, then wrap the load in `performance_start_trace` / `performance_stop_trace`, or run `lighthouse_audit`. Use `performance_analyze_insight` to find the LCP element, layout-shift culprits and long tasks.
- INP needs an interaction. Trace the specific click or keypress the change affects, not just page load.
- Test with mobile emulation and CPU throttling. Desktop numbers hide most INP problems.

Cite the measured numbers next to each finding. If there is no live target, say so and review statically. Never invent numbers.

## Output

For each issue give `file:line`, the metric it hurts, why, and the fix in the project's own conventions, ordered as in step 3. Mark JS fixes as JS. Skip praise and don't restate the file's contents. If nothing is wrong, say so in one line.
