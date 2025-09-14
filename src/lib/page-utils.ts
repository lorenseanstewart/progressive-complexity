import { formatCurrency } from "./format";

interface FocusInfo {
  id: string;
  field: "price" | "quantity";
}

export function toggleEdit(
  id: number | string,
  editing: boolean,
  field: "price" | "quantity" | null = null,
): void {
  const tr = document.getElementById(`row-${id}`);
  if (!tr) return;

  if (field) {
    const fieldIdMap: Record<string, string> = {
      price: "price",
      quantity: "qty",
    };
    const fieldId = fieldIdMap[field] || field;

    const cell = tr
      .querySelector(`#view-${fieldId}-${id}`)
      ?.closest("td") as HTMLTableCellElement | null;

    if (cell) {
      const viewEl = cell.querySelector(".view") as HTMLElement | null;
      const editEl = cell.querySelector(".edit") as HTMLElement | null;

      if (viewEl && editEl) {
        if (editing) {
          viewEl.style.display = "none";
          editEl.style.display = "block";
        } else {
          viewEl.style.display = "block";
          editEl.style.display = "none";
        }

        if (editing) {
          const input = editEl.querySelector(
            "input",
          ) as HTMLInputElement | null;
          if (input) {
            requestAnimationFrame(() => {
              input.focus();
              input.select();
            });
          }
        }
      }
    }
  }
}

export function exitEditMode(input: HTMLInputElement): void {
  const tr = input.closest("tr");
  if (!tr) return;

  const id = tr.id.replace("row-", "");
  const field = input.name === "quantity" ? "qty" : "price";
  const viewSpan = document.getElementById(`view-${field}-${id}`);
  const editSpan = input.closest(".edit") as HTMLElement | null;

  if (viewSpan && editSpan) {
    viewSpan.style.display = "";
    editSpan.style.display = "none";
  }
}

export function exitEditModeAfterSubmit(input: HTMLInputElement): void {
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
  if (evt.key !== "Escape") return;

  // Reset the input value to original
  const originalValue = input.defaultValue || input.getAttribute("value") || "";
  input.value = originalValue;

  exitEditMode(input);

  const tr = input.closest("tr");
  if (!tr) return;
  const id = tr.id.replace("row-", "");
  const field = input.name === "quantity" ? "qty" : "price";
  const viewSpan = document.getElementById(`view-${field}-${id}`);
  if (viewSpan) viewSpan.focus();
}

export function restoreFocus(): void {
  const info = (window as any).__lastFocus as FocusInfo | null;
  if (!info) return;

  const tr = document.getElementById(`row-${info.id}`);
  if (!tr) return;

  const view =
    info.field === "price"
      ? (tr.querySelector(`#view-price-${info.id}`) as HTMLElement | null)
      : (tr.querySelector(`#view-qty-${info.id}`) as HTMLElement | null);

  if (view) {
    view.focus();
  }

  (window as any).__lastFocus = null;
}

// Define the global pageUtils interface for type safety
declare global {
  interface Window {
    pageUtils: {
      toggleEdit: typeof toggleEdit;
      exitEditMode: typeof exitEditMode;
      exitEditModeAfterSubmit: typeof exitEditModeAfterSubmit;
      restoreFocus: typeof restoreFocus;
      cancelOnEscape: typeof cancelOnEscape;
      formatCurrency: typeof formatCurrency;
    };
    __lastFocus: FocusInfo | null;
  }
}

// by adding these functions to the window object,
// we can use them in html (Astro components in this case)
window.pageUtils = {
  toggleEdit,
  exitEditMode,
  exitEditModeAfterSubmit,
  restoreFocus,
  cancelOnEscape,
  formatCurrency,
};

document.body.addEventListener("htmx:beforeSwap", (evt: any) => {
  const status = evt?.detail?.xhr?.status;
  if (typeof status === "number" && status >= 400) {
    evt.detail.shouldSwap = false;
  }
});

function ensureViewModeForTarget(targetEl: HTMLElement): void {
  if (!targetEl) return;
  const targetId = targetEl.id || "";
  const isPrice = targetId.startsWith("price-cell-");
  const isQty = targetId.startsWith("qty-cell-");
  if (!isPrice && !isQty) return;

  const id = targetId.replace("price-cell-", "").replace("qty-cell-", "");
  const tr = document.getElementById(`row-${id}`);
  if (!tr) return;

  const cell = isPrice
    ? (tr.querySelector(`#price-cell-${id}`) as HTMLElement | null)
    : (tr.querySelector(`#qty-cell-${id}`) as HTMLElement | null);
  if (!cell) return;

  const viewEl = cell.querySelector(".view") as HTMLElement | null;
  const editEl = cell.querySelector(".edit") as HTMLElement | null;
  if (viewEl) viewEl.style.display = "";
  if (editEl) editEl.style.display = "none";
}

document.body.addEventListener("optimistic:error", (evt: any) => {
  const targetEl = (evt?.target || null) as HTMLElement | null;
  if (targetEl) ensureViewModeForTarget(targetEl);
});

document.body.addEventListener("optimistic:reverted", (evt: any) => {
  const targetEl = (evt?.target || null) as HTMLElement | null;
  if (targetEl) ensureViewModeForTarget(targetEl);
});
