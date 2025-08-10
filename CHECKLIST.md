# Demo App Checklist: Product Table (HTMX + Astro)

## Data and Utilities

- Seed data: 50 consumer electronics with fields: id, name, price, quantity, currency
- Store: getProducts({ page, pageSize, sort, search }), getTotals(products), updateProductField(id, field, value), formatCurrency
- Currency: provide a static conversion map on the client; no server conversion
- Constants: PAGE_SIZE=10, supported currencies, default currency

## Astro Setup

- Layout: include HTMX, minimal CSS, aria-live region for totals
- SSR: Node adapter configured; API routes `prerender = false`
- Route: `src/pages/index.astro` hosts totals, table, pagination

## Table UI (HTML-first)

- Totals: `#total-amount`, `#total-items` keep raw totals in `data-value` (base currency/units); display derived from current UI currency
- Rows: `<tr data-price data-quantity data-currency data-prices>`; view/form containers per editable cell
- data-prices: JSON object string with currency keys and numeric values (e.g., `{ "USD": 999.99, "EUR": 899.99 }`) provided initially by server; client updates as needed
- Pagination controls: prev/next buttons with disabled state at bounds

## HTMX Wiring

- Edits: `hx-patch` to `/api/products/[id]/price` and `/api/products/[id]/quantity`
- Triggers: `focusout, keyup[key=='Enter'] from:body`; Escape cancels (see UX)
- Target/Swap: `hx-target="closest tr"` + `hx-swap="outerHTML"`
- Include: `hx-include` inputs when trigger is on td/tr
- Indicator: per-cell spinner element; use `hx-indicator` on cells and pagination buttons
- Totals OOB: API may return spans with updated raw totals `data-value` via `hx-swap-oob="true"` (base/units only); client handles currency display conversion
- Pagination: `hx-get` index with `?page=N`, `hx-target` table region, `hx-swap="outerHTML"`, `hx-push-url="true"`

## Optimistic UI (window.pageUtils)

- Module: `window.pageUtils = { formatCurrency, toggleEdit, handleOptimisticUpdate, handleRevertOnError, renderAllDisplays, handleCurrencyChange }`
- Data-first: write new values to `data-*`; snapshot `data-original-*`
- Recompute totals: iterate rows using current UI currency; compute `sum(quantity × priceInSelectedCurrency)`; write raw total to `#total-amount[data-value]` and update displayed text from selected currency
- Render from state: `renderAllDisplays()` reads `data-*` and `data-prices` and updates text based on `data-display-currency`
- Lifecycle: `hx-on::before-request="window.pageUtils.handleOptimisticUpdate(this)"`, `hx-on::after-request="window.pageUtils.handleRevertOnError(event,this)"`

## Currency Selection (client display)

- Currency select: `<select id="currency-select" hx-on:change="window.pageUtils.handleCurrencyChange(this)">`
- State: keep current display currency on a parent container (e.g., table wrapper) as `data-display-currency`
- Display logic: `handleCurrencyChange` updates `data-display-currency`, then for each row parses `data-prices` JSON, picks price for selected currency, updates cell view; recompute totals from selected-currency prices × `data-quantity`; update totals' `data-value` and displayed text
- Optimistic edits: when editing price, update the row's `data-prices` for all currencies using the client conversion map (derive other currencies from edited currency/base) so display stays consistent until server confirmation
- Server response: row fragment does NOT perform currency math; it only includes authoritative base values and/or `data-prices` as provided initially. Client remains the source of conversion display.

## API Routes

- `src/pages/api/products/[id]/price.ts` and `quantity.ts`
- No server-side currency conversion; persist/update base price/quantity only
- Error simulation: if patched price equals `99.99`, return non-2xx to trigger client revert
- Return updated row HTML (with base fields) and optionally updated raw totals via OOB; client converts for display

## Server-Rendered Fragments

- Partial: `src/pages/partials/product-update-fragment.astro` renders `<tr>` (with `data-price`, `data-quantity`, `data-prices` passed through) and optional OOB totals
- Internal fetch: API routes fetch partial with query params; return HTML
- Ensure route files export `prerender = false`

## Web Component: Table Header (shadow DOM)

- Use a Lit web component `<table-header>` with shadow DOM enabled (default)
- Props/attributes: label, dbColumn, sortBy, currentSortField, currentSortDir, currentSearchField, searchTerm
- Behavior: encapsulate sort carets, search dropdown, input state, and HTMX requests inside the component
- HTMX: emit `hx-get` from internal controls targeting the table region; `hx-push-url="true"`
- Styling: provide component-scoped styles inside shadow root; expose CSS custom properties and/or `part` selectors for host-page theming

## Pagination Logic

- Server: compute total pages; expose hasPrev/hasNext
- UI: prev/next `hx-get` links; disable appropriately
- Data slice: apply offset/limit in `getProducts`

## Currency Conversion

- Client-only: maintain a client conversion map; use `data-prices` per row for instant lookup
- On edit: adjust `data-prices` on the client using the conversion map; keep base price authoritative on server
- Keep raw numeric values in `data-*`; never parse display text

## Totals + OOB Swaps

- Client computes displayed totals in selected currency from `data-prices`
- Optionally, server updates raw totals `data-value` via OOB (no conversion); client converts on render

## Accessibility + UX

- `aria-live="polite"` on totals container
- Focus restore: after row swap, return focus to the triggering cell or input; use `autofocus` when entering edit
- Keyboard: Enter commits; Escape cancels and reverts `data-*` and switches back to view
- Inline error: on failure, render a brief error message inside the cell and give the cell red borders; auto-dismiss error message and error styles after 3 seconds
- Loading: show per-cell spinner via `hx-indicator`; disable pagination buttons during requests

## Error Handling

- Client: revert from `data-original-*` on failure
- UI: transient inline error message in cell
- Server: basic validation (e.g., non-negative numbers) and explicit `99.99` price error simulation

## Design and Styling

- Reuse styles from outer `src/components/table/ShopTvTable.astro`
  - Match table layout, spacing, fonts, header styles (bridge into shadow DOM via CSS custom properties/parts on `<table-header>`)
  - Apply row/hover states, borders, pagination button styles
  - Verify responsive behavior and alignment with totals/pagination wrappers

## Build + Config

- `astro.config.mjs` with `@astrojs/node`
- Global layout includes HTMX
- `npm run build` and local verify SSR

## Final Validation

- Edit price/quantity: optimistic update, server confirms swap, revert on error works
- Currency select: switching updates all row prices and totals from `data-prices` (no server conversion)
- Totals: optimistic + optional OOB raw values reconcile; display uses client conversion
- Pagination: prev/next work; URL updates; table swaps, not full reload
- Header WC: search/sort issue HTMX requests and update results via `<table-header>` with shadow DOM
- All client state in `data-*`; display derived solely from `data-*`
