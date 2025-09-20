export function getElementById<T extends HTMLElement>(id: string): T | null {
  if (typeof document === 'undefined') return null;
  return document.getElementById(id) as T | null;
}

export function querySelector<T extends HTMLElement>(
  selector: string,
  parent: HTMLElement | Document = document
): T | null {
  if (typeof document === 'undefined') return null;
  return parent.querySelector(selector) as T | null;
}

export function toggleElementDisplay(
  element: HTMLElement | null,
  show: boolean
): void {
  if (!element) return;
  if (show) {
    element.classList.remove('hidden');
    element.classList.add('inline-block');
  } else {
    element.classList.add('hidden');
    element.classList.remove('inline-block');
  }
}

export function toggleElements(
  showElement: HTMLElement | null,
  hideElement: HTMLElement | null
): void {
  toggleElementDisplay(showElement, true);
  toggleElementDisplay(hideElement, false);
}

export function focusInput(input: HTMLInputElement | null): void {
  if (!input) return;
  requestAnimationFrame(() => {
    input.focus();
    input.select();
  });
}

export function setCaretPosition(
  input: HTMLInputElement | null,
  position: number | null
): void {
  if (!input || position === null) return;
  const pos = Math.min(position, input.value.length);
  input.setSelectionRange(pos, pos);
}

export function getRowId(element: HTMLElement): string | null {
  const tr = element.closest('tr');
  if (!tr) return null;
  return tr.id.replace('row-', '');
}

export function getCellElement(
  rowId: string,
  cellType: 'price' | 'qty',
  elementType: 'view' | 'edit'
): HTMLElement | null {
  const elementId = elementType === 'view'
    ? `view-${cellType}-${rowId}`
    : `edit-${cellType}-${rowId}`;

  return getElementById(elementId);
}

export function getTableCell(
  rowId: string,
  cellType: 'price' | 'qty'
): HTMLTableCellElement | null {
  const cellId = cellType === 'price'
    ? `price-cell-${rowId}`
    : `qty-cell-${rowId}`;

  return getElementById<HTMLTableCellElement>(cellId);
}