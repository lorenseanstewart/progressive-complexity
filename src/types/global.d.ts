export interface FocusInfo {
  id: string;
  field: "price" | "quantity";
}

export interface TableHeaderFocus {
  field: string;
  caretPos: number | null;
}

export interface HtmxRequest {
  abort: () => void;
}

export interface HtmxApi {
  ajax: (
    method: string,
    url: string,
    config: {
      target: string;
      select?: string;
      swap?: string;
      pushUrl?: boolean;
    },
  ) => HtmxRequest;
}

export interface HtmxBeforeSwapEvent extends Event {
  detail: {
    xhr: XMLHttpRequest & { status: number };
    shouldSwap: boolean;
  };
}

export interface OptimisticEvent extends Event {
  target: HTMLElement | null;
}

declare global {
  interface Window {
    pageUtils: {
      toggleEdit: (
        id: number | string,
        editing: boolean,
        field: "price" | "quantity" | null,
      ) => void;
      exitEditMode: (input: HTMLInputElement) => void;
      exitEditModeAfterSubmit: (input: HTMLInputElement) => void;
      restoreFocus: () => void;
      cancelOnEscape: (evt: KeyboardEvent, input: HTMLInputElement) => void;
      formatCurrency: (value: number) => string;
    };
    __lastFocus: FocusInfo | null;
    __th_focus: TableHeaderFocus | null;
    htmx: HtmxApi;
  }
}

export {};
