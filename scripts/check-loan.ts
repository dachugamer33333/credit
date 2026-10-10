import { buildLoan, redondearCentavos, type LoanInputs } from "../src/lib/loan.ts";

const cfg = { tasaAnual: 0.22, ivaIntereses: 0.16, comision: 0 };
let failures = 0;

const check = (name: string, cond: boolean, extra = ""): void => {
  if (cond) {
    console.log(`✓ ${name}`);
  } else {
    failures++;
    console.error(`✗ ${name}${extra ? ` — ${extra}` : ""}`);
  }
};

const approx = (a: number, b: number, tol = 0.01): boolean => Math.abs(a - b) <= tol;
const base = (monto: number, plazo: number): LoanInputs => ({ monto, plazo, ...cfg });

// 1) Tasa 0 → pago = M/n
{
  const r = buildLoan({ monto: 5000, plazo: 6, tasaAnual: 0, ivaIntereses: 0.16, comision: 0 });
  check(
    "Tasa 0 → pago = M/n",
    approx(r.pagoMensual, 5000 / 6, 0.0001),
    `pago=${r.pagoMensual}`
  );
}

// 2) Σcapital = M, 3) saldo final = 0 y 4) 3 combinaciones con esperado calculado.
const combos = [
  { monto: 5000, plazo: 6, esperado: 896.45 },
  { monto: 1000, plazo: 3, esperado: 347.61 },
  { monto: 8000, plazo: 9, esperado: 986.06 },
];

for (const combo of combos) {
  const r = buildLoan(base(combo.monto, combo.plazo));
  const sumaCapital = r.tabla.reduce((acc, fila) => acc + fila.capital, 0);
  const sumaPagos = r.tabla.reduce((acc, fila) => acc + fila.pago, 0);
  const ultima = r.tabla[r.tabla.length - 1];

  check(
    `[${combo.monto}/${combo.plazo}] pago esperado = ${combo.esperado}`,
    approx(r.pagoMensual, combo.esperado),
    `pago=${redondearCentavos(r.pagoMensual)}`
  );
  check(
    `[${combo.monto}/${combo.plazo}] Σcapital = M`,
    approx(sumaCapital, combo.monto, 0.01),
    `Σ=${redondearCentavos(sumaCapital)}`
  );
  check(
    `[${combo.monto}/${combo.plazo}] saldo final = 0`,
    approx(ultima.saldoFinal, 0, 0.000001),
    `saldo=${ultima.saldoFinal}`
  );
  check(
    `[${combo.monto}/${combo.plazo}] total = Σpagos + comisión`,
    approx(r.totalPagar, sumaPagos + r.comisiones, 0.01)
  );
  check(
    `[${combo.monto}/${combo.plazo}] CAT > 0`,
    r.cat > 0,
    `CAT=${(r.cat * 100).toFixed(2)}%`
  );
}

console.log("");
if (failures > 0) {
  console.error(`${failures} verificación(es) fallaron.`);
  process.exitCode = 1;
} else {
  console.log("Todas las verificaciones de loan.ts pasaron.");
}
