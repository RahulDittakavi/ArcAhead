import { Router } from "express";
import { resolveEp } from "../db.js";
import { kb } from "../kb/index.js";
import { toMilestoneDto } from "../spoiler/filter.js";
import type { MilestonesDto } from "@arcahead/shared";

export const milestonesRouter = Router();

// GET /api/milestones?ep=  → journey milestones, spoiler-filtered.
// reached → full recap+reward; current → title+reward (recap withheld);
// future → sealed mystery placeholder.
milestonesRouter.get("/", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const dtos = kb.milestones().map((m) => toMilestoneDto(m, ep));
    const current = dtos.find((m) => m.status === "current") ?? null;
    const next = dtos.find((m) => m.status === "future") ?? null;
    const payload: MilestonesDto = { milestones: dtos, current, next };
    res.json(payload);
  } catch (e) {
    next(e);
  }
});
