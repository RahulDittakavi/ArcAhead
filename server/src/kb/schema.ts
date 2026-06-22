/* ============================================================================
   Zod schemas for the curated JSON knowledge base.

   The KB is the AUTHORITATIVE source of truth. These schemas validate it at
   server boot — if anything is malformed, the server REFUSES TO START rather
   than risk serving unsafe/partial data. Safety over availability.
   ============================================================================ */
import { z } from "zod";

export const SeriesSchema = z.object({
  id: z.string(),
  title: z.string(),
  episodes: z.number().int().positive(),
  year: z.number().int(),
  hue: z.number(),
  tagline: z.string(),
  tag: z.string(),
});

export const SagaSchema = z.object({
  name: z.string(),
  order: z.number().int(),
  fromEp: z.number().int().positive(),
  toEp: z.number().int().positive(),
});

export const TimelineSchema = z.object({
  series: SeriesSchema,
  sagas: z.array(SagaSchema).min(1),
});

export const ArcSchema = z
  .object({
    id: z.string(),
    seriesId: z.string(),
    name: z.string(),
    island: z.string(),
    saga: z.string(),
    start: z.number().int().positive(),
    end: z.number().int().positive(),
    summary: z.string(),
    moments: z.array(z.string()),
    watch: z.string(),
    future: z.boolean(),
    banner: z.string().nullable(),
    kind: z.enum(["canon", "filler", "mixed"]),
  })
  .refine((a) => a.end >= a.start, { message: "arc end must be >= start" });

export const LockedFactSchema = z.object({
  title: z.string(),
  unlockEp: z.number().int().positive(),
  hint: z.string(),
});

export const BountySchema = z.object({
  ep: z.number().int().positive(),
  amount: z.number().int().nonnegative(),
});

export const CharacterSchema = z.object({
  id: z.string(),
  seriesId: z.string(),
  name: z.string(),
  epithet: z.string().nullable(),
  epithetEp: z.number().int().positive().optional(),
  img: z.string().nullable(),
  crew: z.boolean(),
  bounty: z.string().nullable(),
  bounties: z.array(BountySchema).default([]),
  epaffirst: z.number().int().positive(),
  hue: z.number(),
  role: z.string(),
  affil: z.string(),
  overview: z.string(),
  affiliations: z.array(z.string()),
  appearances: z.array(z.string()),
  relationships: z.array(z.string()),
  locked: z.array(LockedFactSchema),
});

export const ReactionSchema = z.object({
  id: z.number().int(),
  seriesId: z.string(),
  user: z.string(),
  arc: z.string(),
  text: z.string(),
  hype: z.number().int().min(0).max(100),
  ago: z.string(),
});

export const MilestoneSchema = z
  .object({
    id: z.string(),
    seriesId: z.string(),
    order: z.number().int(),
    fromEp: z.number().int().positive(),
    toEp: z.number().int().positive(),
    title: z.string(),
    reward: z.string(),
    safeRecap: z.string(),
  })
  .refine((m) => m.toEp >= m.fromEp, { message: "milestone toEp must be >= fromEp" });

export const EpisodeClassSchema = z
  .object({
    seriesId: z.string(),
    from: z.number().int().positive(),
    to: z.number().int().positive(),
    classification: z.enum(["canon", "filler", "mixed", "recap"]),
    note: z.string().optional(),
  })
  .refine((e) => e.to >= e.from, { message: "episode-class `to` must be >= `from`" });

export const ArcsFileSchema = z.array(ArcSchema).min(1);
export const EpisodeClassFileSchema = z.array(EpisodeClassSchema); // may be empty (overlay)
export const CharactersFileSchema = z.array(CharacterSchema).min(1);
export const ReactionsFileSchema = z.array(ReactionSchema);
export const MilestonesFileSchema = z.array(MilestoneSchema);
