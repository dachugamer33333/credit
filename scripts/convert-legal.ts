/**
 * Conversión única (re-ejecutable) docx -> markdown para "Avisos y privacidad".
 *
 * Uso: `npm run legal:convert`
 * NO forma parte del build de producción (mammoth es devDependency).
 *
 * Pasos: convertir -> quitar imágenes base64 -> corregir palabras rotas ->
 * insertar encabezados por reglas -> escribir los .md.
 *
 * ENCREDIT4.docx se ignora por completo (contiene capturas con marcas de terceros).
 */
import mammoth from "mammoth";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src/assets/contratos");
const OUT = join(ROOT, "src/data/legal");

// Corrección mecánica: revertir "EN CREDIT" pegado a letras (reemplazo masivo previo).
// Se aplica en orden de longitud descendente para no romper prefijos.
const CORRECTIONS: Array<[string, string]> = [
  ["aEN CREDITalizada", "anualizada"],
  ["aEN CREDITal", "anual"],
  ["EN CREDITevas", "nuevas"],
  ["EN CREDITevos", "nuevos"],
  ["EN CREDITevo", "nuevo"],
  ["EN CREDITeva", "nueva"],
  ["EN CREDITestros", "nuestros"],
  ["EN CREDITestro", "nuestro"],
  ["EN CREDITestras", "nuestras"],
  ["EN CREDITestra", "nuestra"],
  ["EN CREDITnca", "nunca"],
  ["contiEN CREDITación", "continuación"],
  ["contiEN CREDITarán", "continuarán"],
  ["contiEN CREDITarás", "continuarás"],
  ["contiEN CREDITidad", "continuidad"],
  ["miEN CREDITtos", "minutos"],
  ["deEN CREDITnciar", "denunciar"],
  ["MaEN CREDITel", "Manuel"],
  ["reEN CREDITncian", "renuncian"],
].sort((a, b) => b[0].length - a[0].length);

const applyCorrections = (text: string): string =>
  CORRECTIONS.reduce((acc, [from, to]) => acc.split(from).join(to), text);

// Quita markdown de imágenes con data URI (base64) para no ensuciar el .md.
const stripDataImages = (text: string): string =>
  text
    .replace(/!\[[^\]]*\]\(data:[^)]*\)/g, "")
    .replace(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g, "")
    .replace(/\n{3,}/g, "\n\n");

const SECTION_MARKERS: Array<[RegExp, string]> = [
  [/^_{0,2}DECLARACIONES_{0,2}$/i, "Declaraciones"],
  [/^_{0,2}DEFINICIONES_{0,2}$/i, "Definiciones"],
  [/^_{0,2}CL[ÁA]USULAS_{0,2}$/i, "Cláusulas"],
];

interface StructureResult {
  markdown: string;
  clausesFound: number;
  clauseTitles: string[];
}

// Inserta ## para las secciones y ### por cláusula (dentro de "Cláusulas").
// mammoth pierde la numeración automática: se usa el TÍTULO en negrita, sin renumerar.
const addHeadings = (text: string): StructureResult => {
  const lines = text.split("\n");
  const out: string[] = [];
  let inClauses = false;
  const clauseTitles: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    const marker = SECTION_MARKERS.find(([re]) => re.test(trimmed));
    if (marker) {
      inClauses = marker[1] === "Cláusulas";
      out.push(`## ${marker[1]}`, "");
      continue;
    }

    // Cláusula = línea SIN indentar, "N. __Título__".
    if (inClauses) {
      const clause = line.match(/^\d{1,3}\.\s+__(.+?)__\s*(.*)$/);
      if (clause) {
        const title = clause[1]
          .replace(/\\\./g, ".")
          .replace(/\s+/g, " ")
          .replace(/[.\s]+$/, "")
          .trim();
        const rest = clause[2].trim();
        clauseTitles.push(title);
        out.push(`### ${title}`);
        if (rest) out.push("", rest);
        continue;
      }
    }

    out.push(line);
  }

  return {
    markdown: out.join("\n").replace(/\n{3,}/g, "\n\n"),
    clausesFound: clauseTitles.length,
    clauseTitles,
  };
};

const convert = async (file: string): Promise<string> => {
  const { value, messages } = await mammoth.convertToMarkdown({ path: join(SRC, file) });
  if (messages.length > 0) {
    console.log(`  · ${file}: ${messages.length} aviso(s) de mammoth`);
  }
  return value;
};

const main = async (): Promise<void> => {
  mkdirSync(OUT, { recursive: true });

  // caratula.md: solo referencia para check:legal. No se renderiza en la app.
  const caratula = stripDataImages(applyCorrections(await convert("ENCREDIT3.docx")));
  writeFileSync(join(OUT, "caratula.md"), `${caratula.trim()}\n`, "utf8");
  console.log("✓ caratula.md");

  // contrato.md
  const contratoRaw = stripDataImages(applyCorrections(await convert("EN CREDIT 1.docx")));
  const contrato = addHeadings(contratoRaw);
  writeFileSync(join(OUT, "contrato.md"), `${contrato.markdown.trim()}\n`, "utf8");
  console.log(
    `✓ contrato.md — secciones ## (Declaraciones/Definiciones/Cláusulas) y ` +
      `${contrato.clausesFound} cláusulas con ### (título, sin renumerar). ` +
      "Nota: mammoth pierde la numeración automática de cláusulas; revisar contra el documento original."
  );

  // disposiciones.md
  const disposiciones = stripDataImages(applyCorrections(await convert("ENCREDIT 2.docx")));
  writeFileSync(join(OUT, "disposiciones.md"), `${disposiciones.trim()}\n`, "utf8");
  console.log("✓ disposiciones.md");
};

main().catch((error) => {
  console.error("Error en la conversión:", error);
  process.exitCode = 1;
});
