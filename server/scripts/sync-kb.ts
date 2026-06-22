/* ============================================================================
   KB sync — author curated content in a spreadsheet, ship it as validated JSON.

   The runtime source of truth stays the JSON in `server/data/` (loaded
   fail-closed at boot). This script lets you EDIT that content somewhere
   friendlier — a local CSV/TSV or a shared Google Sheet — then pulls it down,
   validates it against the SAME Zod schema the server uses, and rewrites the
   JSON. Nothing reaches production without passing the gate.

   Two targets, one code path:
     --target=arcs    (default)  → arcs.json           (one row per arc)
     --target=filler              → episode-class.json  (filler/recap overrides)

   The data source lives behind one seam (`loadRows`), so you can point at a
   Google Sheet today and a local CSV tomorrow with no other changes.

   USAGE
     # import: source -> json   (then review `git diff`, then `npm test`)
     npm run sync:kb -- --source=./data/sources/arcs.csv
     npm run sync:kb -- --target=filler --source="gsheet:1AbC...xyz:Filler"
     KB_SOURCE=./data/sources/arcs.csv npm run sync:kb

     # export: json -> CSV on stdout (bootstrap a sheet from current data)
     npm run sync:kb -- --export
     npm run sync:kb -- --target=filler --export > filler.csv

   Recommended weekly flow when a new episode drops:
     1. edit the sheet (bump the current arc's `end`, or add a new arc row;
        add a filler row if the new episode is anime-original)
     2. npm run sync:kb -- --source=<your source>            (and --target=filler)
     3. git diff server/data/                                ← read what changed
     4. npm test                                             ← anti-spoiler gate
     5. commit + push → Render auto-deploys
   ============================================================================ */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ArcsFileSchema, EpisodeClassFileSchema, TimelineSchema } from "../src/kb/schema.js";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(DIR, "../data");
const TIMELINE_JSON = path.join(DATA_DIR, "timeline.json");

// ---------------------------------------------------------------------------
// Targets. Each describes a JSON file and how its rows map to/from a sheet.
// Columns are matched by HEADER NAME, so column order in the sheet is free.
// seriesId is injected from timeline.json (single series) — never typed.
// ---------------------------------------------------------------------------
interface Target {
  file: string;
  defaultTab: string;
  /** columns that MUST be present in the source header */
  required: readonly string[];
  /** export column order (extra fields like seriesId are not authored by hand) */
  columns: readonly string[];
  /** at least one data row required? (arcs yes; the filler overlay may be empty) */
  minRows: number;
  schema: { parse: (v: unknown) => unknown[] };
  /** raw rows → records, with strict coercion and row-named errors */
  toRecords: (rows: string[][], seriesId: string, get: Getter) => Record<string, unknown>[];
  /** record → flat string cells for export */
  toCells: (rec: Record<string, unknown>) => Record<string, string>;
  /** stable sort key + human label for the change report */
  sortKey: (rec: Record<string, unknown>) => number;
  keyOf: (rec: Record<string, unknown>) => string;
}

type Getter = (r: string[], c: string) => string;

const ARC_COLUMNS = [
  "id", "name", "island", "saga", "start", "end",
  "kind", "watch", "future", "banner", "moments", "summary",
] as const;

const FILLER_COLUMNS = ["from", "to", "classification", "note"] as const;

const TARGETS: Record<string, Target> = {
  arcs: {
    file: "arcs.json",
    defaultTab: "Arcs",
    required: ARC_COLUMNS,
    columns: ARC_COLUMNS,
    minRows: 1,
    schema: ArcsFileSchema as unknown as { parse: (v: unknown) => unknown[] },
    toRecords(rows, seriesId, get) {
      return rows.slice(1).map((r, n) => {
        const where = `row ${n + 2} (${get(r, "id") || "?"})`;
        const num = numField(get, r, where);
        const banner = get(r, "banner");
        // Key order matches the existing arcs.json so an unchanged sync diffs
        // to zero lines — reviewers only ever see real changes.
        return {
          id: get(r, "id"),
          seriesId,
          name: get(r, "name"),
          island: get(r, "island"),
          saga: get(r, "saga"),
          start: num("start"),
          end: num("end"),
          kind: get(r, "kind"), // validated against the enum by Zod
          summary: get(r, "summary"),
          moments: get(r, "moments").split("|").map((s) => s.trim()).filter(Boolean),
          watch: get(r, "watch"),
          future: boolField(get, r, where)("future"),
          banner: banner === "" ? null : banner,
        };
      });
    },
    toCells: (a) => ({
      id: str(a.id), name: str(a.name), island: str(a.island), saga: str(a.saga),
      start: str(a.start), end: str(a.end), kind: str(a.kind),
      watch: str(a.watch), future: str(a.future), banner: a.banner == null ? "" : str(a.banner),
      moments: (a.moments as string[]).join(" | "), summary: str(a.summary),
    }),
    sortKey: (a) => Number(a.start),
    keyOf: (a) => str(a.id),
  },

  filler: {
    file: "episode-class.json",
    defaultTab: "Filler",
    required: ["from", "to", "classification"], // `note` optional
    columns: FILLER_COLUMNS,
    minRows: 0, // an empty overlay is valid (== arc-kind defaults everywhere)
    schema: EpisodeClassFileSchema as unknown as { parse: (v: unknown) => unknown[] },
    toRecords(rows, seriesId, get) {
      return rows.slice(1).map((r, n) => {
        const where = `row ${n + 2} (${get(r, "from")}-${get(r, "to")})`;
        const num = numField(get, r, where);
        const note = get(r, "note");
        const rec: Record<string, unknown> = {
          seriesId,
          from: num("from"),
          to: num("to"),
          classification: get(r, "classification"), // validated against the enum by Zod
        };
        if (note) rec.note = note; // optional, server-side only
        return rec;
      });
    },
    toCells: (e) => ({
      from: str(e.from), to: str(e.to), classification: str(e.classification),
      note: e.note == null ? "" : str(e.note),
    }),
    sortKey: (e) => Number(e.from),
    keyOf: (e) => `${str(e.from)}-${str(e.to)}`,
  },
};

const str = (v: unknown) => String(v ?? "");

// strict coercion helpers; errors name the row so a typo fails loudly here
function numField(get: Getter, r: string[], where: string) {
  return (c: string): number => {
    const v = Number(get(r, c));
    if (!Number.isFinite(v)) throw new Error(`sync: ${where}: "${c}" is not a number: "${get(r, c)}"`);
    return v;
  };
}
function boolField(get: Getter, r: string[], where: string) {
  return (c: string): boolean => {
    const v = get(r, c).toLowerCase();
    if (["true", "1", "yes", "y"].includes(v)) return true;
    if (["false", "0", "no", "n", ""].includes(v)) return false;
    throw new Error(`sync: ${where}: "${c}" is not a boolean: "${get(r, c)}"`);
  };
}

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
  return rows.filter((r) => r.some((f) => f.trim() !== "")); // drop blank lines
}

function toCsvField(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

// ---------------------------------------------------------------------------
// Source seam. Resolves a --source string to raw CSV text.
//   gsheet:<id>[:<sheetName>]  → Google "gviz" CSV endpoint (sheet must be
//                                shared "anyone with the link can view")
//   http(s)://...              → fetched as-is
//   anything else              → local file path
// For a Google Sheet without an explicit tab, the target's defaultTab is used.
// ---------------------------------------------------------------------------
async function loadRows(source: string, defaultTab: string): Promise<string[][]> {
  let text: string;
  if (source.startsWith("gsheet:")) {
    const [, id, sheet] = source.split(":");
    const tab = sheet || defaultTab;
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
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

function headerIndex(header: string[], required: readonly string[]): Record<string, number> {
  const idx: Record<string, number> = {};
  header.forEach((h, i) => (idx[h.trim().toLowerCase()] = i));
  const missing = required.filter((c) => !(c in idx));
  if (missing.length) throw new Error(`sync: source is missing column(s): ${missing.join(", ")}`);
  return idx;
}

// ---------------------------------------------------------------------------
// Export: current JSON -> CSV (stdout). Inverse of the import path.
// ---------------------------------------------------------------------------
function exportCsv(t: Target): string {
  const recs = t.schema.parse(JSON.parse(readFileSync(path.join(DATA_DIR, t.file), "utf8"))) as Record<string, unknown>[];
  const header = t.columns.join(",");
  const lines = [...recs]
    .sort((a, b) => t.sortKey(a) - t.sortKey(b))
    .map((rec) => {
      const cell = t.toCells(rec);
      return t.columns.map((c) => toCsvField(cell[c] ?? "")).join(",");
    });
  return [header, ...lines].join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const targetName = args.find((a) => a.startsWith("--target="))?.slice("--target=".length) ?? "arcs";
  const t = TARGETS[targetName];
  if (!t) {
    console.error(`sync: unknown --target "${targetName}". Use one of: ${Object.keys(TARGETS).join(", ")}`);
    process.exit(2);
  }
  const jsonPath = path.join(DATA_DIR, t.file);

  if (args.includes("--export")) {
    process.stdout.write(exportCsv(t));
    return;
  }

  const sourceArg = args.find((a) => a.startsWith("--source="))?.slice("--source=".length);
  const source = sourceArg ?? process.env.KB_SOURCE;
  if (!source) {
    console.error(
      "sync: no source. Pass --source=<path|url|gsheet:id[:sheet]> or set KB_SOURCE.\n" +
        "      (or --export to dump current JSON as CSV)"
    );
    process.exit(2);
  }

  const seriesId = TimelineSchema.parse(JSON.parse(readFileSync(TIMELINE_JSON, "utf8"))).series.id;
  const rows = await loadRows(source, t.defaultTab);
  if (rows.length < 1) throw new Error("sync: source is empty (no header row)");
  if (rows.length - 1 < t.minRows) throw new Error(`sync: source has a header but no data rows (target "${targetName}" needs at least ${t.minRows})`);

  const idx = headerIndex(rows[0], t.required);
  const get: Getter = (r, c) => (r[idx[c]] ?? "").trim();
  const candidate = t.toRecords(rows, seriesId, get);

  // THE GATE: same schema the server boots against. A bad row throws here.
  const recs = t.schema.parse(candidate) as Record<string, unknown>[];

  // duplicate-key guard (Zod validates each record, not cross-row uniqueness)
  const seen = new Set<string>();
  for (const rec of recs) {
    const k = t.keyOf(rec);
    if (seen.has(k)) throw new Error(`sync: duplicate ${targetName} key "${k}"`);
    seen.add(k);
  }

  const sorted = [...recs].sort((a, b) => t.sortKey(a) - t.sortKey(b));

  // compare with disk so the run reports what actually changed
  const before = (JSON.parse(readFileSync(jsonPath, "utf8")) as Record<string, unknown>[]) ?? [];
  const beforeKeys = new Set(before.map((r) => t.keyOf(r)));
  const afterKeys = new Set(sorted.map((r) => t.keyOf(r)));
  const added = sorted.filter((r) => !beforeKeys.has(t.keyOf(r))).map((r) => t.keyOf(r));
  const removed = before.filter((r) => !afterKeys.has(t.keyOf(r))).map((r) => t.keyOf(r));

  writeFileSync(jsonPath, JSON.stringify(sorted, null, 2) + "\n", "utf8");

  console.log(`sync: wrote ${sorted.length} ${targetName} record(s) to ${path.relative(process.cwd(), jsonPath)}`);
  if (added.length) console.log(`  + added:   ${added.join(", ")}`);
  if (removed.length) console.log(`  - removed: ${removed.join(", ")}`);
  console.log("  next: review `git diff`, then `npm test` (anti-spoiler gate) before committing.");
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
