# KB sync

Author arc content in a spreadsheet, ship it as validated JSON.

The runtime source of truth is **`server/data/arcs.json`** (loaded fail-closed at
boot). This script lets you edit that content somewhere friendlier — a local
CSV/TSV or a shared Google Sheet — then pulls it down, validates it against the
**same Zod schema the server uses**, and rewrites the JSON. Nothing reaches
production without passing the gate.

The data source lives behind one seam (`loadRows`), so you can switch between a
Google Sheet and a local CSV without touching anything else.

## Why not have the server read the sheet live?

Because a live sheet bypasses the gate. Today, malformed data makes the server
**refuse to boot** and the anti-spoiler suite blocks the deploy. A live sheet
means a typo or a half-finished edit hits production instantly, with no
validation and no spoiler test in between — and the change isn't a reviewable
diff you can revert. Sync keeps the safety net; the only cost is a deploy per
update, which Render does automatically on push.

## Weekly flow (a new episode dropped)

```bash
# 1. edit the sheet — usually just bump the current arc's `end` by 1,
#    or add a new arc row when an arc begins.

# 2. pull it down + validate
npm run sync:kb -- --source=<your source>

# 3. read what changed
git diff server/data/arcs.json

# 4. anti-spoiler gate (also runs in CI on every deploy)
npm test

# 5. commit + push  → Render auto-deploys
```

## Sources

`--source=` (or the `KB_SOURCE` env var) accepts:

| Form | Example | Notes |
|------|---------|-------|
| Local file | `--source=./data/sources/arcs.csv` | CSV; edits in Excel/Sheets, diffs cleanly |
| Google Sheet | `--source="gsheet:<sheetId>:Arcs"` | sheet must be shared "anyone with the link can view"; `:Arcs` (tab name) is optional |
| Direct URL | `--source="https://.../export?format=csv"` | any CSV endpoint |

## Bootstrap a sheet from current data

```bash
npm run sync:kb -- --export > arcs.csv     # then import arcs.csv into Sheets/Excel
```

## Columns

One row per arc. `seriesId` is injected automatically (single series), so you
never type it. Column **order is free** — they're matched by header name.

| Column | Type | Notes |
|--------|------|-------|
| `id` | string | unique slug, e.g. `arlong-park` |
| `name`, `island`, `saga` | string | |
| `start`, `end` | int | episode range; `end >= start` |
| `rating` | number 0–10 | |
| `kind` | `canon` \| `filler` \| `mixed` | |
| `summary` | string | |
| `moments` | string | pipe-delimited list, e.g. `A \| B \| C` |
| `watch` | string | runtime label, e.g. `5h 25m` |
| `future` | bool | `true`/`false` — detail not yet curated |
| `banner` | string | image key or empty for none |

> **Spoiler note:** you can put real titles/summaries in the KB even for future
> arcs — the server's DTO filter strips summary/moments/banner/kind for any arc
> the viewer hasn't reached yet, and `npm test` proves it at 12 boundaries. The
> KB is the source; the gate is what keeps it safe.
