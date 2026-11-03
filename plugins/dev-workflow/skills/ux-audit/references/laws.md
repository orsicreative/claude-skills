# UX laws

Based on [Laws of UX](https://lawsofux.com) by Jon Yablonski, rewritten as audit checks.

Each law: what it says, what to look for in code or screenshots, and the usual fix. Laws are alphabetical so new ones can be appended in place. "Overlaps" names the other skill that owns the measurable part, so findings aren't reported twice.

## Choice overload
People facing too many options decide worse, decide slower, or don't decide, and like the whole experience less. Related to Hick's law.

**Look for**
- Lists, grids, menus or option sets with many peers and nothing promoted (no featured, recommended or default item).
- Large catalogs or result sets with no search, filter or sort up front.
- Options that must be compared (pricing tiers, plans, product variants) shown in a way that prevents side-by-side comparison: separate pages, tabs, carousels, or cards with different fields in a different order.

**Fix**
- Promote one option (featured, recommended, sensible default) and let the rest recede.
- Put search, filters or a short "help me choose" step before the full set.
- Show comparable options side by side with the same attributes in the same order.

## Chunking
Breaking information into small, meaningful groups lets people scan, find what matches their goal, and act faster. Related to Miller's law.

**Look for**
- Long unbroken text, forms or settings pages with no grouping, headings or visual separation.
- Long strings users must read or type as one block (phone, card, account or order numbers, codes).
- Groups that exist in the data but not on screen: related fields scattered, unrelated fields packed together.
- Flat hierarchy: every heading or block styled the same, so nothing says what matters most.

**Fix**
- Group related content into distinct modules with a heading, and order them by importance.
- Display long strings in familiar chunks (`555 123 4567`, `4242 4242 4242 4242`). Don't force chunked input; accept pasted values with or without separators.
- Separate groups with spacing first, then dividers or backgrounds (see common region).

**Overlaps** `/accessibility-audit` owns heading order and `<fieldset>` markup (1.3.1). Report the scanning and grouping problem here.

## Cognitive load
The mental effort needed to understand and use an interface. Intrinsic load is what the task itself demands: keeping the goal in mind and taking in new information. Extraneous load is effort spent on the interface that doesn't help the task. Design can't remove intrinsic load, but it can stop adding extraneous load.

**Look for**
- Extraneous load: decorative motion, competing calls to action, ads or promos inside a task flow, inconsistent labels for the same thing, jargon or internal terms.
- Memory load: steps that ask users to remember something from an earlier screen (a code, a price, a choice) instead of showing it again.
- Everything shown at once when most users need a fraction of it.

**Fix**
- Strip elements that don't serve the current task, especially inside checkout, sign-up and other flows.
- Carry earlier choices forward (summaries, persistent order details) instead of relying on memory.
- Use the same word for the same thing everywhere; use the user's words, not the system's.
- Hide advanced or rare options behind a disclosure.

## Doherty threshold
People stay engaged and productive when the system responds within about 400 ms, so neither side waits on the other.

**Look for**
- Actions with no immediate feedback: buttons that don't change state on press, forms that submit with no pending state, navigation with no indicator.
- Waits longer than about 400 ms with nothing on screen: no skeleton, spinner, progress bar or optimistic update.
- Long operations with a spinner but no sense of progress or remaining time.
- Buttons that stay enabled during submit, inviting double submits.

**Fix**
- Acknowledge every action immediately (pressed, pending or disabled state) even when the result takes longer.
- Use optimistic UI where the action almost always succeeds and can be rolled back.
- Use skeletons for content loads and progress bars for long operations. A progress bar helps even when its estimate is rough.
- Don't add artificial delay to make something feel more thorough unless the product owner asks for it; flag it as a product decision, not a UX fix.

**Overlaps** `/core-web-vitals` owns INP and measured response time. Report missing feedback states here, and slow handlers there.

## Fitts's law
The time to hit a target depends on how far away it is and how big it is.

**Look for**
- Small primary actions, or primary actions far from where the user's attention or thumb already is.
- Destructive and safe actions placed next to each other with little spacing (Delete beside Save).
- Clickable areas smaller than the thing that looks clickable (only the text of a card or row is a link, not the card).
- Primary actions on mobile placed out of thumb reach, at the top corners of tall screens.

**Fix**
- Make primary actions large and put them near the content they act on; on mobile, consider a sticky bottom action.
- Make the whole visible card, row or tile the target.
- Space destructive actions away from frequent ones, or add confirmation or undo.

**Overlaps** `/accessibility-audit` owns minimum target size and spacing (2.5.8). Report placement, distance and relative size here.

## Hick's law
Decision time grows with the number and complexity of choices.

**Look for**
- Time-critical or high-frequency screens (checkout, primary navigation, alerts, dialogs) with many options of equal weight.
- Complex tasks presented as one long screen instead of steps.
- New users shown every feature on first use.
- Over-simplification: options merged or hidden so far that users can't tell what they're choosing (vague icons with no labels, a single "More" menu holding everything).

**Fix**
- Cut or demote options on time-critical screens; highlight the recommended one.
- Split complex tasks into steps with a visible progress indicator.
- Reveal features progressively as users need them.
- Keep labels concrete. Fewer choices only help if each one is still understandable.

## Jakob's law
Users spend most of their time on other sites and apps, so they expect yours to work the same way.

**Look for**
- Common patterns done differently for no product reason: logo not linking home, cart or account in an unusual place, custom scrollbars, non-standard form controls, unusual gestures as the only way to act.
- Familiar-looking elements that behave unexpectedly (an underlined word that isn't a link, a chevron that doesn't expand).
- Platform conventions ignored (iOS vs Android back behavior, desktop keyboard shortcuts).
- Redesigns that replace a familiar flow outright with no transition.

**Fix**
- Follow the established pattern unless there's a measured reason not to; name the reason when keeping a deviation.
- Make elements that look like a known pattern behave like it.
- For large redesigns, let users keep the familiar version for a limited time, or introduce the change with a short guided tour.

## Law of common region
Elements are seen as a group when they share an area with a clear boundary.

**Look for**
- Related items with nothing binding them together (a product's price, options and add-to-cart button floating apart).
- Boundaries that cut across real groups, or one container holding unrelated items.
- Nested borders and backgrounds several levels deep, where the structure becomes noise.

**Fix**
- Put each group in one container: a border, a background color, or a card.
- Make the container match the group exactly: one group per container, one container per group.
- Prefer one level of containers plus spacing over deep nesting.

**Overlaps** `/accessibility-audit` owns the contrast of borders and backgrounds used as boundaries (1.4.11). Report the grouping problem here.

## Serial position effect
People remember the first and last items in a series best and the middle ones least.

**Look for**
- Key items (primary nav destinations, the main call to action, the most-used option) buried in the middle of a list, menu, tab bar or carousel.
- Low-value items (legal, promos, rarely used settings) taking the first or last slot.
- Lists with no natural order (a product's features or benefits, plan inclusions, menu items) left in whatever order they were entered instead of ordered by importance.

**Fix**
- Put the most important items first and last; let the middle hold the least important ones.
- In navigation and toolbars, anchor key actions at the far left and right (e.g. home or logo first, cart or account last).
- Apply this to lists whose order is arbitrary, like product features. Lists people expect in a set order (sizes small to large, dates, countries or a directory alphabetically) keep that order; reordering them breaks Jakob's law.
