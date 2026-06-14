import { Router } from "express";
import { prisma, resolveEp, SERIES_ID } from "../db.js";
import { toArcDto } from "../spoiler/filter.js";
import type { ArcRecord } from "@arcahead/shared";

export const arcsRouter = Router();

// GET /api/arcs?ep=  → all arcs (spoiler-filtered) for the voyage map
arcsRouter.get("/", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const arcs = (await prisma.arc.findMany({
      where: { seriesId: SERIES_ID },
      orderBy: { start: "asc" },
    })) as ArcRecord[];
    res.json(arcs.map((a) => toArcDto(a, ep)));
  } catch (e) {
    next(e);
  }
});

// GET /api/arcs/:id?ep=  → single spoiler-filtered arc detail
arcsRouter.get("/:id", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const arc = (await prisma.arc.findUnique({ where: { id: req.params.id } })) as ArcRecord | null;
    if (!arc) return res.status(404).json({ error: "arc not found" });
    res.json(toArcDto(arc, ep));
  } catch (e) {
    next(e);
  }
});
