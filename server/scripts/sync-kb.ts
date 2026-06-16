/* ============================================================================
   KB sync — author arc content in a spreadsheet, ship it as validated JSON.

   The runtime source of truth stays `server/data/arcs.json` (loaded fail-closed
   at boot). This script lets you EDIT that content in a friendlier place — a
   local CSV/TSV or a shared Google Sheet — then pulls it down, validates it
   against the SAME Zod schema the server uses, and rewrites the JSON. Nothing
   reaches production without passing the gate.

   The source is behind one seam (`loadRows`), so you can point it at a Google
   Sheet today and a local CSV tomorrow with no other changes.

   USAGE
     # import: source -> arcs.json   (then review `git diff`, then `npm test`)
     npm run sync:kb -- --source=./data/sources/arcs.csv
     npm run sync:kb -- --source="gsheet:1AbC...xyz:Arcs"
     npm run sync:kb -- --source="https://docs.google.com/.../export?format=csv"
     KB_SOURCE=./data/sources/arcs.csv npm run sync:kb

     # export: arcs.json -> CSV on stdout (bootstrap your sheet from current data)
     npm run sync:kb -- --export > arcs.csv

   Recommended weekly flow when a new episode drops:
     1. edit the sheet (bump the current arc's `end`, or add a new arc row)
     2. `npm run sync:kb -- --source=<your sheet>`
     3. `git diff server/data/arcs.json`   ← read what changed
     4. `npm test`                          ← anti-spoiler gate (also runs in CI)
     5. commit + push → Render auto-deploys
   ============================================================================ */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ArcsFileSchema } from "../src/kb/schema.js";
import { TimelineSchema } from "../src/kb/schema.js";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(DIR, "../data");
const ARCS_JSON = path.join(DATA_DIR, "arcs.json");
const TIMELINE_JSON = path.join(DATA_DIR, "timeline.json");

/** Columns a human edits, in the order they appear when exported. seriesId is
 *  injected from timeline.json (one series), so it never has to be typed. */
const COLUMNS = [
  "id", "name", "island", "saga", "start", "end",
  "kind", "rating", "watch", "future", "banner", "moments", "summary",
] as const;
type Column = (typeof COLUMNS)[number];

// ---------------------------------------------------------------------------
// CSV (RFC-4180-ish): quote fields containing , " or newline; "" escapes a quote.
// Good enough for hand-authored content; no streaming, files are tiny.
// ---------------------------------------------------------------------------
function parseCsv(text: string): string[][] {
  const t = text.replace(/\r\n?/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQuotes) {
      if (c === '"') {
        if (t[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  // drop blank lines (a stray trailing newline, etc.)
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

function toCsvField(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

// ---------------------------------------------------------------------------
// Source seam. Resolves a --source string to raw CSV text.
//   gsheet:<id>[:<sheetName>]  → Google "gviz" CSV endpoint (needs a sheet
//                                shared as "anyone with the link can view")
//   http(s)://...              → fetched as-is (e.g. a published-CSV link)
//   anything else              → local file path
// ---------------------------------------------------------------------------
async function loadRows(source: string): Promise<string[][]> {
  let text: string;
  if (source.startsWith("gsheet:")) {
    const [, id, sheet] = source.split(":");
    const url =
      `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv` +
      (sheet ? `&sheet=${encodeURIComponent(sheet)}` : "");
    text = await fetchText(url);
  } else if (/^https?:\/\//.test(source)) {
    text = await fetchText(source);
  } else {
    text = readFileSync(path.resolve(process.cwd(), source), "utf8");
  }
  return parseCsv(text);
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`sync: fetch failed (${res.status} ${res.statusText}) for ${url}`);
  return res.text();
}

// ---------------------------------------------------------------------------
// Row -> ArcRecord. Maps by HEADER NAME (column order in the sheet is free).
// Coercion is strict and errors name the row, so a typo fails loudly here
// rather than silently shipping bad data.
// ---------------------------------------------------------------------------
function headerIndex(header: string[]): Record<string, number> {
  const idx: Record<string, number> = {};
  header.forEach((h, i) => (idx[h.trim().toLowerCase()] = i));
  const missing = COLUMNS.filter((c) => !(c in idx));
  if (missing.length) throw new Error(`sync: source is missing column(s): ${missing.join(", ")}`);
  return idx;
}

function rowsToArcs(rows: string[][], seriesId: string): unknown[] {
  if (rows.length < 2) throw new Error("sync: source has a header but no data rows");
  const idx = headerIndex(rows[0]);
  const get = (r: string[], c: Column) => (r[idx[c]] ?? "").trim();

  return rows.slice(1).map((r, n) => {
    const where = `row ${n + 2} (${get(r, "id") || "?"})`; // +2: 1-based + header
    const num = (c: Column): number => {
      const v = Number(get(r, c));
      if (!Number.isFinite(v)) throw new Error(`sync: ${where}: "${c}" is not a number: "${get(r, c)}"`);
      return v;
    };
    const bool = (c: Column): boolean => {
      const v = get(r, c).toLowerCase();
      if (["true", "1", "yes", "y"].includes(v)) return true;
      if (["false", "0", "no", "n", ""].includes(v)) return false;
      throw new Error(`sync: ${where}: "${c}" is not a boolean: "${get(r, c)}"`);
    };
    const banner = get(r, "banner");
    // Key order matches the existing arcs.json so a sync of unchanged content
    // produces a zero-line diff — reviewers only ever see real changes.
    return {
      id: get(r, "id"),
      seriesId,
      name: get(r, "name"),
      island: get(r, "island"),
      saga: get(r, "saga"),
      start: num("start"),
      end: num("end"),
      rating: num("rating"),
      kind: get(r, "kind"),               // validated against the enum by Zod
      summary: get(r, "summary"),
      // moments are pipe-delimited so a single CSV cell holds the list
      moments: get(r, "moments").split("|").map((s) => s.trim()).filter(Boolean),
      watch: get(r, "watch"),
      future: bool("future"),
      banner: banner === "" ? null : banner,
    };
  });
}

// ---------------------------------------------------------------------------
// Export: current arcs.json -> CSV (stdout). Inverse of the import path.
// ---------------------------------------------------------------------------
function exportCsv(): string {
  const arcs = ArcsFileSchema.parse(JSON.parse(readFileSync(ARCS_JSON, "utf8")));
  const header = COLUMNS.join(",");
  const lines = [...arcs]
    .sort((a, b) => a.start - b.start)
    .map((a) => {
      const cell: Record<Column, string> = {
        id: a.id, name: a.name, island: a.island, saga: a.saga,
        start: String(a.start), end: String(a.end), kind: a.kind,
        rating: String(a.rating), watch: a.watch, future: String(a.future),
        banner: a.banner ?? "", moments: a.moments.join(" | "), summary: a.summary,
      };
      return COLUMNS.map((c) => toCsvField(cell[c])).join(",");
    });
  return [header, ...lines].join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--export")) {
    process.stdout.write(exportCsv());
    return;
  }

  const sourceArg = args.find((a) => a.startsWith("--source="))?.slice("--source=".length);
  const source = sourceArg ?? process.env.KB_SOURCE;
  if (!source) {
    console.error(
      "sync: no source. Pass --source=<path|url|gsheet:id[:sheet]> or set KB_SOURCE.\n" +
        "      (or --export to dump current arcs.json as CSV)"
    );
    process.exit(2);
  }

  const seriesId = TimelineSchema.parse(JSON.parse(readFileSync(TIMELINE_JSON, "utf8"))).series.id;
  const rows = await loadRows(source);
  const candidate = rowsToArcs(rows, seriesId);

  // THE GATE: same schema the server boots against. A bad row throws here.
  const arcs = ArcsFileSchema.parse(candidate);

  // duplicate-id guard (Zod validates each record, not cross-row uniqueness)
  const seen = new Set<string>();
  for (const a of arcs) {
    if (seen.has(a.id)) throw new Error(`sync: duplicate arc id "${a.id}"`);
    seen.add(a.id);
  }

  const sorted = [...arcs].sort((a, b) => a.start - b.start);

  // compare with what's on disk so the run reports what actually changed
  const before = JSON.parse(readFileSync(ARCS_JSON, "utf8")) as { id: string; end: number }[];
  const beforeById = new Map(before.map((a) => [a.id, a]));
  const added = sorted.filter((a) => !beforeById.has(a.id)).map((a) => a.id);
  const removed = before.filter((a) => !sorted.some((s) => s.id === a.id)).map((a) => a.id);

  writeFileSync(ARCS_JSON, JSON.stringify(sorted, null, 2) + "\n", "utf8");

  console.log(`sync: wrote ${sorted.length} arcs to ${path.relative(process.cwd(), ARCS_JSON)}`);
  if (added.length) console.log(`  + added:   ${added.join(", ")}`);
  if (removed.length) console.log(`  - removed: ${removed.join(", ")}`);
  console.log("  next: review `git diff`, then `npm test` (anti-spoiler gate) before committing.");
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
