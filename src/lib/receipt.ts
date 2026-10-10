export interface ReceiptDetail {
  label: string;
  value: string;
}

export interface ReceiptData {
  tipo: string;
  monto: number;
  concepto: string;
  fecha: string;
  folio: string;
  detalles?: ReceiptDetail[];
}

let current: ReceiptData | null = null;

export const setReceipt = (data: ReceiptData): void => {
  current = data;
};

export const getReceipt = (): ReceiptData | null => current;

export const clearReceipt = (): void => {
  current = null;
};
