import { Router } from "express";
import { prisma, resolveEp, SERIES_ID } from "../db.js";
import type { ReactionDto } from "@arcahead/shared";

export const reactionsRouter = Router();

// GET /api/reactions?ep=&arc=  → spoiler-safe community hype.
// Reactions are authored spoiler-free, but we still only surface ones tied to
// arcs the user has actually reached (current or done) so nothing hints ahead.
reactionsRouter.get("/", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const arcFilter = typeof req.query.arc === "string" ? req.query.arc : null;

    // Arcs reached so far (start <= ep): their display names are safe to tag.
    const reachedArcs = await prisma.arc.findMany({
      where: { seriesId: SERIES_ID, start: { lte: ep } },
      select: { name: true, island: true },
    });
    const reachedNames = new Set<string>();
    for (const a of reachedArcs) {
      reachedNames.add(a.name);
      reachedNames.add(a.island);
    }

    const reactions = await prisma.reaction.findMany({
      where: { seriesId: SERIES_ID, ...(arcFilter ? { arc: arcFilter } : {}) },
      orderBy: { id: "asc" },
    });

    const safe: ReactionDto[] = reactions
      .filter((r) => reachedNames.has(r.arc))
      .map((r) => ({ id: r.id, user: r.user, arc: r.arc, text: r.text, hype: r.hype, ago: r.ago }));

    res.json(safe);
  } catch (e) {
    next(e);
  }
});
