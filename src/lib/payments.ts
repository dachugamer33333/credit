export const VENTANA_MS = 120000;

export const pagoMinimo = (usado: number, porcentaje: number, piso: number): number =>
  Math.min(usado, Math.max(usado * porcentaje, piso));

export const ventanaActual = (now: number = Date.now()): number =>
  Math.floor(now / VENTANA_MS);

export const tiempoRestanteVentana = (now: number = Date.now()): number =>
  VENTANA_MS - (now % VENTANA_MS);

// CVV determinista por ventana de tiempo (PRNG demostrativo, no criptográfico).
export const cvvForWindow = (ventana: number): string => {
  let x = Math.imul(ventana >>> 0, 2654435761) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 2246822519) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 3266489917) >>> 0;
  x ^= x >>> 16;
  return String((x >>> 0) % 1000).padStart(3, "0");
};

// Adeudo ficticio determinista a partir de la referencia ($150.00 a $1,800.00).
export const adeudoPorReferencia = (referencia: string): number => {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < referencia.length; i++) {
    hash ^= referencia.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const minCentavos = 15000;
  const maxCentavos = 180000;
  const centavos = minCentavos + (hash % (maxCentavos - minCentavos + 1));
  return centavos / 100;
};

export const formatMMSS = (ms: number): string => {
  const totalSegundos = Math.max(0, Math.ceil(ms / 1000));
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
};

export const folio8 = (): string =>
  String(Math.floor(Math.random() * 1e8)).padStart(8, "0");
