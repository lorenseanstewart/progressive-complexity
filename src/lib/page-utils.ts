/// <reference path="../types/global.d.ts" />
import type { HtmxBeforeSwapEvent, OptimisticEvent } from "../types/global";
import { formatCurrency } from "./format";
import {
  getElementById,
  querySelector,
  toggleElements,
  focusInput,
  getRowId,
  getTableCell,
} from "./dom-utils";

export function toggleEdit(
  id: number | string,
  editing: boolean,
  field: "price" | "quantity" | null = null,
): void {
  if (typeof document === 'undefined') return;

  const tr = getElementById<HTMLTableRowElement>(`row-${id}`);
  if (!tr) return;

  if (field) {
    const fieldIdMap: Record<string, string> = {
      price: "price",
      quantity: "qty",
    };
    const fieldId = fieldIdMap[field] || field;

    const cell = querySelector<HTMLTableCellElement>(
      `#view-${fieldId}-${id}`,
      tr
    )?.closest("td") as HTMLTableCellElement | null;

    if (cell) {
      const viewEl = querySelector<HTMLElement>(".view", cell);
      const editEl = querySelector<HTMLElement>(".edit", cell);

      if (editing) {
        toggleElements(editEl, viewEl);
        const input = querySelector<HTMLInputElement>("input", editEl || cell);
        focusInput(input);
      } else {
        toggleElements(viewEl, editEl);
      }
    }
  }
}

export function exitEditMode(input: HTMLInputElement): void {
  if (typeof document === 'undefined') return;

  const id = getRowId(input);
  if (!id) return;

  const field = input.name === "quantity" ? "qty" : "price";
  const viewSpan = getElementById(`view-${field}-${id}`);
  const editSpan = input.closest(".edit") as HTMLElement | null;

  toggleElements(viewSpan, editSpan);
}

export function exitEditModeAfterSubmit(input: HTMLInputElement): void {
  // Only run in browser environment
  if (typeof document === 'undefined') return;

  const originalValue = input.defaultValue || input.getAttribute("value");
  const currentValue = input.value;

  // Only exit edit mode if the value has changed (triggering a submit)
  // If the value hasn't changed, we need to exit edit mode manually
  if (originalValue === currentValue) {
    exitEditMode(input);
  }
  // If value changed, hx-optimistic will handle the UI update
}

export function cancelOnEscape(
  evt: KeyboardEvent,
  input: HTMLInputElement,
): void {
  if (typeof document === 'undefined') return;
  if (evt.key !== "Escape") return;

  // Reset the input value to original
  const originalValue = input.defaultValue || input.getAttribute("value") || "";
  input.value = originalValue;

  exitEditMode(input);

  const id = getRowId(input);
  if (!id) return;

  const field = input.name === "quantity" ? "qty" : "price";
  const viewSpan = getElementById(`view-${field}-${id}`);
  if (viewSpan) viewSpan.focus();
}

export function restoreFocus(): void {
  if (typeof window === 'undefined') return;

  const info = window.__lastFocus;
  if (!info) return;

  const tr = getElementById<HTMLTableRowElement>(`row-${info.id}`);
  if (!tr) return;

  const fieldType = info.field === "price" ? "price" : "qty";
  const view = querySelector<HTMLElement>(`#view-${fieldType}-${info.id}`, tr);

  if (view) {
    view.focus();
  }

  window.__lastFocus = null;
}

// Type definitions are now in src/types/global.d.ts

// by adding these functions to the window object,
// we can use them in html (Astro components in this case)
// Only assign to window in browser environment
if (typeof window !== 'undefined') {
  window.pageUtils = {
    toggleEdit,
    exitEditMode,
    exitEditModeAfterSubmit,
    restoreFocus,
    cancelOnEscape,
    formatCurrency,
  };
}

// Only add event listeners in browser environment
if (typeof document !== 'undefined') {
  document.body.addEventListener("htmx:beforeSwap", (evt: Event) => {
    const status = (evt as HtmxBeforeSwapEvent)?.detail?.xhr?.status;
    if (typeof status === "number" && status >= 400) {
      (evt as HtmxBeforeSwapEvent).detail.shouldSwap = false;
    }
  });

  function ensureViewModeForTarget(targetEl: HTMLElement): void {
    if (!targetEl) return;
    const targetId = targetEl.id || "";
    const isPrice = targetId.startsWith("price-cell-");
    const isQty = targetId.startsWith("qty-cell-");
    if (!isPrice && !isQty) return;

    const id = targetId.replace("price-cell-", "").replace("qty-cell-", "");
    const cellType = isPrice ? "price" : "qty";
    const cell = getTableCell(id, cellType);
    if (!cell) return;

    const viewEl = querySelector<HTMLElement>(".view", cell);
    const editEl = querySelector<HTMLElement>(".edit", cell);
    toggleElements(viewEl, editEl);
  }

  document.body.addEventListener("optimistic:error", (evt: Event) => {
    const targetEl = (evt as OptimisticEvent)?.target || null;
    if (targetEl) ensureViewModeForTarget(targetEl);
  });

  document.body.addEventListener("optimistic:reverted", (evt: Event) => {
    const targetEl = (evt as OptimisticEvent)?.target || null;
    if (targetEl) ensureViewModeForTarget(targetEl);
  });
}
