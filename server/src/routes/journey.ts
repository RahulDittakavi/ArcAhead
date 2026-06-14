import { Router } from "express";
import { resolveEp } from "../db.js";
import { kb } from "../kb/index.js";
import { buildJourney } from "../spoiler/journey.js";

export const journeyRouter = Router();

// GET /api/journey?ep=  → derived arc statuses + progress summary
journeyRouter.get("/", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    res.json(buildJourney(kb.arcs(), ep, kb.series().episodes));
  } catch (e) {
    next(e);
  }
});
