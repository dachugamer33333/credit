import { makeSampleCard, makeSampleClabe } from "./cards.ts";
import { bankFromClabe } from "./cards.ts";

export type RecipientKind = "cuenta" | "tarjeta" | "clabe";

export interface Recipient {
  id: string;
  tipo: RecipientKind;
  numero: string;
  banco: string;
  alias: string;
  titular: string;
}

const STORAGE_KEY = "encredit:recipients";

let memory: Recipient[] | null = null;

const canStore = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const uid = (): string => `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const defaults = (): Recipient[] => {
  const card = makeSampleCard("visa");
  const clabe = makeSampleClabe("012");
  return [
    {
      id: uid(),
      tipo: "tarjeta",
      numero: card,
      banco: "BBVA",
      alias: "Tarjeta BBVA",
      titular: "María García",
    },
    {
      id: uid(),
      tipo: "clabe",
      numero: clabe,
      banco: bankFromClabe(clabe)?.name ?? "BBVA",
      alias: "Cuenta BBVA",
      titular: "Luis Hernández",
    },
  ];
};

const persist = (): void => {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // Sin persistencia: se queda en memoria.
  }
};

const load = (): Recipient[] => {
  if (memory) return memory;
  let loaded: Recipient[] | null = null;
  if (canStore()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw) as Recipient[];
    } catch {
      loaded = null;
    }
  }
  memory = loaded && Array.isArray(loaded) && loaded.length > 0 ? loaded : defaults();
  persist();
  return memory;
};

export const list = (): Recipient[] => load().map((r) => ({ ...r }));

// Sin duplicados por número.
export const add = (recipient: Omit<Recipient, "id">): Recipient | null => {
  const current = load();
  if (current.some((r) => r.numero === recipient.numero)) return null;
  const created: Recipient = { ...recipient, id: uid() };
  current.unshift(created);
  persist();
  return { ...created };
};

export const remove = (id: string): void => {
  memory = load().filter((r) => r.id !== id);
  persist();
};

export const resetDefaults = (): void => {
  memory = defaults();
  persist();
};
