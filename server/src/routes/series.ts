import { Router } from "express";
import { kb } from "../kb/index.js";

export const seriesRouter = Router();

// GET /api/series  → the single tracked series (no spoilers; metadata only)
seriesRouter.get("/", (_req, res) => {
  res.json(kb.series());
});

// GET /api/timeline  → series + ordered sagas (the journey spine)
seriesRouter.get("/timeline", (_req, res) => {
  res.json({ series: kb.series(), sagas: kb.sagas() });
});
