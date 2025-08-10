# Social Media Versions

## For Twitter / X (≤280 characters)

Most apps don’t need React on day one.

Start with HTML from the server → add HTMX → sprinkle vanilla JS → use Web Components → only then reach for a full framework.

**Progressive Complexity**: climb the ladder only when the problem demands it.

## For Reddit (slightly longer)

**Progressive Complexity**: Start with the simplest tool that solves the problem well, and only escalate when you must.

Server-rendered HTML → HTMX → vanilla JS → Web Components → full framework _only if needed_.

Keeps apps lean, fast, and maintainable — without blocking you from scaling up later.

## other

### The Complexity Ladder

Level 1: Static HTML
↓ (needs server interaction)
Level 2: HTML + HTMX (Declarative server communication)
↓ (needs client-side interaction)
Level 3: HTMX + Vanilla JS (Client-side enhancements)
↓ (needs complex state/lifecycle)
Level 4: HTMX + Web Components (Complex interactions)
↓ (framework ecosystem required)
Level 5: Full Framework (React / Vue / Svelte / etc.)

**Rule:** Start at the lowest level that solves your problem well.
Climb only when the problem _demands_ it.
