# ArcAhead

A spoiler-free companion for first-time **One Piece** viewers. You tell it your
current episode; every screen filters its content to that point — islands you've
passed light up, the current arc is highlighted, and everything ahead stays in
the fog. The **Spoiler Shield** is applied **server-side**, so plot you haven't
reached never crosses the wire.

This is a production-grade rebuild of the design prototype in
`design_handoff_arcahead/` (React-via-Babel + mock data) as a real
React + TypeScript + Express + Postgres app.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite (SPA), CSS variables, lucide-react |
| Backend | Node + TypeScript + Express |
| Data | Postgres + Prisma |
| Monorepo | npm workspaces: `shared` · `server` · `web` |

`shared/` holds the API contract types (DTOs) imported by both server and web,
so the spoiler-filtered shapes can't drift between the two.

## Quick start

Prereqs: Node 18+, Docker (for Postgres).

```bash
npm install
npm run build:shared          # compile the shared types package
npm run db:up                 # start Postgres (docker compose) on host port 5433
npm run db:migrate            # apply Prisma schema
npm run db:seed               # seed arcs/characters/reactions from the prototype data
# two terminals:
npm run dev:server            # API → http://localhost:4000
npm run dev:web               # app → http://localhost:5173 (proxies /api → 4000)
```

> **Port note:** the Postgres container maps host **5433 → container 5432** to
> avoid clashing with a host-installed Postgres on 5432. `server/.env` points at
> 5433. Change both together if needed.

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
  - `locked[]` facts are always sealed stubs (`title` + `hint` + `unlockEp`).
  - reactions are only surfaced for arcs the user has actually reached.

Verified behaviors (see "Verification" below): a future arc's summary is
`undefined` at `ep=381` and present at `ep=999`; reactions are empty before
Thriller Bark is reached; `PATCH /me` persists and clamps to `[1, episodes]`.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/series` | the tracked series metadata |
| GET | `/api/journey?ep=` | derived arc statuses + progress summary |
| GET | `/api/arcs?ep=` | all arcs, spoiler-filtered (voyage map) |
| GET | `/api/arcs/:id?ep=` | one arc, spoiler-filtered |
| GET | `/api/characters?ep=&q=` | search, spoiler-filtered bios |
| GET | `/api/characters/:id?ep=` | one character, spoiler-filtered |
| GET | `/api/reactions?ep=&arc=` | spoiler-safe community hype |
| GET / PATCH | `/api/me` | read / update the saved `currentEp` |

When `ep` is omitted, the server falls back to the demo user's saved `currentEp`.

### Auth model

Single seeded **demo user** (no login flow) — matches what the prototype
describes. `getDemoUser()` / `resolveEp()` in `server/src/db.ts` are the seam to
swap in real auth + per-user `currentEp` later.

## Frontend

- `web/src/styles/tokens.css` — design tokens (dark + parchment surfaces),
  buttons, chips, the episode slider — ported 1:1 from the prototype's `:root`.
- `web/src/lib/episode.tsx` — `EpisodeProvider`: holds `currentEp`, persists it
  (debounced `PATCH /me`), and is the single source the stepper drives.
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
# character gate
curl -s "localhost:4000/api/characters/brook?ep=100"  # introduced:false, no overview
# reactions gate
curl -s "localhost:4000/api/reactions?ep=100"         # [] (Thriller Bark not reached)
# persistence
curl -s -X PATCH localhost:4000/api/me -H 'content-type: application/json' -d '{"currentEp":500}'
```

## Project layout

```
shared/   API contract types (DTOs)
server/   Express API + Prisma + spoiler-filter layer + seed
web/      Vite SPA (tokens, components, layout, screens)
```
