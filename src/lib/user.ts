export const DEFAULT_NAME = "Juan Pérez";
export const STORAGE_KEY = "encredit:name";
export const MAX_NAME_LENGTH = 30;

export const sanitizeName = (raw: string): string =>
  raw
    // Elimina caracteres de control.
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, MAX_NAME_LENGTH);

export const getStoredName = (): string => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const clean = stored ? sanitizeName(stored) : "";
    return clean.length > 0 ? clean : DEFAULT_NAME;
  } catch {
    return DEFAULT_NAME;
  }
};

export const hasStoredName = (): boolean => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored !== null && sanitizeName(stored).length > 0;
  } catch {
    return false;
  }
};

export const setStoredName = (name: string): void => {
  try {
    const clean = sanitizeName(name);
    window.localStorage.setItem(STORAGE_KEY, clean.length > 0 ? clean : DEFAULT_NAME);
  } catch {
    // Sin persistencia: se usa el nombre por defecto.
  }
};

export const getFirstName = (name: string): string => {
  const first = name.trim().split(/\s+/)[0];
  return first && first.length > 0 ? first : DEFAULT_NAME;
};

export const getGreeting = (date: Date = new Date()): string => {
  const hour = date.getHours();
  if (hour >= 5 && hour <= 11) return "Buenos días";
  if (hour >= 12 && hour <= 19) return "Buenas tardes";
  return "Buenas noches";
};

export const buildGreeting = (name: string, date: Date = new Date()): string =>
  `${getGreeting(date)}, ${getFirstName(name)}`;

export const getNameForCard = (name: string): string => name.toUpperCase();
