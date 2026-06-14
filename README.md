# ArcAhead

A spoiler-free companion for first-time **One Piece** viewers. You tell it your
current episode; every screen filters its content to that point — islands you've
passed light up, the current arc is highlighted, and everything ahead stays in
the fog. The **Spoiler Shield** is applied **server-side**, so plot you haven't
reached never crosses the wire.

This is a production-grade rebuild of the design prototype in
`design_handoff_arcahead/` (React-via-Babel + mock data) as a real
React + TypeScript + Express app.

## Core principle

> **ArcAhead must never spoil the user.** Every architecture decision prioritizes
> that above convenience, automation, or completeness.

Because a single spoiler destroys trust, the system is built around a **curated,
structured knowledge base** — not LLM knowledge. AI is *not* the source of truth
for lore, characters, arcs, or boundaries.

```
User → Knowledge Base (curated JSON) → Spoiler Filter → API/UI → [optional AI formatting]
```

- The **knowledge base** (`server/data/*.json`) is the authoritative, reviewable
  source of truth. A human guarantees spoiler-safety by reviewing these files.
- The **spoiler filter** gates every response by the user's episode before it
  leaves the server.
- The **AI formatting layer** is optional, off by default, and *structurally*
  constrained: it may only consume already-filtered DTOs, never KB records — so
  it cannot see or invent unreleased content.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite (SPA), CSS variables, lucide-react |
| Backend | Node + TypeScript + Express |
| Content | Curated JSON knowledge base (`server/data/`), Zod-validated at boot |
| User state | Browser `localStorage` (the saved `currentEp`); API is stateless — no database |
| Monorepo | npm workspaces: `shared` · `server` · `web` |

`shared/` holds the API contract types imported by both server and web:
`*Record` (the full KB shape) vs `*Dto` (the spoiler-filtered wire shape). The
AI layer may only ever touch `*Dto`.

## Quick start

Prereqs: Node 18+. **No database, no Docker** — the API is stateless and content
loads from `server/data/*.json` at boot.

```bash
npm install
npm run build:shared          # compile the shared types package
# two terminals:
npm run dev:server            # API → http://localhost:4000 (validates the KB at boot)
npm run dev:web               # app → http://localhost:5173 (proxies /api → 4000)
```

To run the production single-service build (Express serves the SPA + API):

```bash
npm run build && npm start    # → http://localhost:4000
```

## The Spoiler Shield (core business logic)

All gating lives in `server/src/spoiler/` and is applied before any response
leaves the server:

- **`journey.ts`** — ports `window.ARC.journey(currentEp)`. Derives each arc's
  `status` (`done` / `current` / `future`) from `currentEp` vs `start`/`end`.
  Status is **never stored**.
- **`filter.ts`** — the gate:
  - `future` arcs return **no** `summary`, `moments`, `rating`, or `banner` —
    only safe metadata (`name`, `island`, `saga`, `status`, `hasBanner`, `hype`).
  - characters with `epaffirst > ep` return only name + first-appearance episode
    (`introduced: false`); the bio payload is omitted.
  - arc `kind` (canon/filler/mixed) is sent only for reached/current arcs, so
    the app can answer "is this filler?" without leaking that a fogged arc exists.
  - `locked[]` facts are always sealed stubs (`title` + `hint` + `unlockEp`).
  - **milestones**: `reached` → full recap; `current` → title only (recap
    withheld, it would spoil the stretch's end); `future` → sealed placeholder.
  - reactions are only surfaced for arcs the user has actually reached.

Verified behaviors (see "Verification"): a future arc's summary *and* `kind` are
`undefined` at `ep=381` and present at `ep=999`; the in-progress milestone's
recap is withheld; reactions are empty before Thriller Bark.

## Knowledge base (`server/data/`)

The authoritative content, version-controlled and reviewable:

| File | Holds |
|---|---|
| `timeline.json` | series metadata + ordered sagas (the journey spine) |
| `arcs.json` | arc records (incl. `kind: canon\|filler\|mixed`) |
| `characters.json` | character bios + gated `locked[]` facts |
| `milestones.json` | journey milestones: episode range, safe recap, reward |
| `reactions.json` | spoiler-free community hype, tagged by arc |

`server/src/kb/` loads and **Zod-validates** every record at boot. If anything is
malformed the server **refuses to start** (fail-closed) rather than serve
unvalidated content — verified to exit non-zero on a corrupted file.

## AI formatting layer (`server/src/present/`)

Off by default. A `Presenter` interface whose methods take `*Dto` (already
spoiler-filtered) and return reworded `*Dto` — never `*Record`. This makes "AI
can't spoil you" a *compile-time* property: a presenter is structurally incapable
of seeing unreleased content, and may only rephrase already-approved strings. The
default `passthroughPresenter` returns text verbatim. To enable AI later,
implement the interface behind an env flag (a small Claude model such as
`claude-haiku-4-5` fits a "rephrase only, add nothing" prompt).

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/series` | the tracked series metadata |
| GET | `/api/series/timeline` | series + ordered sagas (journey spine) |
| GET | `/api/journey?ep=` | derived arc statuses + progress summary |
| GET | `/api/arcs?ep=` | all arcs, spoiler-filtered (voyage map) |
| GET | `/api/arcs/:id?ep=` | one arc, spoiler-filtered (+ presenter) |
| GET | `/api/characters?ep=&q=` | search, spoiler-filtered bios |
| GET | `/api/characters/:id?ep=` | one character, spoiler-filtered (+ presenter) |
| GET | `/api/milestones?ep=` | journey milestones, spoiler-filtered |
| GET | `/api/reactions?ep=&arc=` | spoiler-safe community hype |

Every request carries the episode as `?ep=`; if omitted, the server uses a safe
default. There is no per-user server state.

### State / accounts model

DB-less: `currentEp` lives in each visitor's `localStorage`
(`web/src/lib/episode.tsx`), so everyone has independent progress with no login.
The API is stateless and does all spoiler filtering from the KB. `resolveEp()` in
`server/src/db.ts` is the single seam where real auth + a per-user datastore
would plug back in for multi-user.

## Frontend

- `web/src/styles/tokens.css` — design tokens (dark + parchment surfaces),
  buttons, chips, the episode slider — ported 1:1 from the prototype's `:root`.
- `web/src/lib/episode.tsx` — `EpisodeProvider`: holds `currentEp`, persists it
  to `localStorage`, and is the single source the stepper drives.
- `web/src/lib/useApi.ts` — re-fetches whenever `ep` changes, so **every screen
  re-filters live** when the TopBar stepper moves.
- Screens: `Landing`, `Setup`, `Dashboard`, `ArcDetail`, `CharacterLookup`.
- Layout: 232px `Sidebar` + sticky `TopBar` (episode stepper); Landing is
  full-width marketing.

### Images

Third-party anime art from the prototype is **not** bundled. The `IMAGES`
registry (`web/src/lib/images.ts`) keeps the prototype's "reference by semantic
key" indirection; `PlaceImg` renders a labelled placeholder until you set a
`src` for that key (drop in your own licensed assets).

## Verification

```bash
# arcs gate
curl -s "localhost:4000/api/arcs/marineford?ep=381"   # status:future, no summary
curl -s "localhost:4000/api/arcs/marineford?ep=999"   # status:done, summary present
# arc filler/canon (only for reached arcs)
curl -s "localhost:4000/api/arcs/thriller-bark?ep=381" # kind:"canon"
curl -s "localhost:4000/api/arcs/wano?ep=381"          # kind + summary both undefined
# character gate
curl -s "localhost:4000/api/characters/brook?ep=100"  # introduced:false, no overview
# milestones gate
curl -s "localhost:4000/api/milestones?ep=381"        # current milestone has NO safeRecap
# reactions gate
curl -s "localhost:4000/api/reactions?ep=100"         # [] (Thriller Bark not reached)
```

## Deploy (Render, single service)

DB-less, so deployment is one web service that builds the SPA + API and serves
both. [`render.yaml`](render.yaml) is a Blueprint:

1. Push to GitHub (this repo).
2. In Render → **Blueprints** → **New Blueprint Instance** → pick this repo.
   It reads `render.yaml` and provisions the `arcahead` web service.
3. Build: `npm install && npm run build`. Start: `npm start`. Health: `/api/health`.

No environment variables or database required. The free plan cold-starts after
idle (~30s first hit) — fine for a private test. Note: the bundled imagery is
third-party — keep the URL private until it's replaced with licensed art.

## Project layout

```
shared/   API contract types: *Record (KB) vs *Dto (filtered wire)
server/
  data/             curated JSON knowledge base (authoritative content)
  src/kb/           KB loader + Zod schemas (fail-closed at boot)
  src/spoiler/      journey() + the spoiler filter (the gate)
  src/present/      optional AI formatting seam (DTO-only, passthrough default)
  src/routes/       Express endpoints (stateless)
  index.ts          serves /api + the built SPA in production
web/      Vite SPA (tokens, components, layout, screens)
render.yaml         Render Blueprint (one web service, no DB)
```
