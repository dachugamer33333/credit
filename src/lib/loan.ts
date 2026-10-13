import { catDesdeFlujos } from "./credit-terms.ts";

export interface LoanInputs {
  monto: number;
  plazo: number;
  tasaMensualSimple: number;
  comisionApertura: number;
}

export interface AmortizationRow {
  mes: number;
  saldoInicial: number;
  capital: number;
  interes: number;
  pago: number;
  saldoFinal: number;
}

export interface LoanResult {
  inputs: LoanInputs;
  interesMensual: number;
  pagoMensual: number;
  ultimoPago: number;
  tabla: AmortizationRow[];
  interesTotal: number;
  comisiones: number;
  montoNeto: number;
  totalPagos: number;
  totalPagadoConApertura: number;
  catMensual: number;
  cat: number;
}

// Documentación del cálculo (método plano del documento de condiciones fijas).
export const LOAN_METHOD = {
  interes:
    "interés mensual = monto × tasa mensual simple (constante, sobre el capital original, no sobre saldo insoluto).",
  capital:
    "capital = monto / plazo redondeado a centavos hacia abajo en los primeros n−1 pagos; el último pago absorbe el residuo.",
  pago: "pago = capital + interés mensual.",
  neto: "monto neto recibido = monto − comisión de apertura. IVA = 0 (sin IVA).",
  cat: "CAT: IRR mensual de los flujos (+monto neto en t0, −cada pago); CAT anual = (1 + IRR)^12 − 1.",
} as const;

export const redondearCentavos = (value: number): number => Math.round(value * 100) / 100;

export const buildLoan = (inputs: LoanInputs): LoanResult => {
  const { monto, plazo, tasaMensualSimple, comisionApertura } = inputs;

  const interesMensual = redondearCentavos(monto * tasaMensualSimple);
  const capitalBase = Math.floor((monto / plazo) * 100) / 100;
  const capitalUltimo = redondearCentavos(monto - capitalBase * (plazo - 1));
  const pagoMensual = redondearCentavos(capitalBase + interesMensual);
  const ultimoPago = redondearCentavos(capitalUltimo + interesMensual);

  const tabla: AmortizationRow[] = [];
  let saldo = monto;

  for (let mes = 1; mes <= plazo; mes++) {
    const saldoInicial = saldo;
    const capital = mes < plazo ? capitalBase : capitalUltimo;
    const pago = mes < plazo ? pagoMensual : ultimoPago;
    const saldoFinal = redondearCentavos(saldoInicial - capital);
    tabla.push({ mes, saldoInicial, capital, interes: interesMensual, pago, saldoFinal });
    saldo = saldoFinal;
  }

  const interesTotal = redondearCentavos(interesMensual * plazo);
  const totalPagos = redondearCentavos(tabla.reduce((acc, fila) => acc + fila.pago, 0));
  const montoNeto = redondearCentavos(monto - comisionApertura);
  const totalPagadoConApertura = redondearCentavos(totalPagos + comisionApertura);

  const { mensual: catMensual, anual: cat } = catDesdeFlujos(
    montoNeto,
    tabla.map((fila) => fila.pago)
  );

  return {
    inputs,
    interesMensual,
    pagoMensual,
    ultimoPago,
    tabla,
    interesTotal,
    comisiones: comisionApertura,
    montoNeto,
    totalPagos,
    totalPagadoConApertura,
    catMensual,
    cat,
  };
};
