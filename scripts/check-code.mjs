import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DIRS = ["src", "tests", "scripts", "db"];
const EXTS = new Set([".ts", ".tsx", ".mjs", ".css", ".sql"]);
const MAX_LINE = 120;
const MAX_CSS_LINES = 400;
// токены цветов живут только здесь
const TOKEN_FILES = new Set(["src/app/globals.css"]);
const COLOR = /(?<![\w&])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?)\(/i;
const COLOR_EXEMPT = "вне токенов";

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return walk(path);
    return EXTS.has(extname(e.name)) ? [path] : [];
  });
}

export function checkFile(path, text) {
  const problems = [];
  const lines = text.split(/\r?\n/);
  const ext = extname(path);
  const colorCheck = path.startsWith("src/") && !TOKEN_FILES.has(path);

  if (ext === ".css" && lines.length > MAX_CSS_LINES) {
    problems.push(`${path}: ${lines.length} строк, больше ${MAX_CSS_LINES}, раздели файл`);
  }
  lines.forEach((line, i) => {
    const at = `${path}:${i + 1}`;
    if (line.length > MAX_LINE)
      problems.push(`${at}: строка ${line.length} символов, больше ${MAX_LINE}`);
    if (colorCheck && COLOR.test(line)) {
      const exempt = line.includes(COLOR_EXEMPT) || (lines[i - 1] ?? "").includes(COLOR_EXEMPT);
      if (!exempt) problems.push(`${at}: цвет без токена, используй var(--…) из globals.css`);
    }
  });
  return problems;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const files = DIRS.flatMap((d) => walk(join(ROOT, d)));
  const problems = files.flatMap((f) => {
    const rel = relative(ROOT, f).split(sep).join("/");
    return checkFile(rel, readFileSync(f, "utf8"));
  });
  if (problems.length) {
    console.error(problems.join("\n"));
    console.error(`\ncheck-code: ${problems.length} нарушений`);
    process.exit(1);
  }
  console.warn(`check-code: ${files.length} файлов, нарушений нет`);
}
