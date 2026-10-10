export interface ReceiptData {
  tipo: string;
  monto: number;
  concepto: string;
  fecha: string;
  folio: string;
}

let current: ReceiptData | null = null;

export const setReceipt = (data: ReceiptData): void => {
  current = data;
};

export const getReceipt = (): ReceiptData | null => current;

export const clearReceipt = (): void => {
  current = null;
};
