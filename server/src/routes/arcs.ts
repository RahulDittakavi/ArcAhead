import { Router } from "express";
import { resolveEp } from "../db.js";
import { kb } from "../kb/index.js";
import { toArcDto } from "../spoiler/filter.js";
import { getPresenter } from "../present/presenter.js";

export const arcsRouter = Router();

// GET /api/arcs?ep=  → all arcs (spoiler-filtered) for the voyage map
arcsRouter.get("/", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    res.json(kb.arcs().map((a) => toArcDto(a, ep, kb.classCounts(a.start, a.end, a.kind))));
  } catch (e) {
    next(e);
  }
});

// GET /api/arcs/:id?ep=  → single spoiler-filtered arc detail
arcsRouter.get("/:id", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const arc = kb.arc(req.params.id);
    if (!arc) return res.status(404).json({ error: "arc not found" });
    // filter first, then (optionally) reformat — presenter only ever sees the DTO
    res.json(getPresenter().arc(toArcDto(arc, ep, kb.classCounts(arc.start, arc.end, arc.kind))));
  } catch (e) {
    next(e);
  }
});
