/**
 * Verificador de los documentos legales (NO conectado al build).
 * Uso: `npm run check:legal`
 * Falla con exit 1 si hay hallazgos y escribe el reporte en `legal-report.md`.
 * Reporta, no corrige.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fixedTerms, loanConfig, recaNumber } from "../src/config/product.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const legalDir = join(root, "src", "data", "legal");

// Lista configurable de domicilios exactos prohibidos.
const BLOCKED_ADDRESSES = ["pingüino", "pinguino"];

const PROHIBITED_TERMS = [
  "baubap",
  "kueski",
  "nubank",
  "nu.com",
  "nu méxico",
  "didi",
  "banca múltiple",
  "polanco",
  "ávila camacho",
  "consulta.une",
  "misdatos@",
];

const PERCENT_ALLOWED = [
  fixedTerms.tasaOrdinariaAnual,
  fixedTerms.tasaOrdinariaMensualSimple,
  fixedTerms.tasaMoratoriaMensual,
  fixedTerms.equivalenciaMoraAnual,
  fixedTerms.catAnual,
  fixedTerms.catMensual,
];

const FILES = ["contrato.md", "disposiciones.md", "caratula.md"];
const GLUED = /[A-Za-zÁÉÍÓÚÑ]EN CREDIT|EN CREDIT[A-Za-zÁÉÍÓÚÑ]/;

interface Finding {
  file: string;
  line: number;
  message: string;
}

const findings: Finding[] = [];
const add = (file: string, line: number, message: string): void => {
  findings.push({ file, line, message });
};

const fileLines: Record<string, string[]> = {};

for (const file of FILES) {
  let content: string;
  try {
    content = readFileSync(join(legalDir, file), "utf8");
  } catch {
    add(file, 0, "No se encontró el archivo (¿ejecutar `npm run legal:convert`?)");
    continue;
  }
  const lines = content.split("\n");
  fileLines[file] = lines;

  lines.forEach((raw, index) => {
    const lineNo = index + 1;
    const norm = raw.replace(/\\/g, "").toLowerCase();

    // 1) "EN CREDIT" pegado a letras
    if (GLUED.test(raw)) {
      add(file, lineNo, `"EN CREDIT" pegado a letras: “${raw.trim().slice(0, 90)}”`);
    }

    // 2) términos prohibidos
    for (const term of PROHIBITED_TERMS) {
      if (norm.includes(term)) add(file, lineNo, `Término prohibido: “${term}”`);
    }

    // 4) domicilios exactos
    for (const addr of BLOCKED_ADDRESSES) {
      if (norm.includes(addr)) add(file, lineNo, `Domicilio exacto bloqueado: “${addr}”`);
    }

    // 7) placeholders
    if (/\$\s+MXN/.test(raw)) add(file, lineNo, "Placeholder sin resolver: “$   MXN”");
    if (/_{3,}/.test(raw)) add(file, lineNo, "Placeholder sin resolver: subrayado “____”");
    if (/\[(?:\s*\.\.\.\s*|…)\]/.test(raw)) add(file, lineNo, "Placeholder sin resolver: “[...]”");

    // 5) cifras coherentes con fixedTerms (tasa/CAT y plazo)
    if (/tasa|cat|inter[eé]s/.test(norm)) {
      const pcts = [...norm.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map((m) => Number(m[1]));
      for (const p of pcts) {
        if (!PERCENT_ALLOWED.some((allowed) => Math.abs(allowed - p) < 0.001)) {
          add(file, lineNo, `Porcentaje ${p}% no coincide con fixedTerms (tasa/CAT)`);
        }
      }
    }
    const plazoMatch = norm.match(/plazo[^\n]*?(\d{1,2})\s*mes(?:es)?/);
    if (plazoMatch) {
      const plazo = Number(plazoMatch[1]);
      if (!loanConfig.plazos.includes(plazo)) {
        add(file, lineNo, `Plazo ${plazo} meses no coincide con la configuración [${loanConfig.plazos.join(", ")}]`);
      }
    }
  });
}

// 3) números de registro RECA
const recaNumbers = new Set<string>();
for (const file of FILES) {
  (fileLines[file] ?? []).forEach((raw, index) => {
    const norm = raw.replace(/\\/g, "").toLowerCase();
    if (!/\breca\b/.test(norm)) return;
    if (norm.includes("pendiente de definir")) return;
    const nums = raw.match(/\b\d[\d\-\s]{5,}\b/g) ?? [];
    for (const num of nums) {
      const clean = num.trim();
      recaNumbers.add(clean);
      if (clean !== recaNumber) {
        add(file, index + 1, `Número RECA “${clean}” distinto de recaNumber (“${recaNumber}”)`);
      }
    }
  });
}
if (recaNumbers.size > 1) {
  add("(global)", 0, `Hay dos números RECA distintos: ${[...recaNumbers].join(", ")}`);
}

// 6) referencias cruzadas "cláusula N" -> encabezado en contrato.md
const headings = (fileLines["contrato.md"] ?? [])
  .map((line) => line.match(/^#{1,4}\s+(.+?)\s*$/)?.[1] ?? "")
  .filter(Boolean);
for (const file of FILES) {
  (fileLines[file] ?? []).forEach((raw, index) => {
    const matches = [...raw.matchAll(/cl[aá]usula\s+(\d{1,3})/gi)].map((m) => Number(m[1]));
    for (const n of matches) {
      const exists = headings.some((h) => new RegExp(`(^|\\s)${n}[.\\s]`).test(h) || h.includes(`Cláusula ${n}`));
      if (!exists) {
        add(file, index + 1, `Cláusula ${n} citada sin encabezado correspondiente en contrato.md`);
      }
    }
  });
}

// Reporte
const relOf = (file: string): string => (file.startsWith("(") ? file : `src/data/legal/${file}`);
const lines: string[] = [];
lines.push("# Reporte check:legal", "");
lines.push(`Hallazgos: ${findings.length}`, "");
if (findings.length === 0) {
  lines.push("Sin hallazgos.");
} else {
  lines.push("| Ubicación | Hallazgo |");
  lines.push("| --- | --- |");
  for (const f of findings) {
    lines.push(`| ${relOf(f.file)}:${f.line} | ${f.message} |`);
  }
}
writeFileSync(join(root, "legal-report.md"), `${lines.join("\n")}\n`, "utf8");

for (const f of findings) {
  console.log(`✗ ${relOf(f.file)}:${f.line} — ${f.message}`);
}
console.log("");
console.log(`Reporte escrito en legal-report.md (${findings.length} hallazgo(s)).`);
if (findings.length > 0) process.exitCode = 1;
