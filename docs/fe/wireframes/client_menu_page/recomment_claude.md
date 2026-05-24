
3. Scaling to 10 Pages: Managing Components, State, and Performance
Since you have 10 other pages, you cannot treat this as a standalone project. You need an Architecture Strategy to ensure the app remains fast and maintainable.
Here is the recommended approach based on your current tech stack (Next.js, Zustand, TanStack Query):
A. Managing Shared Components (Don't Repeat Code)
You need a Design System. Do not duplicate UI elements across the 10 pages.
Strategy: Create a components/ui/ folder (Atomic Design).
Atoms: Button, Input, Checkbox, Badge, Skeleton.
Molecules: ProductCard, CartItem, SearchBar (reuse the one you built in menu_wireframe_v1.md).
Organisms: Header, Footer, BottomNav.
Example: The OrderSummary (Zone I) logic might be needed on a "Review Order" page. Move the logic out of the menu page and make it a reusable OrderSummary component.
B. State Management Architecture (Global vs. Page)
With 10 pages, a single cartStore file will become unmanageable. You need to separate concerns.
Global State (Zustand):
Only put data needed by multiple pages here.
Examples: authUser, globalSettings (language/theme), cart (if used across menu/checkout).
Implementation: Use Zustand's persist middleware sparingly (only for cart and user preferences) to save storage space.
Page-Specific State:
Keep logic inside the feature folder (e.g., features/menu/, features/history/).
Use useState or useReducer for temporary data that disappears when the user leaves the page (e.g., "Show/Hide History Filter").
Server State (TanStack Query):
You already have a good start (staleTime: 5min).
Optimization: Use queryKey prefixes to avoid collisions.
['menu', 'products']
['history', 'orders']
Optimistic Updates: For actions like "Add to Favorite," update the UI immediately before the API responds (as noted in your tech_description.md). This makes the app feel "instant."
C. Performance Optimization (Seamless UX)
To ensure the app feels native and smooth across all 10 pages:
Route-based Code Splitting:
Since you are using Next.js App Router (/(shop)/menu/), code splitting happens automatically. Each page loads its own JS bundle.
Image Optimization:
Never use raw <img> tags. Use next/image to auto-compress and lazy-load images. This is critical for a menu page with many food photos.
Loading States (Skeleton Screens):
Don't show a spinning wheel. Show gray skeleton shapes (placeholders) matching the layout of the menu_wireframe. This reduces the "Time to Interactive" feel.
Prefetching:
If a user is on the Menu, use next/link prefetch to load the "Checkout" page data in the background before they even click the button.
D. Navigation & Layout
Shared Layout:
Create a layout.tsx in the /(shop)/ folder.
Put the Header (Zone A) and BottomNav (if you have one) here.
This ensures the transition between pages is seamless (the header doesn't flicker or reload).
Scroll Restoration:
Ensure that if a user clicks back to the Menu, they return to the exact scroll position they left at (Next.js handles this by default, but test it).
Summary Checklist for Your Next 10 Pages:
Audit: Does the new page reuse existing components (Cards, Buttons)? If not, build it in components/ui/ first.
State: Is the new state global or local? If local, keep it in the page folder.
Data: Are you using TanStack Query for API calls? Ensure staleTime is set.
UX: Is there a skeleton loading state? Is the touch target 44px?
By following this structure, you turn your Menu page spec into a Template for the rest of the application, ensuring consistency and speed.


# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.