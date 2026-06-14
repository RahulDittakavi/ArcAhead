import { Router } from "express";
import { resolveEp } from "../db.js";
import { kb } from "../kb/index.js";
import type { ReactionDto } from "@arcahead/shared";

export const reactionsRouter = Router();

// GET /api/reactions?ep=&arc=  → spoiler-safe community hype.
// Reactions are authored spoiler-free, but we still only surface ones tied to
// arcs the user has actually reached (start <= ep) so nothing hints ahead.
reactionsRouter.get("/", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const arcFilter = typeof req.query.arc === "string" ? req.query.arc : null;

    const reachedNames = new Set<string>();
    for (const a of kb.arcs()) {
      if (a.start <= ep) {
        reachedNames.add(a.name);
        reachedNames.add(a.island);
      }
    }

    const safe: ReactionDto[] = kb
      .reactions()
      .filter((r) => (arcFilter ? r.arc === arcFilter : true))
      .filter((r) => reachedNames.has(r.arc))
      .map((r) => ({ id: r.id, user: r.user, arc: r.arc, text: r.text, hype: r.hype, ago: r.ago }));

    res.json(safe);
  } catch (e) {
    next(e);
  }
});
