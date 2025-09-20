interface FocusInfo {
  id: string;
  field: "price" | "quantity";
}

interface TableHeaderFocus {
  field: string;
  caretPos: number | null;
}

interface HtmxRequest {
  abort: () => void;
}

interface HtmxApi {
  ajax: (
    method: string,
    url: string,
    config: {
      target: string;
      select?: string;
      swap?: string;
      pushUrl?: boolean;
    }
  ) => HtmxRequest;
}

declare global {
  interface Window {
    pageUtils: {
      toggleEdit: (id: number | string, editing: boolean, field: "price" | "quantity" | null) => void;
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