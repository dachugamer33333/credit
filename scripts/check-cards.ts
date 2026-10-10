import {
  bankFromClabe,
  clabeValid,
  detectBrand,
  detectKind,
  luhn,
  makeSampleCard,
  makeSampleClabe,
  type Brand,
} from "../src/lib/cards.ts";
import {
  add as addRecipient,
  list as listRecipients,
  resetDefaults as resetRecipients,
} from "../src/lib/recipients.ts";

let failures = 0;
const check = (name: string, cond: boolean, extra = ""): void => {
  if (cond) {
    console.log(`✓ ${name}`);
  } else {
    failures++;
    console.error(`✗ ${name}${extra ? ` — ${extra}` : ""}`);
  }
};

// Luhn
check("Luhn válido (Visa)", luhn("4111111111111111") === true);
check("Luhn válido (Mastercard)", luhn("5555555555554444") === true);
check("Luhn válido (Amex)", luhn("378282246310005") === true);
check("Luhn inválido", luhn("4111111111111112") === false);

// detectBrand
check("Visa empieza en 4", detectBrand("4111111111111111") === "visa");
check("Mastercard 51", detectBrand("5100000000000000") === "mastercard");
check("Mastercard 55", detectBrand("5500000000000000") === "mastercard");
check("Mastercard 2221", detectBrand("2221000000000000") === "mastercard");
check("Mastercard 2720", detectBrand("2720990000000000") === "mastercard");
check("Amex 34", detectBrand("340000000000000") === "amex");
check("Amex 37", detectBrand("370000000000000") === "amex");
check("2220 fuera de rango", detectBrand("2220000000000000") !== "mastercard");
check("2721 fuera de rango", detectBrand("2721000000000000") !== "mastercard");
check("Desconocida (6011)", detectBrand("6011000000000000") === "desconocida");

// CLABE
const clabe1 = makeSampleClabe("012");
const clabe2 = makeSampleClabe("999");
check("CLABE válida 1", clabeValid(clabe1) === true, clabe1);
check("CLABE válida 2", clabeValid(clabe2) === true, clabe2);
const clabeBad1 = clabe1.slice(0, 6) + String((Number(clabe1[6]) + 1) % 10) + clabe1.slice(7);
check("CLABE inválida (dígito cambiado)", clabeValid(clabeBad1) === false, clabeBad1);
check("CLABE inválida (longitud)", clabeValid("12345") === false);

// bankFromClabe
check("bankFromClabe 012 = BBVA", bankFromClabe(makeSampleClabe("012"))?.code === "012");
check("bankFromClabe 999 = EN CREDIT", bankFromClabe(makeSampleClabe("999"))?.code === "999");

// detectKind
check("detectKind cuenta (10)", detectKind("1234567890") === "cuenta");
check("detectKind tarjeta (16)", detectKind("4111111111111111") === "tarjeta");
check("detectKind tarjeta (15)", detectKind("378282246310005") === "tarjeta");
check("detectKind clabe (18)", detectKind(makeSampleClabe("012")) === "clabe");
check("detectKind inválido", detectKind("123") === "invalido");

// Generadores: 20 muestras válidas
const brands: Brand[] = ["visa", "mastercard", "amex"];
let cardsOk = true;
for (let i = 0; i < 20; i++) {
  const card = makeSampleCard(brands[i % brands.length]);
  if (!luhn(card) || detectBrand(card) === "desconocida") cardsOk = false;
}
check("20 makeSampleCard() pasan Luhn y marca", cardsOk);

let clabesOk = true;
for (let i = 0; i < 20; i++) {
  if (!clabeValid(makeSampleClabe("012"))) clabesOk = false;
}
check("20 makeSampleClabe() son válidas", clabesOk);

// Destinatarios: sin duplicados
resetRecipients();
const defaults = listRecipients();
check("defaults ≥ 2", defaults.length >= 2, `${defaults.length}`);
const first = defaults[0];
const duplicate = addRecipient({
  tipo: first.tipo,
  numero: first.numero,
  banco: first.banco,
  alias: "Duplicado",
  titular: "X",
});
check("add() no duplica por número", duplicate === null);
const fresh = addRecipient({
  tipo: "clabe",
  numero: makeSampleClabe("014"),
  banco: "Santander",
  alias: "Nuevo",
  titular: "Ana López",
});
check(
  "add() agrega uno nuevo",
  fresh !== null && listRecipients().some((r) => r.numero === fresh.numero)
);

console.log("");
if (failures > 0) {
  console.error(`${failures} verificación(es) fallaron.`);
  process.exitCode = 1;
} else {
  console.log("Todas las verificaciones de cards/recipients pasaron.");
}
