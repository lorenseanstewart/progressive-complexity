# Progressive Complexity Demo - Technical Implementation

> **See the [Progressive Complexity Manifesto](<[progressive-complexity-manifesto.md](https://www.lorenstew.art/blog/progressive-complexity-manifesto)>) for the philosophy and high-level overview**

https://www.lorenstew.art/blog/progressive-complexity-manifesto

This repository demonstrates how to build a full-featured interactive application using HTML, HTMX, and minimal JavaScript. The result is a **25.8 kB gzipped JavaScript bundle** that delivers enterprise-grade functionality without framework complexity.

### 🎯 Key Achievements

- **Minimal JS Bundle**: Only 25.8 kB gzipped total
  - HTMX: 47.0 kB (15.3 kB gzipped)
  - Application code: 21.3 kB (7.6 kB gzipped)
  - hx-optimistic: 8.3 kB (2.9 kB gzipped)
  - Uncompressed total: 76.5 kB
- **Type-Safe**: Full TypeScript coverage with runtime validation
- **Zero TypeScript Errors**: Strict mode with comprehensive type checking
- **DRY Code**: Centralized configuration and shared utilities
- **Maintainable**: Clear separation of concerns and modular architecture

## Quick Start

```bash
npm install     # Install dependencies
npm run dev     # Start development server (port 4322)
```

This installs key dependencies including htmx.org for dynamic interactions and hx-optimistic for optimistic UI updates.

## 📊 View Accurate Bundle Sizes

⚠️ **Important**: `npm run dev` includes development tools (Astro toolbar, HMR, etc.) that add ~1MB+ of JavaScript.

**To see the true production bundle sizes mentioned in this README:**

```bash
npm run build   # Build for production
npm run preview # Preview production build (port 4321)
npm run report  # Print JS bundle report (raw + gzip) and write dist/bundle-report.json
```

Then check the Network tab or run `npm run report` to see the actual production bundle size.

## Features Implemented

- **Editable product table** with inline editing (click price or quantity cells; Enter to save, Escape to cancel)
- **Pagination** with URL preservation and browser history (bookmarkable)
- **Column-based search** with debounced input and focus preservation
- **Column sorting** with visual indicators (click headers to sort)
- **Optimistic updates** with instant visual feedback
- **Error handling** with graceful reversion (try entering 99.99 as a price to force an error)
- **Keyboard shortcuts** (Enter to save, Escape to cancel)
- **Focus preservation** during HTMX swaps
- **Row deletion** with fade animation
- **Server-authoritative totals** (no client-side calculation drift)

> 💡 **Demo tip**: To see optimistic updates in action, throttle your browser to "Slow 4G" in DevTools Network tab. On fast connections, the pink highlighting disappears before you can see it!

## Architecture Overview

### Tech Stack

- **Astro**: Server-side rendering with TypeScript support
- **HTMX**: Declarative AJAX interactions via HTML attributes
- **DaisyUI + Tailwind**: Styling with semantic color classes
- **TypeScript**: Type safety for utilities and components
- **Lit v3**: Web Components for complex table headers (Level 4 escalation)
- **hx-optimistic**: HTMX extension for optimistic UI updates

### Clean Architecture Principles

The codebase follows modern best practices for maintainability and scalability:

#### 🔧 Modular Utilities

- **Configuration**: Centralized settings in `config.ts` with validation rules
- **Type Guards**: Runtime type validation in `type-guards.ts`
- **URL Building**: Centralized URL construction in `url-utils.ts`
- **DOM Helpers**: Type-safe element queries with runtime checks in `dom-utils.ts`
- **API Responses**: Consistent error handling in `api-response-utils.ts`

#### 📦 Full Type Safety

- Zero `any` types - everything is properly typed
- Global type definitions for Window, HTMX, and custom properties
- Strong typing for all utility functions and API responses

### Progressive Complexity Levels Used

This application demonstrates multiple complexity levels working together:

- **Level 2 (HTMX)**: 80% - Pagination, sorting, editing, deletion
- **Level 3 (Vanilla JS)**: 15% - Optimistic updates, error handling, keyboard shortcuts
- **Level 4 (Web Components)**: 5% - Dynamic table headers with search

### Component Architecture

The file structure reflects Progressive Complexity levels:

```
src/
├── middleware.ts            # JWT authentication middleware
├── components/
│   ├── web-components/      # Level 4: Complex stateful components
│   │   └── TableHeader.ts   # Search + sorting with debounced input (Lit v3)
│   ├── HomePageTable.astro  # Level 2: Server-rendered components
│   ├── ProductRow.astro     # Simple data display with HTMX attributes
│   ├── PriceCell.astro      # Inline price editing with optimistic updates
│   ├── QuantityCell.astro   # Inline quantity editing with optimistic updates
│   ├── SummaryHeader.astro  # Header with totals summary
│   ├── TotalsSummary.astro  # Read-only totals display
│   ├── UserWelcome.astro    # User display from JWT context
│   └── ApiResponse.astro    # Reusable API response wrapper
├── lib/
│   ├── config.ts            # Centralized configuration and validation rules
│   ├── type-guards.ts       # Runtime type validation and type predicates
│   ├── store.ts             # Product data store with validation
│   ├── api-utils.ts         # API parsing utilities
│   ├── api-response-utils.ts # Standardized API response handling
│   ├── page-utils.ts        # Client-side interaction utilities
│   ├── dom-utils.ts         # Type-safe DOM manipulation helpers
│   ├── url-utils.ts         # URL building and parameter utilities
│   ├── constants.ts         # App-wide constants (re-exports from config)
│   └── format.ts            # Data formatting helpers
└── types/
    ├── index.ts             # Core domain types
    └── global.d.ts          # Global type definitions (Window, HTMX, etc.)
```

**Key insight**: Most components stay at Level 2 (server-rendered Astro components). Only when we needed complex client-side state (debounced search with focus preservation that is reusable) did we escalate to Level 4 (Web Components). This keeps the bulk of the application simple while allowing sophisticated interactions where needed.

## Implementation Deep Dive

### HTMX Patterns (Level 2)

#### Semantic HTTP Verbs

```html
<!-- Update price -->
<input hx-patch="/api/products/1/price" hx-target="#table-wrapper" />

<!-- Delete product -->
<button hx-delete="/api/products/1" hx-target="#table-wrapper">Delete</button>

<!-- Pagination -->
<button
  hx-get="/?page=2&limit=10"
  hx-target="#table-wrapper"
  hx-push-url="true"
>
  Next
</button>
```

#### Smart Targeting and Swapping

```html
<!-- Target the wrapper, select the wrapper, swap the whole thing -->
<input
  hx-target="#table-wrapper"
  hx-select="#table-wrapper"
  hx-swap="outerHTML"
/>
```

**Why this pattern?**

- Prevents state inconsistencies
- Maintains scroll position
- Simpler than out-of-band swaps for complex updates
- Server renders complete, consistent state

#### URL and History Management

```html
<!-- Navigation actions update URL for bookmarkability -->
<button hx-get="/products?page=2" hx-target="#product-list" hx-push-url="true">
  Next Page
</button>

<!-- Edit actions don't update URL - they modify content in place -->
<button hx-delete="/products/123" hx-target="closest tr" hx-swap="outerHTML">
  Delete
</button>
```

**Bookmarkable URLs**: Users can bookmark and share table states including page, search terms, and sort order:

- `/?page=3&limit=10&sortBy=price&sortOrder=desc`
- `/?searchTerm=headphones&sortBy=name`

### Server-Side Rendering (All Levels)

#### API Route Structure

```typescript
// /src/pages/api/products/[id]/price.astro
import { createErrorResponse, validateNumericInput } from "../../../../lib/api-response-utils";

const id = Number(Astro.params.id);
const formData = await Astro.request.formData();

// Type-safe validation
const priceValidation = validateNumericInput(formData.get("price"), "price", 0);
if (priceValidation instanceof Response) {
  return priceValidation;
}

const price = priceValidation;

// Business logic validation
if (price === 99.99) {
  return createErrorResponse("Error: Price cannot be 99.99");
}

// Update data store
updateProductField(id, "price", price);

// Return updated HTML (not JSON!)
const { data } = getProducts({ /* current page params */ });
---
<TotalsSummary totals={totals} isOob={true} />
<div id="table-wrapper">
  <!-- Full table HTML -->
</div>
```

**Key principles:**

- **HTML responses**: Server renders HTML directly, no JSON + client templating
- **Component reuse**: Same `<ProductRow>` component used in pages and API responses
- **State preservation**: APIs read URL params to maintain current page/sort/search
- **Proper headers**: `Content-Type: text/html` for HTMX compatibility

### Optimistic Updates (Level 3)

#### The Flow

1. **User action** (blur/enter on input) triggers optimistic update via hx-optimistic
2. **Immediate feedback** (pink color, updated display using template)
3. **HTMX request** happens in background
4. **Server response** replaces optimistic display with authoritative data or triggers error template on failure

> ⚠️ **Network throttling recommended**: Use DevTools to throttle to "Slow 4G" to see the pink optimistic state before server confirmation.

#### Implementation

In `PriceCell.astro` and `QuantityCell.astro`:

```html
<input
  hx-ext="optimistic"
  data-id={String(product.id)}
  data-optimistic={JSON.stringify({
    template: `#hxopt-tpl-price`,
    errorTemplate: `#hxopt-tpl-price-error`,
  })}
/>
```

Global templates in `Layout.astro` use set:html to output literal placeholders.

Here is the hx-optimistic template code:

```html
<template id="hxopt-tpl-price">
  <span
    class="view optimistic-update"
    id={"view-price-" + "${data:id}"}
    tabindex="0"
    aria-live="polite"
    aria-atomic="true"
    onclick={`
      window.pageUtils.toggleEdit(${"${data:id}"}, true, 'price')
    `}
    onkeydown={`
      if (event.key === 'Enter' || event.key === ' ') {
        window.pageUtils.toggleEdit(${"${data:id}"}, true, 'price');
        event.preventDefault();
      }
    `}
    >{"${this.value}"}</span
  >
</template>
<template id="hxopt-tpl-price-error">
  <span
    class="view text-error"
    id={"view-price-" + "${data:id}"}
    >Error</span
  >
</template>
<template id="hxopt-tpl-qty">
  <span
    class="view optimistic-update"
    id={"view-qty-" + "${data:id}"}
    tabindex="0"
    aria-live="polite"
    aria-atomic="true"
    onclick={`
      window.pageUtils.toggleEdit(${"${data:id}"}, true, 'quantity')
    `}
    onkeydown={`
      if (event.key === 'Enter' || event.key === ' ') {
        window.pageUtils.toggleEdit(${"${data:id}"}, true, 'quantity');
        event.preventDefault();
      }
    `}
    >{"${this.value}"}</span
  >
</template>
<template id="hxopt-tpl-qty-error">
  <span
    class="view text-error"
    id={"view-qty-" + "${data:id}"}
    >Error</span
  >
</template>
```

In `page-utils.ts`, error handling and view state management:

```typescript
// Type-safe event handling
document.body.addEventListener("htmx:beforeSwap", (evt: CustomEvent) => {
  const status = evt?.detail?.xhr?.status;
  if (typeof status === "number" && status >= 400) {
    evt.detail.shouldSwap = false;
  }
});

document.body.addEventListener("optimistic:error", (evt: Event) => {
  const targetEl = evt?.target as HTMLElement | null;
  if (targetEl) ensureViewModeForTarget(targetEl);
});

document.body.addEventListener("optimistic:reverted", (evt: Event) => {
  const targetEl = evt?.target as HTMLElement | null;
  if (targetEl) ensureViewModeForTarget(targetEl);
});
```

### Error Handling

hx-optimistic handles errors using the errorTemplate, showing "Error" briefly before reverting to the previous value after a delay. The server remains the source of truth.

When server returns 500 status (e.g., price = 99.99), htmx:beforeSwap prevents the swap, allowing hx-optimistic to display the error template and revert.

### Web Components (Level 4)

#### Dynamic Table Headers with Lit v3

```typescript
// /src/components/web-components/TableHeader.ts
/// <reference path="../../types/global.d.ts" />
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators/custom-element.js";
import { property } from "lit/decorators/property.js";
import { buildUrl, type UrlParams } from "../../lib/url-utils";
import type { HtmxRequest } from "../../types/global";
import {
  DEBOUNCE_DELAY,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
} from "../../lib/constants";

@customElement("table-header")
export class TableHeader extends LitElement {
  // Use light DOM to work properly within table cells
  protected createRenderRoot() {
    return this;
  }

  private debounceTimer: number | null = null;
  private currentRequest: HtmxRequest | null = null;

  @property({ type: String, attribute: "label" }) label: string = "";
  @property({ type: String, attribute: "field" }) field:
    | "name"
    | "price"
    | "quantity" = "name";
  @property({ type: Boolean, attribute: "searchable", reflect: true })
  searchable = false;
  @property({ type: String, attribute: "sort-by" }) sortBy: string = "id";
  @property({ type: String, attribute: "sort-dir" }) sortDir: "asc" | "desc" =
    "asc";
  @property({ type: String, attribute: "search-term" }) searchTerm: string = "";
  @property({ type: String }) limit: string = String(DEFAULT_PAGE_SIZE);

  private restoreFocusFromGlobal() {
    if (typeof window === "undefined") return;
    const f = window.__th_focus;
    if (!f || f.field !== this.field) return;
    const input = this.querySelector(
      'input[name="searchTerm"]',
    ) as HTMLInputElement | null;
    if (input) {
      input.focus();
      if (typeof f.caretPos === "number") {
        const p = Math.min(f.caretPos, input.value.length);
        input.setSelectionRange(p, p);
      }
    }
    window.__th_focus = null;
  }

  firstUpdated() {
    this.restoreFocusFromGlobal();
  }

  updated() {
    this.restoreFocusFromGlobal();
  }

  private buildUrlWithParams(params: UrlParams): string {
    return buildUrl(params);
  }

  private getSortUrl(): string {
    const dir =
      this.sortBy === this.field && this.sortDir === "asc" ? "desc" : "asc";
    return this.buildUrlWithParams({
      sortBy: this.field,
      sortOrder: dir,
      page: DEFAULT_PAGE,
      limit: Number(this.limit),
      searchTerm: this.searchTerm,
    });
  }

  private updateTable(path: string, caretPos?: number | null) {
    if (typeof window === "undefined") return;
    const h = window.htmx;
    if (!h) return;

    if (
      this.currentRequest &&
      typeof this.currentRequest.abort === "function"
    ) {
      this.currentRequest.abort();
    }

    if (typeof caretPos !== "undefined") {
      window.__th_focus = { field: this.field, caretPos };
    }

    this.currentRequest = h.ajax("GET", path, {
      target: "#table-wrapper",
      select: "#table-wrapper",
      swap: "outerHTML",
      pushUrl: true,
    });
  }

  private onSort(e: Event) {
    if (typeof window === "undefined") return;
    e.preventDefault();
    const url = this.getSortUrl();
    const selector = `table-header[field="${this.field}"] input[name="searchTerm"]`;
    const input = document.querySelector(selector) as HTMLInputElement | null;
    const pos = input ? (input.selectionStart ?? input.value.length) : null;
    this.updateTable(url, pos);
  }

  private onSearchKeyUp(e: KeyboardEvent) {
    if (e.key !== "Enter") return;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    const url = this.buildUrlWithParams({
      searchTerm: this.searchTerm,
      page: DEFAULT_PAGE,
      limit: Number(this.limit),
      sortBy: this.sortBy,
      sortOrder: this.sortDir,
    });
    const active = document.activeElement as HTMLInputElement | null;
    const pos =
      active && active.name === "searchTerm" ? active.selectionStart : null;
    this.updateTable(url, pos);
  }

  private onSearchInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchTerm = input.value;
    if (typeof window === "undefined") return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => {
      const url = this.buildUrlWithParams({
        searchTerm: this.searchTerm,
        page: DEFAULT_PAGE,
        limit: Number(this.limit),
        sortBy: this.sortBy,
        sortOrder: this.sortDir,
      });
      const pos = input.selectionStart;
      this.updateTable(url, pos);
      this.debounceTimer = null;
    }, DEBOUNCE_DELAY);
  }

  render() {
    const up = this.sortBy === this.field && this.sortDir === "asc";
    const down = this.sortBy === this.field && this.sortDir === "desc";

    return html`
      <div
        id="table-header-sort-${this.field}"
        style="display: flex; align-items: center; gap: 0.5rem; ${this.label ===
        "Name"
          ? "justify-content: flex-start;"
          : "justify-content: flex-end;"}"
      >
        <a
          style="display: flex; align-items: center; padding: 0.25rem 0.5rem; background: transparent; border: none; font-size: 0.75rem; text-transform: none; font-weight: normal; cursor: pointer; text-decoration: none;"
          href=${this.getSortUrl()}
          @click=${this.onSort}
          aria-label="Sort by ${this.label}"
        >
          <span>${this.label}</span>
          <span
            style="display: flex; flex-direction: column; margin-left: 0.25rem; line-height: 1; font-size: 0.75rem;"
          >
            <span style="${up ? "color: #6366f1;" : "opacity: 0.5;"}"
              >${up ? "▲" : "△"}</span
            >
            <span style="${down ? "color: #6366f1;" : "opacity: 0.5;"}"
              >${down ? "▼" : "▽"}</span
            >
          </span>
        </a>
        ${this.searchable
          ? html`
              <form
                id="table-header-search-${this.field}"
                style="display: flex;"
              >
                <input type="hidden" name="page" value="1" />
                <input type="hidden" name="limit" .value=${this.limit} />
                <input type="hidden" name="sortBy" .value=${this.sortBy} />
                <input type="hidden" name="sortOrder" .value=${this.sortDir} />
                <input
                  name="searchTerm"
                  type="search"
                  style="padding: 0.25rem 0.5rem; border: 1px solid #d1d5db; font-size: 0.75rem; width: 6rem;"
                  placeholder="Search"
                  .value=${this.searchTerm}
                  @input=${this.onSearchInput}
                  @keyup=${this.onSearchKeyUp}
                  aria-label="Search by ${this.label.toLowerCase()}"
                />
              </form>
            `
          : null}
      </div>
    `;
  }
}
```

**Why Web Components here?**

- Encapsulates complex state (search debouncing)
- Reusable across different table columns
- Integrates cleanly with HTMX (no conflicts)

### State Management Philosophy

#### Server as Source of Truth

```html
<!-- Store state in data attributes -->
<tr id="row-1" data-price="123.45" data-quantity="7">
  <!-- Server calculates and renders everything -->
  <td>$123.45</td>
  <td>7</td>
  <td>$864.15</td>
  <!-- subtotal calculated server-side -->
</tr>
```

#### Why Not Client-Side Totals?

```typescript
// ❌ DON'T: Calculate totals from visible rows
const visibleRows = document.querySelectorAll("tr[data-price]");
const total = Array.from(visibleRows).reduce(
  (sum, row) => sum + parseFloat(row.dataset.price),
  0,
);

// ✅ DO: Let server calculate totals from full dataset
// Server knows about ALL products, not just current page
```

**Pagination trap:** Client only sees current page, so client calculations are always wrong.

### TypeScript Integration (Comprehensive Type Safety)

#### Core Domain Types

```typescript
// /src/types/index.ts - Full type safety across the application
export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description?: string;
}

export interface ProductTotals {
  totalPrice: number;
  totalQuantity: number;
  grandTotal: number;
  averagePrice: number;
  productCount: number;
}

// Type aliases for better readability
export type SortOrder = "asc" | "desc";
```

#### Validation Layer

```typescript
// Centralized validation rules from config.ts
import { VALIDATION_RULES } from './config';

// Type-safe validation with configurable rules
const priceValidation = validateNumericInput(
  price,
  "price",
  VALIDATION_RULES.MIN_PRICE,
  VALIDATION_RULES.MAX_PRICE
);

// Demo validation rule (configurable)
if (price === VALIDATION_RULES.FORBIDDEN_PRICE) {
  return createErrorResponse(`Error: Price cannot be ${VALIDATION_RULES.FORBIDDEN_PRICE}`);
}
```

#### Global Type Definitions

The application uses TypeScript's global declarations to provide type safety for HTMX integration and utility functions, ensuring compile-time safety across client-side code.

#### Global Type Augmentation

````typescript
// Window augmentation for type-safe globals
declare global {
  interface Window {
    pageUtils: {
      toggleEdit: typeof toggleEdit;
      handleOptimisticUpdate: typeof handleOptimisticUpdate;
      // All utilities fully typed
    };
  }
}
```

### CSS Architecture

#### Tailwind + DaisyUI Classes

```css
/* Use semantic theme colors */
.optimistic-update {
  @apply text-secondary !important; /* Pink in pastel theme */
  transition: color 0.3s ease;
}

.error-container {
  @apply text-error text-xs font-semibold bg-red-50 border-2 border-error;
}
````

#### Edit Mode Styling

```css
.edit {
  @apply hidden;
}
.view {
  @apply inline-block;
}
.right {
  @apply text-right;
}
```

**Simple, predictable:** No complex CSS-in-JS, no styled-components, just utility classes.

### Server-Side Middleware (Authentication)

#### JWT Authentication Middleware

```typescript
// /src/middleware.ts - Single middleware for JWT parsing and user context
export const onRequest = defineMiddleware(async (context, next) => {
  // Step 1: Extract JWT from Authorization header or use demo token
  const token = extractJWT(context.request);

  if (token) {
    // Step 2: Parse JWT payload (demo: no signature verification)
    const jwtPayload = parseJWT(token);

    if (jwtPayload) {
      context.locals.jwt = jwtPayload;
      console.log(`JWT parsed for user: ${jwtPayload.username}`);

      // Step 3: Fetch user from "database"
      const user = await getUser(jwtPayload.userId);

      if (user) {
        context.locals.user = user;
        console.log(`User context loaded: ${user.name} (@${user.username})`);
      }
    }
  }

  return next(); // Continue to route handler
});
```

**Demo JWT Token** (for demonstration purposes only):

```javascript
// Payload: { userId: 1, username: "stew_loren", role: "admin", ... }
const DEMO_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQi...";
// Note: In production, use proper JWT library with signature verification
```

#### Simplified JWT-Only Approach

```typescript
// No separate user service needed - use JWT data directly
export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.jwt = null;

  const token = extractJWT(context.request);

  if (token) {
    const jwtPayload = parseJWT(token);

    if (jwtPayload) {
      context.locals.jwt = jwtPayload; // All user data from JWT
      console.log(
        `JWT parsed for user: ${jwtPayload.username} (${jwtPayload.role})`,
      );
    }
  }

  return next();
});
```

#### Accessing JWT Data in Components

```astro
---
// Any Astro component can access JWT data from middleware
const { jwt } = Astro.locals;
---

<div class="user-welcome">
  {
    jwt ? (
      <span>
        Welcome, {jwt.username}! ({jwt.role})
      </span>
    ) : (
      <span>Anonymous User</span>
    )
  }

  {jwt && <div class="badge badge-success">JWT Active</div>}
</div>
```

#### Type Safety for Middleware

```typescript
// Global type augmentation for Astro.locals
declare global {
  namespace App {
    interface Locals {
      jwt: JWTPayload | null;
    }
  }
}
```

**Why Middleware at This Level?**

- **Server-side authentication**: No client-side token exposure or manipulation
- **Universal access**: `Astro.locals.jwt` available in all routes and components
- **Performance**: Single JWT parse per request, cached in context
- **Security**: JWT validation happens before any route logic
- **Progressive Enhancement**: Works with or without JavaScript enabled

### Accessibility

- Focus restoration after swaps for continuity
- Single-click to edit with keyboard activation (Tab focus, Enter/Space to activate)
- Totals region announced with `role="status"` and `aria-live="polite"`
- Cell values use `aria-live` and `aria-atomic` to announce transient error text

### Progressive Enhancement (No‑JS)

- Pagination and sorting work without JavaScript via real links
- Column search input and inline editing are progressively enhanced and require JS/HTMX

### Error UX

- Fields show a brief optimistic visual change. On server error (e.g., price 99.99), the field displays a red “Error” and then reverts to the last server value. Server remains the source of truth for totals.

## Production Scalability

### **When This Approach Scales**

This architecture handles:

- **High traffic**: Server-rendered HTML scales better than SPAs
- **Large datasets**: Server-side filtering, sorting, pagination
- **Complex business logic**: Stays on server where it belongs
- **Team growth**: Any backend developer can contribute
- **Feature additions**: HTML + HTMX attributes, no client refactoring

### **Scaling Patterns**

**Database Optimization:**

```typescript
// Server handles complex queries
const products = await db.products
  .where("category", category)
  .where("price", ">", minPrice)
  .orderBy(sortField, sortDirection)
  .limit(pageSize)
  .offset((page - 1) * pageSize);
```

**Caching Strategies:**

- **Full page caching**: CDN serves HTML directly
- **Component caching**: Cache server-rendered partials
- **Database caching**: Redis for frequently accessed data

**Team Scaling:**

- Backend developers own the full feature lifecycle
- Frontend specialists focus on Level 4/5 components when needed
- No frontend/backend coordination for simple features

## Further Reading

- **[Progressive Complexity Manifesto](progressive-complexity-manifesto.md)**: The philosophy behind this approach
- **[HTMX Documentation](https://htmx.org/docs/)**: Deep dive into HTMX patterns
- **[Astro Documentation](https://docs.astro.build/)**: Server-side rendering with islands architecture
- **[Lit Web Components](https://lit.dev/)**: When and how to escalate to Level 4

## Contributing

Found a bug? Want to improve the implementation?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

This demo proves that **many web applications don't need framework complexity**. Server-rendered HTML + HTMX + minimal JavaScript delivers better performance, simpler maintenance, and happier developers.

Start simple. Escalate with purpose. The web awaits its renaissance.
