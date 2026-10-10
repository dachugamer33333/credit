export interface LoanInputs {
  monto: number;
  plazo: number;
  tasaAnual: number;
  ivaIntereses: number;
  comision: number;
}

export interface AmortizationRow {
  mes: number;
  saldoInicial: number;
  interes: number;
  iva: number;
  capital: number;
  pago: number;
  saldoFinal: number;
}

export interface LoanResult {
  inputs: LoanInputs;
  tasaMensual: number;
  tasaMensualConIva: number;
  pagoMensual: number;
  tabla: AmortizationRow[];
  interesTotal: number;
  ivaTotal: number;
  comisiones: number;
  totalPagar: number;
  catMensual: number;
  cat: number;
}

// Documentación del cálculo (auditable). Los valores de salida se guardan sin
// redondear; el redondeo a centavos se aplica solo al mostrar.
export const LOAN_METHOD = {
  pago:
    "pago = M · r' / (1 − (1 + r')^−n), con r = tasaAnual / 12 y r' = r · (1 + IVA). Si r' = 0, pago = M / n.",
  amortizacion:
    "interés = saldo inicial · r; IVA = interés · IVA; capital = pago − interés − IVA; saldo final = saldo inicial − capital. El último mes ajusta capital = saldo inicial.",
  cat: "IRR mensual por bisección sobre flujos (+M − comisión en t0, −pago cada mes); CAT = (1 + IRR)^12 − 1.",
} as const;

export const redondearCentavos = (value: number): number => Math.round(value * 100) / 100;

export const tasaMensual = (tasaAnual: number): number => tasaAnual / 12;

export const tasaMensualConIva = (tasaAnual: number, ivaIntereses: number): number =>
  tasaMensual(tasaAnual) * (1 + ivaIntereses);

export const calcularPago = (monto: number, plazo: number, rConIva: number): number => {
  if (rConIva === 0) return monto / plazo;
  return (monto * rConIva) / (1 - Math.pow(1 + rConIva, -plazo));
};

// Tasa interna de retorno mensual por bisección (bracket [0, 1] y fallback [0, 10]).
export const irrMensual = (flujos: number[]): number => {
  const npv = (r: number): number =>
    flujos.reduce((acc, flujo, t) => acc + flujo / Math.pow(1 + r, t), 0);

  const fCero = npv(0);
  if (Math.abs(fCero) < 1e-9) return 0;

  let lo = 0;
  let hi = 1;
  let fLo = fCero;
  let fHi = npv(hi);

  if (fLo * fHi > 0) {
    hi = 10;
    fHi = npv(hi);
    if (fLo * fHi > 0) return 0;
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

  return (lo + hi) / 2;
};

export const buildLoan = (inputs: LoanInputs): LoanResult => {
  const { monto, plazo, tasaAnual, ivaIntereses, comision } = inputs;
  const r = tasaMensual(tasaAnual);
  const rConIva = r * (1 + ivaIntereses);
  const pagoBase = calcularPago(monto, plazo, rConIva);

  const tabla: AmortizationRow[] = [];
  let saldo = monto;
  let interesTotal = 0;
  let ivaTotal = 0;
  let pagosTotal = 0;

  for (let mes = 1; mes <= plazo; mes++) {
    const saldoInicial = saldo;
    const interes = saldoInicial * r;
    const iva = interes * ivaIntereses;
    let capital = pagoBase - interes - iva;
    let pagoMes = pagoBase;

    if (mes === plazo) {
      // Ajuste del último mes para que el saldo final sea exactamente 0.
      capital = saldoInicial;
      pagoMes = capital + interes + iva;
    }

    const saldoFinal = saldoInicial - capital;
    interesTotal += interes;
    ivaTotal += iva;
    pagosTotal += pagoMes;

    tabla.push({ mes, saldoInicial, interes, iva, capital, pago: pagoMes, saldoFinal });
    saldo = saldoFinal;
  }

  const flujos: number[] = [monto - comision];
  for (const fila of tabla) flujos.push(-fila.pago);

  const catMensual = irrMensual(flujos);
  const cat = Math.pow(1 + catMensual, 12) - 1;

  return {
    inputs,
    tasaMensual: r,
    tasaMensualConIva: rConIva,
    pagoMensual: pagoBase,
    tabla,
    interesTotal,
    ivaTotal,
    comisiones: comision,
    totalPagar: pagosTotal + comision,
    catMensual,
    cat,
  };
};
