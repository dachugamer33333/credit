export interface ConfirmRow {
  label: string;
  value: string;
}

export interface ConfirmOptions {
  title?: string;
  rows: ConfirmRow[];
  confirmLabel?: string;
  cancelLabel?: string;
}

let resolver: ((ok: boolean) => void) | null = null;

export const openConfirm = (options: ConfirmOptions): Promise<boolean> =>
  new Promise((resolve) => {
    const sheet = document.querySelector<HTMLElement>("[data-confirm-sheet]");
    if (!sheet) {
      resolve(false);
      return;
    }
    resolver = resolve;

    const titleEl = sheet.querySelector<HTMLElement>("[data-confirm-title]");
    const rowsEl = sheet.querySelector<HTMLElement>("[data-confirm-rows]");
    const confirmBtn = sheet.querySelector<HTMLButtonElement>("[data-confirm-ok]");
    const cancelBtn = sheet.querySelector<HTMLButtonElement>("[data-confirm-cancel]");

    if (titleEl) titleEl.textContent = options.title ?? "Confirma la operación";
    if (confirmBtn) confirmBtn.textContent = options.confirmLabel ?? "Confirmar";
    if (cancelBtn) cancelBtn.textContent = options.cancelLabel ?? "Cancelar";

    if (rowsEl) {
      rowsEl.replaceChildren(
        ...options.rows.map((row) => {
          const wrap = document.createElement("div");
          wrap.className = "flex items-center justify-between gap-3";
          const dt = document.createElement("dt");
          dt.className = "text-muted";
          dt.textContent = row.label;
          const dd = document.createElement("dd");
          dd.className = "text-right font-roboto font-medium text-ink";
          dd.textContent = row.value;
          wrap.append(dt, dd);
          return wrap;
        })
      );
    }

    sheet.hidden = false;
    confirmBtn?.focus();
  });

export const settleConfirm = (ok: boolean): void => {
  const sheet = document.querySelector<HTMLElement>("[data-confirm-sheet]");
  if (sheet) sheet.hidden = true;
  const r = resolver;
  resolver = null;
  r?.(ok);
};

export const isConfirmOpen = (): boolean => resolver !== null;
