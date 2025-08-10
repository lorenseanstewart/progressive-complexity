import { formatCurrency } from "./format";

interface FocusInfo {
  id: string;
  field: string;
}

export function toggleEdit(
  id: number | string,
  editing: boolean,
  field: string | null = null,
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

export function handleOptimisticUpdate(input: HTMLInputElement): void {
  const tr = input.closest("tr");
  if (!tr) return;

  const key = input.name === "quantity" ? "quantity" : "price";
  const id = tr.id.replace("row-", "");

  (window as any).__lastFocus = { id, field: key };

  const fieldName = key === "quantity" ? "qty" : "price";
  const viewElement = document.getElementById(`view-${fieldName}-${id}`);
  const editElement = input.closest(".edit") as HTMLElement | null;
  const subtotalElement = document.getElementById(`view-sub-${id}`);
  const errorContainer = document.getElementById(`error-${id}-${key}`);
  if (errorContainer) {
    errorContainer.textContent = "";
  }

  if (viewElement && editElement) {
    const newValue = input.value;

    if (key === "price") {
      viewElement.textContent = formatCurrency(parseFloat(newValue));
    } else {
      viewElement.textContent = newValue;
    }

    viewElement.classList.add("optimistic-update");

    editElement.style.display = "none";
    viewElement.style.display = "";
  }

  if (subtotalElement) {
    const price =
      key === "price"
        ? parseFloat(input.value)
        : parseFloat(tr.getAttribute("data-price") || "0");
    const quantity =
      key === "quantity"
        ? parseInt(input.value)
        : parseInt(tr.getAttribute("data-quantity") || "0");
    const newSubtotal = price * quantity;
    subtotalElement.textContent = formatCurrency(newSubtotal);
    subtotalElement.classList.add("optimistic-update");
  }

  const totalAmount = document.getElementById("total-amount");
  const totalItems = document.getElementById("total-items");
  if (totalAmount) totalAmount.classList.add("optimistic-update");
  if (totalItems) totalItems.classList.add("optimistic-update");
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

export function cancelOnEscape(
  evt: KeyboardEvent,
  input: HTMLInputElement,
): void {
  if (evt.key !== "Escape") return;
  exitEditMode(input);

  const tr = input.closest("tr");
  if (!tr) return;
  const id = tr.id.replace("row-", "");
  const field = input.name === "quantity" ? "qty" : "price";
  const viewSpan = document.getElementById(`view-${field}-${id}`);
  if (viewSpan) viewSpan.focus();
}

export function handleEnterOptimistic(
  event: KeyboardEvent,
  input: HTMLInputElement,
): void {
  if (event.key !== "Enter") return;

  const originalValue = input.defaultValue || input.getAttribute("value");
  const currentValue = input.value;

  if (originalValue !== currentValue) {
    handleOptimisticUpdate(input);
  }
}

export function handleBlurOptimistic(input: HTMLInputElement): void {
  const originalValue = input.defaultValue || input.getAttribute("value");
  const currentValue = input.value;

  if (originalValue !== currentValue) {
    handleOptimisticUpdate(input);
  } else {
    exitEditMode(input);
  }
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

function handleResponseError(input: HTMLInputElement, event: any): void {
  if (event.detail.xhr && event.detail.xhr.status === 500) {
    const tr = input.closest("tr");
    if (tr) {
      const productId = tr.id.replace("row-", "");
      const fieldType = input.name;
      const viewElement = document.getElementById(
        `view-${fieldType === "price" ? "price" : "qty"}-${productId}`,
      );

      if (viewElement) viewElement.classList.remove("optimistic-update");
      const subtotalElement = document.getElementById(`view-sub-${productId}`);
      if (subtotalElement)
        subtotalElement.classList.remove("optimistic-update");
      const totalAmount = document.getElementById("total-amount");
      const totalItems = document.getElementById("total-items");
      if (totalAmount) totalAmount.classList.remove("optimistic-update");
      if (totalItems) totalItems.classList.remove("optimistic-update");

      if (viewElement) {
        viewElement.classList.add("text-error");
        viewElement.textContent = "Error";
      }

      setTimeout(() => {
        const originalValue =
          input.defaultValue || input.getAttribute("value") || "";
        input.value = originalValue;
        if (viewElement) {
          if (fieldType === "price") {
            viewElement.textContent = formatCurrency(parseFloat(originalValue));
          } else {
            viewElement.textContent = originalValue;
          }
          setTimeout(() => {
            viewElement.classList.remove("text-error");
          }, 1000);
        }
        if (subtotalElement) {
          const price = parseFloat(tr.getAttribute("data-price") || "0");
          const quantity = parseInt(tr.getAttribute("data-quantity") || "0");
          const originalSubtotal = price * quantity;
          subtotalElement.textContent = formatCurrency(originalSubtotal);
        }
      }, 1000);
    }
  }
}

/*
 * Error handling for HTMX 500 responses (e.g., price = 99.99 demo error)
 * Due to HTMX limitations, inline hx-on: attributes don't work reliably for error events,
 * so we must use global event listeners. This tracks the input making a request and
 * handles the error response by showing "Error" text and reverting the value.
 */
let lastRequestInput: HTMLInputElement | null = null;

// Store the input when a request is made
document.body.addEventListener('htmx:beforeRequest', (evt: any) => {
  if (evt.target && evt.target.tagName === 'INPUT') {
    lastRequestInput = evt.target as HTMLInputElement;
  }
});

// Handle 500 errors by preventing swap and showing error state
document.body.addEventListener('htmx:beforeSwap', (evt: any) => {
  if (evt.detail.xhr?.status === 500) {
    evt.detail.shouldSwap = false; // Prevent HTMX from replacing the table
    
    if (lastRequestInput) {
      handleResponseError(lastRequestInput, evt);
      lastRequestInput = null;
    }
  }
});

(window as any).pageUtils = {
  toggleEdit,
  handleOptimisticUpdate,
  handleEnterOptimistic,
  handleBlurOptimistic,
  restoreFocus,
  cancelOnEscape,
  exitEditMode,
  formatCurrency,
};
