import { buildLoan, redondearCentavos, type LoanInputs } from "../src/lib/loan.ts";
import { fixedTerms } from "../src/config/product.ts";

const cfg = { tasaMensualSimple: 0.2, comisionApertura: 300 };
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

// Caso base del documento: $3,500 a 6 meses.
{
  const r = buildLoan(base(3500, 6));
  check("pago mensual = 1,283.33", approx(r.pagoMensual, fixedTerms.pagoMensual1a5), `${r.pagoMensual}`);
  check("último pago = 1,283.35", approx(r.ultimoPago, fixedTerms.pagoMensual6), `${r.ultimoPago}`);
  check("interés total = 4,200.00", approx(r.interesTotal, fixedTerms.interesTotal), `${r.interesTotal}`);
  check("total de pagos = 7,700.00", approx(r.totalPagos, fixedTerms.totalPagos), `${r.totalPagos}`);
  check("monto neto = 3,200.00", approx(r.montoNeto, fixedTerms.montoNetoRecibido), `${r.montoNeto}`);
  check(
    "total pagado con apertura = 8,000.00",
    approx(r.totalPagadoConApertura, fixedTerms.totalPagadoConApertura),
    `${r.totalPagadoConApertura}`
  );
  check(
    "5 capitales de 583.33 y último 583.35",
    r.tabla.slice(0, 5).every((fila) => approx(fila.capital, 583.33)) &&
      approx(r.tabla[5].capital, 583.35),
    r.tabla.map((fila) => fila.capital).join(", ")
  );

  const catMensualPct = r.catMensual * 100;
  const catAnualPct = r.cat * 100;
  console.log(
    `   CAT calculado: mensual ${catMensualPct.toFixed(4)}% · anual ${catAnualPct.toFixed(4)}%`
  );
  check(
    `CAT mensual ≈ ${fixedTerms.catMensual}% (tol 0.01)`,
    approx(catMensualPct, fixedTerms.catMensual, 0.01),
    `diferencia ${(catMensualPct - fixedTerms.catMensual).toFixed(4)} pts`
  );
  check(
    `CAT anual ≈ ${fixedTerms.catAnual}% (tol 0.5)`,
    approx(catAnualPct, fixedTerms.catAnual, 0.5),
    `diferencia ${(catAnualPct - fixedTerms.catAnual).toFixed(4)} pts`
  );
}

// Σcapital = monto, saldo final = 0 en 5 combinaciones de monto y plazo.
const combos: Array<[number, number]> = [
  [3500, 3],
  [3500, 6],
  [3500, 9],
  [5000, 6],
  [8000, 9],
];

for (const [monto, plazo] of combos) {
  const r = buildLoan(base(monto, plazo));
  const sumaCapital = r.tabla.reduce((acc, fila) => acc + fila.capital, 0);
  const ultima = r.tabla[r.tabla.length - 1];
  check(
    `[${monto}/${plazo}] Σcapital = monto`,
    approx(sumaCapital, monto, 0.01),
    `Σ=${redondearCentavos(sumaCapital)}`
  );
  check(
    `[${monto}/${plazo}] saldo final = 0`,
    approx(ultima.saldoFinal, 0, 0.000001),
    `saldo=${ultima.saldoFinal}`
  );
  check(
    `[${monto}/${plazo}] Σpagos = monto + intereses`,
    approx(r.totalPagos, monto + r.interesTotal, 0.01),
    `Σpagos=${redondearCentavos(r.totalPagos)}`
  );
}

console.log("");
if (failures > 0) {
  console.error(`${failures} verificación(es) fallaron.`);
  process.exitCode = 1;
} else {
  console.log("Todas las verificaciones de loan.ts pasaron.");
}
