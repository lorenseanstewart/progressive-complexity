import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("table-header")
export class TableHeader extends LitElement {
  // Use light DOM to work properly within table cells
  protected createRenderRoot() {
    return this;
  }

  private debounceTimer: number | null = null;
  private _isFirstUpdate = true;

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
  @property({ type: String }) limit: string = "10";

  connectedCallback() {
    super.connectedCallback();
    this._isFirstUpdate = true;
  }

  willUpdate() {
    // Only clear content on first update after connection
    // This prevents duplication from cached HTML whe a user
    // presses the back for forward buttons on the browser
    if (this._isFirstUpdate) {
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }
      this._isFirstUpdate = false;
    }
  }

  private buildUrl(params: Record<string, string>): string {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.pathname + url.search;
  }

  private getSortUrl(): string {
    const dir =
      this.sortBy === this.field && this.sortDir === "asc" ? "desc" : "asc";
    return this.buildUrl({
      sortBy: this.field,
      sortOrder: dir,
      page: "1",
      limit: this.limit,
      searchTerm: this.searchTerm,
    });
  }

  private onSearchInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchTerm = input.value;

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = window.setTimeout(() => {
      const searchForm = this.querySelector(".search-form") as HTMLFormElement;
      if (searchForm) {
        const action = this.buildUrl({
          searchTerm: this.searchTerm,
          page: "1",
          limit: this.limit,
          sortBy: this.sortBy,
          sortOrder: this.sortDir,
        });
        searchForm.action = action;

        const inputEl = searchForm.querySelector(
          'input[name="searchTerm"]',
        ) as HTMLInputElement | null;
        if (inputEl) inputEl.value = this.searchTerm;

        const active = document.activeElement as HTMLInputElement | null;
        const pos = active === input ? input.selectionStart : null;

        const handleAfterRequest = () => {
          setTimeout(() => {
            const newInput = document.querySelector(
              `table-header[field="${this.field}"] input[name="searchTerm"]`,
            ) as HTMLInputElement | null;
            if (newInput && pos !== null) {
              newInput.focus();
              newInput.setSelectionRange(pos, pos);
            }
          }, 10);
          document.body.removeEventListener(
            "htmx:afterRequest",
            handleAfterRequest,
          );
        };
        document.body.addEventListener("htmx:afterRequest", handleAfterRequest);

        searchForm.requestSubmit();
      }
      this.debounceTimer = null;
    }, 300);
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
