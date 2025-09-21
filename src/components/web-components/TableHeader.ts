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
