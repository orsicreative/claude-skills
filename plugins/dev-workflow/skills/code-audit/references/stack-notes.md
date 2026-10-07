# Stack-Specific Notes

Read the section(s) matching the code under audit.

## Contents
- JavaScript / TypeScript
- Shopify Liquid themes
- CSS
- Python
- GDScript / Godot

---

## JavaScript / TypeScript

**Bugs**
- `forEach` with `async` callbacks doesn't await; use `for...of` or `Promise.all`
- `parseInt` without radix; `Number("")` is `0`; `typeof null === "object"`
- `Array.prototype.sort` default is lexicographic (`[10, 9, 1].sort()` → `[1, 10, 9]`)
- `Date` month is 0-indexed; `new Date("2026-10-03")` is UTC midnight, local display may be the previous day
- Event listeners added repeatedly (in render/init paths called more than once) without removal
- `this` binding lost in callbacks
- Optional chaining hiding real errors (`a?.b?.c` where `a` must exist)
- TS: `as` casts and non-null `!` that lie; `any` leaking through boundaries; enums vs union types consistency

**Security**
- `innerHTML`, `insertAdjacentHTML`, `document.write`, `dangerouslySetInnerHTML` with non-constant input
- `postMessage` listeners without origin check
- Secrets in client bundles (anything shipped to the browser is public, including "private" env vars bundled at build time)
- Prototype pollution via merging untrusted objects

**Dead code**
- Exports referenced only by string (dynamic `import()`, `data-module` attributes, custom element tag names), side-effect-only imports

**Performance**
- Whole-library imports (`import _ from "lodash"`) when a few functions are used
- DOM queries inside loops; reading layout (`offsetHeight`, `getBoundingClientRect`) after writes
- Scroll/resize/input handlers without throttle/debounce or passive listeners

## Shopify Liquid themes

**Dead-code traps — check all of these before calling anything unused**
- Sections are often referenced only from `templates/*.json`, `sections/*.json` (section groups), or `config/settings_data.json`, not from Liquid
- Snippets may be rendered by variable: `{% render block.type %}`, `{% render 'icon-' | append: name %}`
- Blocks, settings, and section types can be referenced by merchants in the theme editor; a setting with no Liquid reference may still be configured in `settings_data.json` — removing it is harmless to rendering but check before removing schema that existing JSON templates use
- Alternate templates (`product.special.json`) assigned to products in admin aren't visible from code
- Assets referenced via `asset_url` built from variables, or loaded by app embeds
- Metafield and metaobject definitions used by apps outside the theme

**Bugs**
- Liquid's falsy values are only `nil` and `false` — empty strings and `0` are truthy; use `!= blank` / `== empty` deliberately
- `forloop` limit of 50 items on paginated collections without `paginate`
- Money: use the `money` filters; prices are in cents (subunits)
- Variant selection: reading `product.selected_or_first_available_variant` vs URL `variant` param inconsistently between Liquid and JS
- Cart AJAX: not handling 422 (inventory) responses; stale cart state across sections after updates (use Section Rendering API consistently)
- Translations: hard-coded strings that should be in `locales/*.json`

**Security**
- Unescaped output of user/merchant-controlled content into HTML attributes or `<script>` blocks — use `escape` and `json` filters
- Customer data or tokens embedded in page source unnecessarily
- Storefront API tokens are public by design; Admin API tokens must never appear in theme code

**Performance**
- Liquid loops over `all_products` or large collections (expensive, limited)
- Nested `{% render %}` in loops with heavy snippets; repeated filters inside loops that could be assigned once
- Render-blocking scripts/styles in `theme.liquid`; images without `image_url` width + `srcset`/`sizes`, missing `loading="lazy"` below the fold, missing width/height (CLS)
- App embed and third-party script bloat (flag, don't remove — merchants depend on apps)

## CSS

- Dead selectors: check JS for class toggles and string-built class names, Liquid/HTML templates, and CMS-editable content before removal
- Specificity wars and `!important` chains — flag the root cause
- Duplicate declarations, overridden rules never applied
- Layout-shifting animations (animate `transform`/`opacity`, not `top`/`width`)
- Missing focus styles (`outline: none` without replacement)
- Hard-coded colors/sizes where the project uses custom properties/tokens

## Python

- Mutable default arguments (`def f(x=[])`)
- Bare `except:` / `except Exception: pass`
- Late-binding closures in loops
- `is` used for value comparison with ints/strings
- Naive vs aware `datetime` mixing
- SQL via f-strings; `subprocess` with `shell=True` and interpolation; `pickle`/`yaml.load` on untrusted input
- Files/connections opened without context managers
- Unused imports exposed via `__all__` or used by plugins/entry points — check before removing

## GDScript / Godot

- Signals connected repeatedly (in `_ready` of nodes re-added to the tree) without disconnect or `CONNECT_ONE_SHOT` where intended
- Nodes referenced with `$Path` / `get_node` that break when the scene tree changes; prefer `@onready` with exported `NodePath` or unique names (`%Name`) per project convention
- Work in `_process`/`_physics_process` that could be event-driven or cached (e.g. `get_node`, `find_children`, allocations every frame)
- Frame-rate-dependent movement (missing `delta`)
- `queue_free` vs `free` misuse; accessing freed instances (`is_instance_valid`)
- Untyped variables where the project uses static typing (also a perf issue in Godot 4)
- Dead code traps: methods called by name via `call`, `call_deferred`, signal connections in `.tscn` files, AnimationPlayer method tracks, and input actions defined in `project.godot`
