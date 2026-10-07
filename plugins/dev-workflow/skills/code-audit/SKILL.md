---
name: "code-audit"
description: Full line-by-line code audit that reconstructs what the code is SUPPOSED to do, then fixes it toward that intent — bugs, correctness, security, performance, dead code, duplication, and poor standards. Use this whenever the user asks to audit, review, harden, clean up, refactor, modernize, "bring up to standard", tighten, or fix up a file, module, folder, PR, or codebase, or asks "what's wrong with this code" and wants it fixed — even if they only name one of the categories (e.g. "find the dead code", "is this secure", "optimize this"). Also use for legacy or inherited code the user doesn't fully trust.
---

# Code Audit

Audit code line by line, work out what it is meant to do, and bring it up to that intent and a professional standard.

The core idea that separates this from a normal review: **the implementation is evidence of intent, not the definition of it.** Code that does the wrong thing consistently is still wrong. But the implementation is also the only thing callers actually experience, so every change that alters behavior must be justified by stronger evidence than "I think it should work differently."

## Workflow overview

1. **Scope** — what's in, how big, what safety nets exist.
2. **Reconstruct intent** — per unit, with a confidence level and its sources.
3. **Audit line by line** — record every finding against intent.
4. **Classify fix risk** — preserving / intent-restoring / ambiguous.
5. **Report** — before touching anything.
6. **Fix** — in priority order, verifying as you go.
7. **Verify and summarize** — including an honest coverage ledger.

Don't skip ahead to fixing. Fixes made before intent is understood are how audits introduce regressions.

---

## 1. Scope

Establish:

- **Target**: files/dirs in scope, and what's explicitly out (vendored code, generated files, lockfiles, minified bundles, migrations already applied).
- **Size**: count lines. If the target won't fit comfortably in context (roughly > 3–4k lines), split into passes by module and audit one pass at a time. Keep a coverage ledger (see §7) so "line by line" stays true rather than aspirational.
- **Safety nets**: is it under version control with a clean tree? Are there tests, a linter config, a type checker, a build command? Find the commands that run them. These determine how aggressive fixes can be.
- **Conventions**: read lint/format configs, `CLAUDE.md`, `CONTRIBUTING`, `.editorconfig`, and a few representative files. "Standards" means *this project's* standards first, the ecosystem's second, your taste never.
- **Mode**: default is audit-then-fix. If the user says "audit only" / "just report", stop after §5.

If the working tree is dirty, say so and recommend committing or stashing first, so the user can diff and revert the audit's changes cleanly.

## 2. Reconstruct intent

For each meaningful unit (module, class, exported function, component, route, template section), write a one- to three-sentence intent statement *before* auditing its lines.

Rank intent sources from strongest to weakest:

1. What the user told you, tickets/specs/PR descriptions they provided
2. Tests (especially assertions with descriptive names)
3. Public docs, README, docstrings, type signatures, API schemas
4. Names — function, variable, file, CSS class, setting keys
5. How callers use it (what they pass in, what they do with the result)
6. Comments (useful but often stale)
7. The implementation itself

When sources disagree, the stronger one wins, and the disagreement itself is a finding. A function named `getActiveUsers` that returns all users, whose callers then filter for `active`, has a clear intent and a clear bug — and also tells you callers are compensating, which matters when you fix it (see §4).

Give each intent statement a confidence:

- **High** — multiple sources agree, or one strong source is unambiguous.
- **Medium** — consistent but thin evidence (good names, no tests/docs).
- **Low** — guessing. Say so.

Also mark each unit's **contract surface**: exported/public APIs, HTTP endpoints, events, DB schemas, CSS classes or IDs used outside the file, template/section names, config keys, anything referenced by string or by external systems. Behavior on the contract surface is where "fixing toward intent" is most likely to break someone.

## 3. Audit line by line

Read every line in scope. Not skimming for patterns — reading. For each unit, compare what each line does to the intent statement.

Record findings in this form (keep a running list; you'll need it for the report):

```
[ID] file:line(s) — CATEGORY / SEVERITY
What: what the code does
Intent: what it should do (cite the source)
Why it matters: concrete consequence
Fix: proposed change
Risk: PRESERVING | INTENT-RESTORING | AMBIGUOUS
```

### Categories

See `references/checklist.md` for the detailed checklist per category. Summary:

- **Correctness/Bugs** — divergence from intent; off-by-one, null/undefined paths, wrong operators, unhandled async rejection, race conditions, timezone/locale/float mistakes, mutated shared state, swallowed errors, wrong defaults.
- **Security** — injection (SQL, shell, HTML/XSS, template), authz gaps, secrets in code, unsafe deserialization, SSRF, path traversal, missing input validation at trust boundaries, weak crypto, overly broad CORS/permissions, sensitive data in logs or URLs.
- **Performance** — algorithmic problems (N+1, O(n²) where O(n) is obvious, repeated work in loops), blocking I/O on hot paths, unbounded growth, layout thrash, oversized payloads/bundles, missing caching where intent clearly implies reuse. Prefer evidence over speculation: flag micro-optimizations only if the path is demonstrably hot.
- **Dead code** — unreachable branches, unused exports/vars/params/imports, commented-out code, flags that are always one value, obsolete compatibility shims.
- **Duplication** — repeated logic that must stay in sync (the real cost), not merely similar-looking code. Two copies that are *supposed* to diverge are not duplication.
- **Standards** — naming, structure, error-handling consistency, typing, magic numbers, inconsistent patterns versus the rest of the codebase, missing accessibility in UI code, lint violations.

### Severity

- **Critical** — exploitable security hole, data loss/corruption, or core function broken.
- **High** — real bug users can hit, significant perf problem, or security weakness needing preconditions.
- **Medium** — edge-case bug, maintainability problem that will cause future bugs (e.g. duplicated logic that must stay in sync).
- **Low** — standards, readability, minor cleanup.

Don't inflate. A report where everything is High is a report nobody reads.

### Dead code needs proof

Before calling something dead, search the whole repository — not just the scope — for references, including **string-based** ones: dynamic imports, reflection, event names, template/partial names rendered by variable, route tables, DI containers, config files, CSS selectors used by JS, public package exports. If you can't rule out external consumers (it's exported from a library, it's an endpoint, it's referenced by a CMS/theme editor), it is AMBIGUOUS, not dead.

## 4. Classify fix risk

Every finding gets one of three risk classes. This decides what happens to it.

**PRESERVING** — observable behavior is unchanged for every caller: removing provably dead code, extracting duplication into a shared function, renaming private identifiers, adding types, fixing formatting, replacing an O(n²) loop with an equivalent O(n) one. → Apply.

**INTENT-RESTORING** — behavior changes, but intent confidence is High *and* you've checked that nothing relies on the current behavior (searched callers; none compensate or depend on it). Most real bug and security fixes land here. → Apply, and list explicitly as a behavior change.

**AMBIGUOUS** — any of: intent confidence is Medium/Low; callers appear to depend on or compensate for current behavior; it's on the contract surface with possible external consumers; the "fix" is really a product decision. → Do not apply. Report it with the specific question that would resolve it.

Security findings are the one exception to waiting: if a Critical security issue is AMBIGUOUS only because of a contract concern, apply the safest fix that closes the hole and flag the compatibility risk loudly, rather than leaving it open.

When callers compensate for a bug (like the `getActiveUsers` example), fix the function *and* the compensating callers together, or neither. Fixing only one side produces double-filtering or a new bug.

## 5. Report (before fixing)

Present the report in the conversation, or as a file if it's long (> ~150 findings or the user asks). Structure:

```markdown
# Code Audit: <target>

## Summary
<3–5 sentences: overall health, the most important problems, what you'll fix and what needs their input.>

## Intent map
<Per unit: intent statement, confidence, key sources. Brief.>

## Findings
<Grouped by severity, Critical first. Each in the §3 format.>

## Needs your input (AMBIGUOUS)
<Numbered questions. Each should be answerable in a sentence.>

## Fix plan
<What you'll apply, in order.>
```

If running interactively, pause after the report when there are AMBIGUOUS items whose answers would change the fix plan, or when there are more than a handful of INTENT-RESTORING changes on the contract surface. Otherwise proceed. If the user has said to run straight through, proceed and leave AMBIGUOUS items unfixed.

## 6. Fix

Order of application:

1. Security (Critical/High)
2. Correctness (Critical/High)
3. Dead code removal — do this before dedup and perf, so you don't refactor code that's about to be deleted
4. Duplication
5. Performance
6. Remaining correctness/security (Medium/Low)
7. Standards

Principles while fixing:

- **Small, reviewable batches.** Group related fixes; don't produce one giant diff. If git is available, one commit per batch with a message naming the finding IDs is ideal — but only commit if the user wants that; otherwise leave changes staged/unstaged as they prefer.
- **Verify after each batch**: run the tests, type checker, linter, and build that you found in §1. If something breaks, fix or revert that batch before continuing. Never leave the code worse than you found it.
- **Add a regression test for each INTENT-RESTORING fix** where test infrastructure exists. If there are no tests at all and you're about to change behavior in non-trivial logic, consider writing characterization tests first that pin current behavior, then update them deliberately — it makes the behavior change visible.
- **Match local conventions.** Don't migrate the codebase to your preferred style, framework idiom, or new language features beyond what the project already uses, unless that's what "standards" problems the audit found actually require.
- **Don't expand scope silently.** If a fix requires touching files outside scope (e.g. compensating callers), do it, but list those files.
- **Minimal correct fix over clever rewrite.** A rewrite throws away the evidence of intent embedded in the original structure and makes review harder. Rewrite a unit only when it's so broken that patching costs more than replacing — and say so.

## 7. Verify and summarize

Finish with:

```markdown
## Audit complete

**Coverage ledger**: <files and line counts audited, and anything in scope NOT audited, with reason. If the audit ran in passes, list which passes are done.>

**Applied**: <count by category. Finding IDs.>

**Behavior changes** (INTENT-RESTORING): <every one, plainly stated — what callers will now see differently.>

**Not applied**: <AMBIGUOUS items and their open questions; anything reverted because verification failed.>

**Verification**: <commands run and results. If no tests/build existed, say so — the user should know the changes are unverified by automation.>

**Recommended follow-ups**: <things out of scope or too large for this pass.>
```

Be candid in the summary. If intent confidence was low across most of the code, say the audit was limited by that. If you couldn't run anything, say the changes are unverified.

---

## Stack-specific notes

Read `references/stack-notes.md` when the target includes JavaScript/TypeScript, Shopify Liquid themes, CSS, Python, or GDScript/Godot. It covers ecosystem-specific bugs, dead-code traps (e.g. Liquid sections referenced only from JSON templates), and security issues common in each.
