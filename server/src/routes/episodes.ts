import { Router } from "express";
import { resolveEp } from "../db.js";
import { kb } from "../kb/index.js";
import { toEpisodeDto } from "../spoiler/filter.js";
import type { ArcRecord, EpisodeDto } from "@arcahead/shared";

export const episodesRouter = Router();

/** Build an episode-number → arc lookup once per request (episodes are derived
 *  from arc ranges; gaps map to null = unclassified). */
function arcLookup(): (n: number) => ArcRecord | null {
  const arcs = kb.arcs();
  return (n: number) => arcs.find((a) => a.start <= n && n <= a.end) ?? null;
}

// GET /api/episodes?ep=&from=&to=&arc=
//   - spoiler-filtered episode list (fogged labels; arc identity only once
//     reached; classification revealed ahead).
//   - windowed via ?arc=<id> or ?from=&to= to avoid shipping all ~1122 at once.
episodesRouter.get("/", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const total = kb.series().episodes;
    const lookup = arcLookup();

    let from = 1;
    let to = total;
    if (typeof req.query.arc === "string") {
      const arc = kb.arc(req.query.arc);
      if (!arc) return res.status(404).json({ error: "arc not found" });
      from = arc.start;
      to = arc.end;
    } else {
      if (req.query.from !== undefined) from = Math.max(1, Number(req.query.from) || 1);
      if (req.query.to !== undefined) to = Math.min(total, Number(req.query.to) || total);
    }
    if (to < from) return res.json([]);

    const out: EpisodeDto[] = [];
    for (let n = from; n <= to; n++) out.push(toEpisodeDto(n, lookup(n), ep));
    res.json(out);
  } catch (e) {
    next(e);
  }
});
