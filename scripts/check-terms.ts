import { catDesdeFlujos, interesMoratorio } from "../src/lib/credit-terms.ts";
import { fixedTerms } from "../src/config/product.ts";

let failures = 0;
const check = (name: string, cond: boolean, extra = ""): void => {
  if (cond) {
    console.log(`✓ ${name}`);
  } else {
    failures++;
    console.error(`✗ ${name}${extra ? ` — ${extra}` : ""}`);
  }
};

const approx = (a: number, b: number, tol: number): boolean => Math.abs(a - b) <= tol;

// Interés moratorio (documento): 4.86 / 34.03 / 72.92 / 145.83 / 291.67
const moraEsperada = [4.86, 34.03, 72.92, 145.83, 291.67];
const dias = [...fixedTerms.diasMoraEjemplo];
const capital = fixedTerms.capitalVencidoEjemplo;

dias.forEach((d, i) => {
  const mora = interesMoratorio(capital, d);
  check(
    `mora ${d} días = ${moraEsperada[i]}`,
    approx(mora, moraEsperada[i], 0.001),
    `obtenido ${mora}`
  );
});

// Totales estimados: 1,288.19 / 1,317.36 / 1,356.25 / 1,429.16 / 1,575.00
const totalesEsperados = [1288.19, 1317.36, 1356.25, 1429.16, 1575.0];
dias.forEach((d, i) => {
  const total = fixedTerms.pagoVencidoEjemplo + interesMoratorio(capital, d);
  check(
    `total ${d} días = ${totalesEsperados[i]}`,
    approx(total, totalesEsperados[i], 0.001),
    `obtenido ${total}`
  );
});

// CAT a partir de los flujos (+3200; −1283.33 ×5; −1283.35)
const pagos = [
  fixedTerms.pagoMensual1a5,
  fixedTerms.pagoMensual1a5,
  fixedTerms.pagoMensual1a5,
  fixedTerms.pagoMensual1a5,
  fixedTerms.pagoMensual1a5,
  fixedTerms.pagoMensual6,
];
const cat = catDesdeFlujos(fixedTerms.montoNetoRecibido, pagos);
const catMensualPct = cat.mensual * 100;
const catAnualPct = cat.anual * 100;

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

// Consistencia interna de fixedTerms
check(
  "monto neto = monto − comisión",
  fixedTerms.montoNetoRecibido === fixedTerms.monto - fixedTerms.comisionApertura
);
check("total pagos = 5×1283.33 + 1283.35", approx(fixedTerms.totalPagos, 7700, 0.001));
check(
  "total con apertura = total pagos + comisión",
  approx(fixedTerms.totalPagadoConApertura, fixedTerms.totalPagos + fixedTerms.comisionApertura, 0.001)
);

console.log("");
if (failures > 0) {
  console.error(`${failures} verificación(es) fallaron.`);
  process.exitCode = 1;
} else {
  console.log("Todas las verificaciones de condiciones (credit-terms) pasaron.");
}
