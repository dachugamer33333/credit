import { emailFromName } from "../src/lib/user.ts";

let failures = 0;

const check = (name: string, cond: boolean, extra = ""): void => {
  if (cond) {
    console.log(`✓ ${name}`);
  } else {
    failures++;
    console.error(`✗ ${name}${extra ? ` — ${extra}` : ""}`);
  }
};

const cases: Array<[string, string]> = [
  ["Juan Pérez", "juan.perez@ejemplo.mx"],
  ["María José Ñandú", "maria.jose.nandu@ejemplo.mx"],
  ["  !!! ", "juan.perez@ejemplo.mx"],
  ["", "juan.perez@ejemplo.mx"],
  ["  Ana   María  ", "ana.maria@ejemplo.mx"],
];

for (const [input, expected] of cases) {
  const got = emailFromName(input);
  check(`${JSON.stringify(input)} → ${expected}`, got === expected, `got ${got}`);
}

const local = emailFromName("a".repeat(40)).split("@")[0];
check("parte local ≤ 30 caracteres", local.length <= 30, `len ${local.length}`);

console.log("");
if (failures > 0) {
  console.error(`${failures} verificación(es) fallaron.`);
  process.exitCode = 1;
} else {
  console.log("Todas las verificaciones de user.ts pasaron.");
}
