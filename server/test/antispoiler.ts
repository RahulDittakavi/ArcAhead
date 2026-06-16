/* ============================================================================
   Anti-spoiler property test — the product's life depends on this.

   For a sweep of episode boundaries, it:
     1. computes the "secret set" from the KB — every text fragment belonging to
        content PAST the boundary (future arcs, unmet characters, withheld
        milestone recaps, unreached-arc reactions),
     2. builds every endpoint's DTO payload at that boundary (through the same
        filter the routes use),
     3. asserts no secret string appears anywhere in any payload,
     4. plus structural checks (no gated keys present) and ep-param fuzzing.

   Any leak exits non-zero → build-breaking, same severity as the fail-closed
   KB boot. Run: `npm test` (server).  No test framework — just assertions.
   ============================================================================ */
import { kb } from "../src/kb/index.js";
import { resolveEp } from "../src/db.js";
import { buildJourney } from "../src/spoiler/journey.js";
import { toArcDto, toCharacterDto, toMilestoneDto, toEpisodeDto, milestoneStatus } from "../src/spoiler/filter.js";

const total = kb.series().episodes;
const arcs = kb.arcs();
const characters = kb.characters();
const milestones = kb.milestones();
const reactions = kb.reactions();
const arcFor = (n: number) => arcs.find((a) => a.start <= n && n <= a.end) ?? null;

const violations: string[] = [];
const fail = (msg: string) => violations.push(msg);

/** Strings that MUST NOT appear in any payload at boundary `ep`. */
function secretSet(ep: number): { value: string; from: string }[] {
  const secrets: { value: string; from: string }[] = [];
  const add = (value: string | null | undefined, from: string) => {
    if (value && value.trim().length > 3) secrets.push({ value, from });
  };

  // future arcs (start > ep): summary, moments, banner key are gated
  for (const a of arcs) {
    if (a.start > ep) {
      add(a.summary, `arc ${a.id}.summary`);
      a.moments.forEach((m, i) => add(m, `arc ${a.id}.moments[${i}]`));
      add(a.banner, `arc ${a.id}.banner`);
    }
  }
  // not-yet-introduced characters (epaffirst > ep): bio payload gated
  for (const c of characters) {
    if (c.epaffirst > ep) {
      add(c.overview, `char ${c.id}.overview`);
      add(c.role, `char ${c.id}.role`);
      add(c.affil, `char ${c.id}.affil`);
      c.affiliations.forEach((x, i) => add(x, `char ${c.id}.affiliations[${i}]`));
      c.appearances.forEach((x, i) => add(x, `char ${c.id}.appearances[${i}]`));
      c.relationships.forEach((x, i) => add(x, `char ${c.id}.relationships[${i}]`));
    }
  }
  // milestones: safeRecap withheld until PASSED (reached); title/reward gated while future
  for (const m of milestones) {
    const st = milestoneStatus(ep, m);
    if (st !== "reached") add(m.safeRecap, `milestone ${m.id}.safeRecap`);
    if (st === "future") {
      add(m.title, `milestone ${m.id}.title`);
      add(m.reward, `milestone ${m.id}.reward`);
    }
  }
  // reactions for arcs not yet reached
  const reachedNames = new Set<string>();
  for (const a of arcs) if (a.start <= ep) { reachedNames.add(a.name); reachedNames.add(a.island); }
  for (const r of reactions) if (!reachedNames.has(r.arc)) add(r.text, `reaction ${r.id}.text`);

  // Subtract strings that ALSO legitimately appear in revealed content: if the
  // same text is already public (e.g. "The crew" is many characters' affil, arc
  // names are shown even for future arcs), its presence isn't a leak. Only
  // fragments UNIQUE to hidden content count.
  const allowed = allowedSet(ep);
  return secrets.filter((s) => !allowed.has(s.value));
}

/** Every string that may legitimately be shown at boundary `ep`. */
function allowedSet(ep: number): Set<string> {
  const allowed = new Set<string>();
  const A = (s: string | null | undefined) => { if (s && s.trim().length > 3) allowed.add(s); };
  for (const a of arcs) {
    // arc identity (name/island/saga) + watch time are shown even for future arcs
    A(a.name); A(a.island); A(a.saga); A(a.watch);
    if (a.start <= ep) { A(a.summary); a.moments.forEach(A); A(a.banner); }
  }
  for (const c of characters) {
    A(c.name); A(c.epithet); A(c.bounty);
    c.locked.forEach((l) => { A(l.title); A(l.hint); }); // sealed stubs are always shown
    if (c.epaffirst <= ep) {
      A(c.overview); A(c.role); A(c.affil);
      c.affiliations.forEach(A); c.appearances.forEach(A); c.relationships.forEach(A);
    }
  }
  for (const m of milestones) {
    const st = milestoneStatus(ep, m);
    if (st === "reached") A(m.safeRecap);
    if (st !== "future") { A(m.title); A(m.reward); }
  }
  const reachedNames = new Set<string>();
  for (const a of arcs) if (a.start <= ep) { reachedNames.add(a.name); reachedNames.add(a.island); }
  for (const r of reactions) if (reachedNames.has(r.arc)) A(r.text);
  return allowed;
}

/** Build every endpoint payload at `ep`, exactly as the routes would. */
function payloadsAt(ep: number): Record<string, unknown> {
  const reached = new Set<string>();
  for (const a of arcs) if (a.start <= ep) { reached.add(a.name); reached.add(a.island); }
  return {
    journey: buildJourney(arcs, ep, total),
    arcsList: arcs.map((a) => toArcDto(a, ep)),
    arcDetails: arcs.map((a) => toArcDto(a, ep)),
    charactersList: characters.map((c) => toCharacterDto(c, ep)),
    characterDetails: characters.map((c) => toCharacterDto(c, ep)),
    milestones: milestones.map((m) => toMilestoneDto(m, ep)),
    reactions: reactions
      .filter((r) => reached.has(r.arc))
      .map((r) => ({ id: r.id, user: r.user, arc: r.arc, text: r.text, hype: r.hype, ago: r.ago })),
    episodes: Array.from({ length: total }, (_, i) => toEpisodeDto(i + 1, arcFor(i + 1), ep, kb.episodeClass(i + 1))),
  };
}

// ---- 1. property sweep: no secret appears in any payload ----
const boundaries = [1, 30, 50, 92, 130, 200, 381, 405, 500, 900, 1085, 1122];
for (const ep of boundaries) {
  const secrets = secretSet(ep);
  const payloads = payloadsAt(ep);
  for (const [endpoint, payload] of Object.entries(payloads)) {
    const json = JSON.stringify(payload);
    for (const s of secrets) {
      if (json.includes(s.value)) fail(`LEAK @ep${ep}: "${s.from}" appeared in /${endpoint}: ${JSON.stringify(s.value).slice(0, 70)}`);
    }
  }
}

// ---- 2. structural checks ----
{
  const ep = 381;
  // future arc carries no gated keys
  const wano = toArcDto(kb.arc("wano")!, ep) as Record<string, unknown>;
  for (const k of ["summary", "moments", "rating", "banner", "kind"]) {
    if (k in wano) fail(`structural: future arc 'wano' still has key '${k}' @ep${ep}`);
  }
  // unmet character: only safe identity, no bio
  const brook = toCharacterDto(kb.character("brook")!, 100) as Record<string, unknown>;
  if (brook.introduced !== false) fail("structural: brook should be introduced:false @ep100");
  for (const k of ["overview", "role", "affil", "affiliations", "appearances", "relationships", "locked"]) {
    if (k in brook) fail(`structural: unmet char 'brook' still has key '${k}' @ep100`);
  }
  // episode past boundary: fogged, no title, arc identity only if arc reached
  const e500 = toEpisodeDto(500, arcFor(500), 381) as Record<string, unknown>;
  if ("title" in e500) fail("structural: unwatched episode 500 leaked a title @ep381");
  if (e500.arcId !== undefined) fail("structural: episode 500 leaked arcId for an unreached arc @ep381");
  if (e500.label !== "Episode 500") fail("structural: episode 500 label not fogged");
}

// ---- 2b. episode-class overlay: override wins, falls back, reveals ahead safely ----
{
  // ep 40 sits in arlong-park (canon). With no override it inherits the arc kind…
  const arc40 = arcFor(40);
  const base = toEpisodeDto(40, arc40, 1000, null);
  if (base.classification !== "canon") fail(`overlay: ep40 should fall back to arc kind 'canon', got '${base.classification}'`);
  // …and an override wins over the arc default.
  const over = toEpisodeDto(40, arc40, 1000, "filler");
  if (over.classification !== "filler") fail(`overlay: ep40 override 'filler' not applied, got '${over.classification}'`);
  // Reveal-ahead: classification is shown even when the episode is far past the
  // boundary — but it must NOT drag any arc identity along with it.
  const ahead = toEpisodeDto(40, arc40, 1) as Record<string, unknown>;
  if (ahead.classification !== "canon") fail("overlay: classification not revealed ahead of boundary");
  if (ahead.reached !== false) fail("overlay: ep40 should be reached:false @ep1");
  if (ahead.arcId !== undefined) fail("overlay: classification-ahead leaked arcId for an unreached arc @ep1");
  // The disjoint-range invariant the resolver relies on holds for shipped data.
  for (let n = 1; n <= total; n++) kb.episodeClass(n); // throws nothing → ranges resolve
}

// ---- 3. ep-param fuzzing: resolves safely, never over-reveals ----
for (const raw of [-5, 0, "abc", "", null, undefined, 1e9, 3.7, "999999"]) {
  const r = resolveEp(raw as unknown);
  if (!Number.isInteger(r) || r < 1 || r > total) fail(`fuzz: resolveEp(${JSON.stringify(raw)}) = ${r} out of [1,${total}]`);
}

// ---- report ----
if (violations.length) {
  console.error(`\n✗ ANTI-SPOILER: ${violations.length} leak(s) found:\n` + violations.map((v) => "  - " + v).join("\n"));
  process.exit(1);
}
console.log(`✓ anti-spoiler: ${boundaries.length} boundaries × ${Object.keys(payloadsAt(1)).length} endpoints clean; structural + fuzz checks passed.`);
