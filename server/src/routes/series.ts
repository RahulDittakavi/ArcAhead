import { Router } from "express";
import { prisma, SERIES_ID } from "../db.js";

export const seriesRouter = Router();

// GET /api/series  → the single tracked series (no spoilers; metadata only)
seriesRouter.get("/", async (_req, res, next) => {
  try {
    const series = await prisma.series.findUnique({ where: { id: SERIES_ID } });
    if (!series) return res.status(404).json({ error: "series not found" });
    res.json(series);
  } catch (e) {
    next(e);
  }
});
