import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { neon } from "@neondatabase/serverless";

const SCHEMA = new URL("../db/schema.sql", import.meta.url);

export async function migrate(url) {
  const sql = neon(url);
  const statements = readFileSync(SCHEMA, "utf8")
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) await sql.query(statement);
  return statements.length;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const target = process.argv.includes("--test") ? "DATABASE_URL_TEST" : "DATABASE_URL";
  const url = process.env[target];
  if (!url) {
    console.error(`${target} не задан`);
    process.exit(1);
  }
  const count = await migrate(url);
  console.warn(`migrate: ${count} команд применено к ${target}`);
}
