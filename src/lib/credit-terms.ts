// Cálculos puros de condiciones del crédito (documento de condiciones fijas).
// Sin dependencias: puede ejecutarse en Node para las verificaciones.

// Redondeo a centavos con half-up robusto a errores de punto flotante.
// Ej.: 291.665 (que en float es 291.6649999…) → 291.67
const redondearCentavos = (value: number): number => {
  const scaled = value * 100;
  const adjusted = scaled + (scaled >= 0 ? 1e-9 : -1e-9);
  return Math.round(adjusted) / 100;
};

// interés moratorio = capital vencido × 25.00% × días de atraso ÷ 30
export const interesMoratorio = (capitalVencido: number, dias: number): number =>
  redondearCentavos((capitalVencido * 0.25 * dias) / 30);

export interface CatResult {
  mensual: number;
  anual: number;
}

// IRR mensual por bisección sobre flujos (+neto en t0, −pago cada mes);
// CAT anual = (1 + IRR)^12 − 1. Devuelve decimales (0.3279 = 32.79%).
export const catDesdeFlujos = (neto: number, pagos: number[]): CatResult => {
  const flujos = [neto, ...pagos.map((pago) => -pago)];
  const npv = (r: number): number =>
    flujos.reduce((acc, flujo, t) => acc + flujo / Math.pow(1 + r, t), 0);

  let lo = 0;
  let hi = 1;
  let fLo = npv(lo);
  let fHi = npv(hi);

  if (fLo * fHi > 0) {
    hi = 10;
    fHi = npv(hi);
    if (fLo * fHi > 0) return { mensual: 0, anual: 0 };
  }

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid);
    if (fLo * fMid <= 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }

  const mensual = (lo + hi) / 2;
  return { mensual, anual: Math.pow(1 + mensual, 12) - 1 };
};
