import { credit, movements as seedMovements } from "../config/product.ts";
import { getMovementDate } from "./format.ts";
import { folio8 } from "./payments.ts";

export interface AccountMovement {
  id: string;
  tipo: string;
  concepto: string;
  monto: number;
  fecha: string;
  folio: string;
}

export interface AccountState {
  frozen: boolean;
  usado: number;
  movimientos: AccountMovement[];
}

export interface ChargeResult {
  ok: boolean;
  error?: "frozen" | "insufficient";
  movement?: AccountMovement;
}

export interface PayDownResult {
  applied: number;
  movement?: AccountMovement;
}

const STORAGE_KEY = "encredit:account";

const initialMovements = (): AccountMovement[] =>
  seedMovements.map((m) => ({
    id: m.id,
    tipo: m.direction === "debito" ? "compra" : "pago",
    concepto: m.description,
    monto: m.amount,
    fecha: getMovementDate(m.daysAgo).toISOString(),
    folio: folio8(),
  }));

const initialState = (): AccountState => ({
  frozen: false,
  usado: credit.used,
  movimientos: initialMovements(),
});

let state: AccountState | null = null;
const listeners = new Set<(snapshot: AccountState) => void>();

const canStore = (): boolean =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

const load = (): AccountState => {
  if (state) return state;
  let loaded: AccountState | null = null;
  if (canStore()) {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw) as AccountState;
    } catch {
      loaded = null;
    }
  }
  state =
    loaded && typeof loaded.usado === "number"
      ? {
          ...loaded,
          movimientos: (loaded.movimientos ?? []).map((m) => ({
            ...m,
            folio: m.folio ?? folio8(),
          })),
        }
      : initialState();
  return state;
};

const persist = (): void => {
  if (!canStore()) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sin persistencia.
  }
};

const emit = (): void => {
  const snapshot = getState();
  listeners.forEach((cb) => cb(snapshot));
  if (typeof document !== "undefined") {
    document.dispatchEvent(new CustomEvent("encredit:account"));
  }
};

const commit = (): void => {
  persist();
  emit();
};

const newId = (): string => `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const getState = (): AccountState => {
  const s = load();
  return {
    frozen: s.frozen,
    usado: s.usado,
    movimientos: s.movimientos.map((m) => ({ ...m })),
  };
};

export const subscribe = (cb: (snapshot: AccountState) => void): (() => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const disponible = (): number => credit.limit - load().usado;

export const charge = (monto: number, concepto: string, tipo: string): ChargeResult => {
  const s = load();
  if (s.frozen) return { ok: false, error: "frozen" };
  if (!Number.isFinite(monto) || monto <= 0 || monto > disponible()) {
    return { ok: false, error: "insufficient" };
  }
  s.usado += monto;
  const movement: AccountMovement = {
    id: newId(),
    tipo,
    concepto,
    monto,
    fecha: new Date().toISOString(),
    folio: folio8(),
  };
  s.movimientos.unshift(movement);
  commit();
  return { ok: true, movement };
};

// Reduce el usado (nunca por debajo de 0) y registra el abono aplicado.
export const payDown = (
  monto: number,
  concepto = "Pago a la tarjeta",
  tipo = "pago"
): PayDownResult => {
  const s = load();
  const applied = Math.max(0, Math.min(monto, s.usado));
  s.usado = Math.max(0, s.usado - monto);
  let movement: AccountMovement | undefined;
  if (applied > 0) {
    movement = {
      id: newId(),
      tipo,
      concepto,
      monto: applied,
      fecha: new Date().toISOString(),
      folio: folio8(),
    };
    s.movimientos.unshift(movement);
  }
  commit();
  return { applied, movement };
};

export const toggleFreeze = (): boolean => {
  const s = load();
  s.frozen = !s.frozen;
  commit();
  return s.frozen;
};

export const reset = (): void => {
  state = initialState();
  commit();
};
