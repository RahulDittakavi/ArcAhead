import { Router } from "express";
import { prisma, resolveEp, SERIES_ID } from "../db.js";
import { buildJourney } from "../spoiler/journey.js";
import type { ArcRecord } from "@arcahead/shared";

export const journeyRouter = Router();

// GET /api/journey?ep=  → derived arc statuses + progress summary
journeyRouter.get("/", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const series = await prisma.series.findUnique({ where: { id: SERIES_ID } });
    if (!series) return res.status(404).json({ error: "series not found" });

    const arcs = (await prisma.arc.findMany({ where: { seriesId: SERIES_ID } })) as ArcRecord[];
    res.json(buildJourney(arcs, ep, series.episodes));
  } catch (e) {
    next(e);
  }
});
