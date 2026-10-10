import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..", "src", "components", "app");

interface ScreenCheck {
  file: string;
  screen: string;
  topbar: boolean;
}

const screens: ScreenCheck[] = [
  { file: "PayHub.astro", screen: "pagar-hub", topbar: true },
  { file: "PayCard.astro", screen: "pagar-credito", topbar: true },
  { file: "PayDigital.astro", screen: "pagar-digital", topbar: true },
  { file: "PayServices.astro", screen: "pagar-servicios", topbar: true },
  { file: "PayTopup.astro", screen: "pagar-recarga", topbar: true },
  { file: "Receipt.astro", screen: "comprobante", topbar: false },
  { file: "HistoryScreen.astro", screen: "historial", topbar: true },
];

// Archivos con script que deben scopear sus consultas a su propia pantalla
// (evita colisiones de selectores tipo [data-submit]/[data-error]).
const scopedFiles = [
  "PayCard.astro",
  "PayTopup.astro",
  "PayServices.astro",
  "PayDigital.astro",
  "Receipt.astro",
  "HistoryScreen.astro",
];

let failures = 0;
const check = (name: string, cond: boolean, extra = ""): void => {
  if (cond) {
    console.log(`✓ ${name}`);
  } else {
    failures++;
    console.error(`✗ ${name}${extra ? ` — ${extra}` : ""}`);
  }
};

// Wrapper compartido con padding definido.
const wrapper = readFileSync(join(appDir, "AppContent.astro"), "utf8");
check("AppContent: max-w-[560px]", wrapper.includes("max-w-[560px]"));
check("AppContent: mx-auto", wrapper.includes("mx-auto"));
check("AppContent: px-4", wrapper.includes("px-4"));
check("AppContent: py-5", wrapper.includes("py-5"));

for (const s of screens) {
  const src = readFileSync(join(appDir, s.file), "utf8");

  check(`${s.file}: data-screen="${s.screen}"`, src.includes(`data-screen="${s.screen}"`));
  check(`${s.file}: usa <AppContent>`, src.includes("<AppContent"));
  check(`${s.file}: cierra </AppContent>`, src.includes("</AppContent>"));
  check(
    `${s.file}: TopBar ${s.topbar ? "presente" : "ausente"}`,
    s.topbar ? src.includes("<TopBar") : !src.includes("<TopBar")
  );

  const viewportBreakpoints = src.match(/\b(?:sm|md|lg|xl|2xl):/g);
  check(
    `${s.file}: sin breakpoints de viewport (usar @container app)`,
    !viewportBreakpoints,
    viewportBreakpoints ? `encontrado: ${[...new Set(viewportBreakpoints)].join(", ")}` : ""
  );

  check(`${s.file}: no redefine el wrapper (max-w-[560px])`, !src.includes("max-w-[560px]"));
  check(`${s.file}: zonas táctiles (min-h-)`, src.includes("min-h-"));
}

for (const file of scopedFiles) {
  const src = readFileSync(join(appDir, file), "utf8");
  const scoped = /querySelector(?:<[^>]*>)?\(\s*['"`]\[data-screen=/.test(src);
  check(`${file}: consultas scopeadas a su pantalla`, scoped);
}

console.log("");
if (failures > 0) {
  console.error(`${failures} verificación(es) de layout fallaron.`);
  process.exitCode = 1;
} else {
  console.log("Todas las verificaciones de layout pasaron.");
}
