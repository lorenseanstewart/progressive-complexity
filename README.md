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
- **Type-Safe**: Full TypeScript coverage with zero `any` types
- **DRY Code**: Centralized utilities and shared constants
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
- **URL Building**: Centralized URL construction in `url-utils.ts`
- **Constants**: App-wide settings in `constants.ts` (DEFAULT_PAGE, DEFAULT_PAGE_SIZE, etc.)
- **DOM Helpers**: Type-safe element queries in `dom-utils.ts`
- **API Responses**: Consistent error handling in `api-response-utils.ts`

#### 📦 Full Type Safety
- Zero `any` types - everything is properly typed
- Global type definitions for Window, HTMX, and custom properties
- Strong typing for all utility functions and API responses

#### ♻️ DRY Code
- Shared URL building logic across components
- Consistent error response patterns
- Reusable DOM manipulation patterns

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
│   ├── store.ts             # Product data store
│   ├── api-utils.ts         # API parsing utilities
│   ├── api-response-utils.ts # Standardized API response handling
│   ├── page-utils.ts        # Client-side interaction utilities
│   ├── dom-utils.ts         # DOM manipulation helpers
│   ├── url-utils.ts         # URL building and parameter utilities
│   ├── constants.ts         # Centralized app-wide constants
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
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators/custom-element.js";
import { property } from "lit/decorators/property.js";
import { buildUrl } from "../../lib/url-utils";
import { DEBOUNCE_DELAY, DEFAULT_PAGE_SIZE } from "../../lib/constants";

@customElement("table-header")
export class TableHeader extends LitElement {
  // Use light DOM to work properly within table cells
  protected createRenderRoot() {
    return this;
  }

  private debounceTimer: number | null = null;

  @property({ type: String, attribute: "label" })
  label = "";

  @property({ type: String, attribute: "field" })
  field: "name" | "price" | "quantity" = "name";

  @property({ type: Boolean, attribute: "searchable", reflect: true })
  searchable = false;

  @property({ type: String, attribute: "sort-by" })
  sortBy = "id";

  @property({ type: String, attribute: "sort-dir" })
  sortDir: "asc" | "desc" = "asc";

  @property({ type: String, attribute: "search-term" })
  searchTerm = "";

  @property({ type: String })
  limit = String(DEFAULT_PAGE_SIZE);

  private getSortUrl(): string {
    const dir = this.sortBy === this.field && this.sortDir === "asc" ? "desc" : "asc";
    return buildUrl({
      sortBy: this.field,
      sortOrder: dir,
      page: DEFAULT_PAGE,
      limit: Number(this.limit),
      searchTerm: this.searchTerm,
    });
  }

  private onSearchInput(e: Event) {
    // Debounced search with DEBOUNCE_DELAY constant
    // Full implementation in TableHeader.ts
  }

  render() {
    const up = this.sortBy === this.field && this.sortDir === "asc";
    const down = this.sortBy === this.field && this.sortDir === "desc";

    return html`
      <div class="flex items-center gap-2">
        <a
          class="btn btn-ghost btn-xs normal-case font-normal justify-start cursor-pointer"
          href=${this.getSortUrl()}
          hx-get=${this.getSortUrl()}
          hx-target="#table-wrapper"
          hx-select="#table-wrapper"
          hx-swap="outerHTML"
          hx-push-url="true"
          aria-label="Sort by ${this.label}"
        >
          <span>${this.label}</span>
          <span class="flex flex-col ml-1 leading-none text-xs">
            <span class="${up ? "text-primary" : "opacity-50"}"
              >${up ? "▲" : "△"}</span
            >
            <span class="${down ? "text-primary" : "opacity-50"}"
              >${down ? "▼" : "▽"}</span
            >
          </span>
        </a>
        ${this.searchable
          ? html`
              <form
                class="search-form flex"
                method="GET"
                action="/"
                hx-get="/"
                hx-target="#table-wrapper"
                hx-select="#table-wrapper"
                hx-swap="outerHTML"
                hx-push-url="true"
              >
                <input type="hidden" name="page" value="1" />
                <input type="hidden" name="limit" .value=${this.limit} />
                <input type="hidden" name="sortBy" .value=${this.sortBy} />
                <input type="hidden" name="sortOrder" .value=${this.sortDir} />
                <input
                  name="searchTerm"
                  type="search"
                  class="input input-bordered input-xs w-24"
                  placeholder="Search"
                  .value=${this.searchTerm}
                  @input=${this.onSearchInput}
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
// Simple validation in API routes
if (price === 99.99) {
  return new Response(`Error: Price cannot be 99.99`, {
    status: 500,
    headers: { "Content-Type": "text/html" },
  });
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

**Demo JWT Token** (hardcoded for development):

```javascript
// Payload: { userId: 1, username: "stew_loren", role: "admin", ... }
const DEMO_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQi...";
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
- **Simplicity**: All user data comes from JWT - no additional database calls
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

## Why Progressive Complexity Works

### **The Framework Problem**

Traditional framework approaches require:

- **Hydration overhead**: Client must reconstruct server state
- **Bundle size explosion**: Framework + app code + dependencies
- **Complexity cascade**: Simple features require complex abstractions
- **Development overhead**: Build tools, hot reload, state management

### **The Progressive Complexity Solution**

Our approach eliminates these problems:

- **No hydration**: HTML is already interactive via HTMX
- **Minimal JavaScript**: Only what's needed for polish and enhancement
- **Direct DOM manipulation**: When needed, target exactly what should change
- **Server authority**: Single source of truth, no synchronization bugs

### **Concrete Comparison: Adding a Search Feature**

**Framework Approach (React):**

```jsx
const [searchTerm, setSearchTerm] = useState('');
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);

const debouncedSearch = useMemo(
  () => debounce(async (term) => {
    setLoading(true);
    const response = await fetch(`/api/search?q=${term}`);
    const data = await response.json();
    setResults(data.results);
    setLoading(false);
  }, 300),
  []
);

useEffect(() => {
  if (searchTerm) debouncedSearch(searchTerm);
}, [searchTerm, debouncedSearch]);

return (
  <input
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search..."
  />
  {loading && <Spinner />}
  {results.map(result => <ResultItem key={result.id} {...result} />)}
);
```

**Progressive Complexity Approach:**

```html
<input
  hx-get="/api/search"
  hx-trigger="keyup changed delay:300ms"
  hx-target="#results"
  placeholder="Search..."
/>
<div id="results"></div>
```

**Result**: 3 lines vs 25+ lines. Server handles debouncing, state, and rendering.

## Performance Characteristics

### Bundle Analysis

- **Total JavaScript**: 76.5 kB uncompressed (25.8 kB gzipped)
  - HTMX: 47.0 kB (15.3 kB gzipped)
  - Application code: 21.3 kB (7.6 kB gzipped)
  - hx-optimistic: 8.3 kB (2.9 kB gzipped)
- **TypeScript Implementation**:
  - **37 lines** of clean type definitions in `/src/types/index.ts`
  - **Full type coverage** across store, API utilities, and formatting
  - **Simple, effective type safety** without complexity overhead

> ⚠️ **Measurement Note**: Run `npm run build && npm run report` to see actual production sizes. The dev server (`npm run dev`) includes development tools that don't ship to production.

### Runtime Performance

- **First Contentful Paint**: Immediate (server-rendered HTML)
- **Time to Interactive**: ~50ms (HTMX initialization)
- **Interaction Latency**: 0ms (optimistic updates)
- **Memory Usage**: Minimal (no virtual DOM, no large state trees)

### Network Efficiency

- **HTML responses** are smaller than JSON + client templates
- **Partial updates** via HTMX (only table content changes)
- **Progressive enhancement** (graceful degradation)

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

## Migration Strategies

### **From React to Progressive Complexity**

**Step 1: Identify Page Types**

- **Static-heavy pages**: Start here (product pages, articles)
- **Form-heavy pages**: Perfect for HTMX
- **Complex interactive**: Keep React initially, migrate last

**Step 2: Replace Simple Interactions**

```jsx
// Before: React form submission
const handleSubmit = async (formData) => {
  setLoading(true);
  const response = await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  if (response.ok) {
    setMessage('Success!');
  }
  setLoading(false);
};

// After: HTMX form
<form hx-post="/api/contact" hx-target="#message">
  <!-- form fields -->
  <button type="submit">Submit</button>
</form>
<div id="message"></div>
```

**Step 3: Extract Reusable Components**
Move shared logic to server-side templates or Web Components

**Step 4: Optimize Bundle**
Remove unused React code, measure improvements

### **From jQuery to Progressive Complexity**

**Perfect Migration Path:**

- Keep existing server-rendered pages
- Replace jQuery AJAX with HTMX attributes
- Move complex interactions to Lit Web Components
- No full rewrite required

## Common Patterns

### Adding New Editable Fields

1. **Add to ProductRow.astro**:

```html
<td>
  <span class="view" id="view-status-{product.id}"> {product.status} </span>
  <span class="edit" style="display:none;">
    <select
      hx-patch="/api/products/{product.id}/status"
      hx-target="#table-wrapper"
    >
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </span>
</td>
```

2. **Create API endpoint** (`/api/products/[id]/status.astro`):

```typescript
const status = formData.get("status");
updateProductField(id, "status", status);
// Return full table HTML
```

3. **Add to page-utils.ts** (if special handling needed):

```typescript
// Extend handleOptimisticUpdate for new field types
```

### Adding New Table Features

1. **Add table header**:

```html
<th>
  <table-header label="Status" field="status" searchable></table-header>
</th>
```

2. **Update server filtering**:

```typescript
// Add to getProducts function
if (searchTerm && searchField === "status") {
  filtered = filtered.filter((p) => p.status.includes(searchTerm));
}
```

## Testing the Application

### Development Setup

```bash
npm install      # Install dependencies
npm run dev      # Start dev server on http://localhost:4322
```

### Key Features to Test

1. **Pagination & Navigation**: Browse through pages with bookmarkable URLs
2. **Inline Editing**: Click price/quantity cells to edit, Enter to save, Escape to cancel
3. **Column Sorting**: Click headers to sort, with visual indicators
4. **Search**: Type in column headers for debounced search with focus preservation
5. **Error Handling**: Try entering 99.99 as a price to see error handling
6. **Optimistic Updates**: Throttle network to see pink highlighting during updates

### Production Build

```bash
npm run build    # Build for production
npm run preview  # Preview production build on http://localhost:4321
npm run report   # Generate bundle size report
```

## Deployment

### Build Process

```bash
npm run build    # Generates static files + server routes
npm start        # Preview production build
```

### Static + Server Routes

- **Static pages**: Pre-rendered at build time
- **API routes**: Server-side functions for data operations
- **Assets**: Optimized CSS/JS bundles

### Hosting Options

- **Vercel/Netlify**: Zero-config deployment
- **Docker**: Standard Node.js container
- **Traditional hosting**: Any server that runs Node.js

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

This demo proves that **most web applications don't need framework complexity**. Server-rendered HTML + HTMX + minimal JavaScript delivers better performance, simpler maintenance, and happier developers.

Start simple. Escalate with purpose. The web awaits its renaissance.
