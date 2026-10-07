# Audit Checklist

Use this while reading each unit. It's a prompt for attention, not a form to fill in — skip items that can't apply to the code in front of you.

## Contents
1. Correctness / Bugs
2. Security
3. Performance
4. Dead code
5. Duplication
6. Standards

---

## 1. Correctness / Bugs

**Control flow and data**
- Boundary conditions: empty collections, single element, first/last index, `<` vs `<=`
- Null/undefined/None paths — every optional value, every lookup that can miss
- Falsy traps: `0`, `""`, `false`, `NaN` treated as "missing" (`if (qty)`, `x || default`)
- Equality: loose vs strict, reference vs value, float equality
- Integer/float: money in floats, integer division, overflow, rounding mode
- Mutation of arguments or shared/module-level state; aliasing (two names, one object)
- Shadowed variables, wrong variable used (copy-paste errors — compare sibling blocks)
- Switch/match fallthrough and missing default/exhaustiveness
- Loop variables captured by closures

**Async and concurrency**
- Missing `await`; promises not returned; floating promises
- Unhandled rejections; `try` that doesn't cover the awaited call
- Read-modify-write races; check-then-act (TOCTOU)
- Ordering assumptions between independent async operations
- Retries without idempotency; timeouts missing on network calls

**Errors**
- Swallowed exceptions (`catch {}`), logged-and-continued where it should stop
- Error paths that leave state half-updated
- Wrong error type/status code; leaking internals in error messages
- Resources not released on error (files, connections, locks, listeners, timers)

**Time, locale, text**
- Timezone: local vs UTC, DST, date-only values parsed as midnight UTC
- Locale-sensitive formatting/parsing of numbers and dates
- String length vs grapheme count; case-insensitive comparisons; Unicode normalization

**Intent mismatch signals**
- Function name promises something the body doesn't do
- Comment describes different behavior from code
- Callers that post-process a return value to "fix" it
- Parameters that are accepted but ignored
- Tests that are skipped, or that assert the buggy behavior

## 2. Security

- **Injection**: SQL/NoSQL built by string concat; shell commands with interpolation; `eval`/`Function`/`exec`; HTML built from strings (`innerHTML`, unescaped template output); template injection; regex built from user input (ReDoS)
- **Trust boundaries**: identify every place external input enters (request params, headers, cookies, webhooks, files, env, third-party API responses, URL fragments, postMessage). Is it validated and constrained there?
- **AuthN/AuthZ**: checks missing on some routes/actions; authorization on the client only; IDOR (user-supplied IDs used without ownership check); privilege checks after side effects
- **Secrets**: keys/tokens/passwords in source, config committed to repo, logs, error messages, client bundles, URLs
- **Webhooks**: signature verification present and done with constant-time comparison on the raw body
- **SSRF / path traversal**: user-influenced URLs fetched server-side; file paths joined from input
- **Deserialization**: pickle/yaml.load/unsafe JSON revivers on untrusted data
- **Crypto**: home-rolled crypto, MD5/SHA1 for passwords, `Math.random` for tokens, missing salts
- **Transport/headers**: CORS `*` with credentials, missing CSRF protection on state-changing requests, cookies without `HttpOnly`/`Secure`/`SameSite`
- **Dependencies**: obviously outdated or known-vulnerable packages (flag; don't upgrade majors as part of an audit without asking)
- **Privacy**: PII in logs/analytics, over-collection

## 3. Performance

Ask "is this on a path that runs often or on large inputs?" before flagging anything minor.

- N+1 queries/requests; requests in loops that could be batched
- Nested loops over the same or related collections where a map/set lookup would do
- Repeated computation inside loops (regex compilation, `JSON.parse`, DOM queries, sorting)
- Unbounded caches, arrays, listeners, or subscriptions (memory leaks)
- Blocking/synchronous I/O on request or render paths
- Over-fetching (select *, whole objects when one field is needed), missing pagination
- Frontend: layout thrash (interleaved reads/writes), unthrottled scroll/resize handlers, render-blocking resources, large bundles from whole-library imports, images without dimensions/lazy loading, re-rendering on every keystroke
- Work that could be done once at build/startup done per request

## 4. Dead code

- Unused imports, variables, parameters, private functions, CSS rules, assets
- Branches that can't execute (conditions always true/false given types or constants)
- Feature flags permanently on/off
- Commented-out code blocks (version control remembers them)
- Compatibility code for environments no longer supported
- Exports with no importers — **but** check for string/dynamic references and external consumers before removing (see SKILL.md §3)

## 5. Duplication

- Same business rule implemented in multiple places (highest priority — they will drift)
- Copy-pasted blocks differing by one value → parameterize
- Parallel data structures that must be kept in sync
- Re-implementations of utilities that already exist in the codebase or standard library

Don't merge code that is coincidentally similar but represents different concepts that may evolve separately. The test: if one copy changed, would the other *have* to change too?

## 6. Standards

- Naming: clear, consistent with the codebase, matches what the thing actually is
- Function size and single responsibility (flag, don't mechanically split)
- Magic numbers/strings → named constants where the meaning isn't obvious
- Consistent error-handling pattern across the module
- Types: `any`/untyped boundaries, missing return types on public functions
- Lint/format violations per the project's own config
- Accessibility in UI code: semantic elements, labels, alt text, focus management, keyboard support, color contrast
- Logging: appropriate level, structured where the project uses structured logs, no noise
- Comments: explain why, not what; delete stale ones; fix ones that contradict the code (after deciding which is right)
