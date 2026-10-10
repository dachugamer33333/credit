import {
  adeudoPorReferencia,
  cvvForWindow,
  pagoMinimo,
} from "../src/lib/payments.ts";
import {
  charge,
  disponible,
  getState,
  payDown,
  reset,
  toggleFreeze,
} from "../src/lib/account.ts";

let failures = 0;

const check = (name: string, cond: boolean, extra = ""): void => {
  if (cond) {
    console.log(`✓ ${name}`);
  } else {
    failures++;
    console.error(`✗ ${name}${extra ? ` — ${extra}` : ""}`);
  }
};

// Pago mínimo
check("pagoMinimo(1500, 0.10, 100) = 150", pagoMinimo(1500, 0.1, 100) === 150);
check("pagoMinimo(0, 0.10, 100) = 0", pagoMinimo(0, 0.1, 100) === 0);
check("pagoMinimo(50, 0.10, 100) = 50", pagoMinimo(50, 0.1, 100) === 50);

// CVV dinámico
const base = 100000;
const cvv = cvvForWindow(base);
check("cvvForWindow da 3 dígitos", /^\d{3}$/.test(cvv), cvv);
check("cvv igual dentro de la misma ventana", cvvForWindow(base) === cvvForWindow(base));
let cambios = 0;
for (let i = 0; i < 10; i++) {
  if (cvvForWindow(base + i) !== cvvForWindow(base + i + 1)) cambios++;
}
check("cvv cambia en ≥ 8/10 ventanas", cambios >= 8, `cambios=${cambios}`);

// Adeudo por referencia
const ref = "1234567890";
const adeudo = adeudoPorReferencia(ref);
check("adeudo determinista", adeudo === adeudoPorReferencia(ref), `${adeudo}`);
check("adeudo dentro de rango", adeudo >= 150 && adeudo <= 1800, `${adeudo}`);

// Store de cuenta
reset();
check("usado inicial = 1500", getState().usado === 1500, `${getState().usado}`);

const r1 = charge(100, "Prueba", "servicio");
check("charge suma al usado", r1.ok === true && getState().usado === 1600, `${getState().usado}`);
check(
  "charge crea movimiento con folio de 8 dígitos",
  r1.ok === true && /^\d{8}$/.test(r1.movement?.folio ?? ""),
  r1.movement?.folio
);

const r2 = charge(999999, "Excede", "servicio");
check(
  "charge falla por encima del disponible",
  r2.ok === false && r2.error === "insufficient",
  JSON.stringify(r2)
);

reset();
toggleFreeze();
const r3 = charge(100, "Congelada", "servicio");
check(
  "charge falla congelada",
  r3.ok === false && r3.error === "frozen",
  JSON.stringify(r3)
);
toggleFreeze();

reset();
charge(500, "Compra", "compra");
const pd = payDown(200, "Pago parcial");
check(
  "payDown crea movimiento con folio de 8 dígitos",
  /^\d{8}$/.test(pd.movement?.folio ?? ""),
  pd.movement?.folio
);
payDown(999999);
check("payDown nunca deja usado negativo", getState().usado === 0, `${getState().usado}`);
check("disponible tras pago total = límite", disponible() === 20000, `${disponible()}`);

reset();

console.log("");
if (failures > 0) {
  console.error(`${failures} verificación(es) fallaron.`);
  process.exitCode = 1;
} else {
  console.log("Todas las verificaciones de pagos pasaron.");
}
