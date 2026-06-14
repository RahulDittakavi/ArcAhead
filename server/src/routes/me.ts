import { Router } from "express";
import { prisma, getDemoUser, SERIES_ID } from "../db.js";
import type { MeDto } from "@arcahead/shared";

export const meRouter = Router();

function toMeDto(u: { id: string; email: string; currentEp: number }): MeDto {
  return { id: u.id, email: u.email, currentEp: u.currentEp };
}

// GET /api/me  → current user + saved episode
meRouter.get("/", async (_req, res, next) => {
  try {
    res.json(toMeDto(await getDemoUser()));
  } catch (e) {
    next(e);
  }
});

// PATCH /api/me { currentEp }  → persist the user's progress (clamped)
meRouter.patch("/", async (req, res, next) => {
  try {
    const raw = (req.body ?? {}).currentEp;
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      return res.status(400).json({ error: "currentEp must be a number" });
    }
    const series = await prisma.series.findUnique({ where: { id: SERIES_ID } });
    const max = series?.episodes ?? Number.MAX_SAFE_INTEGER;
    const currentEp = Math.max(1, Math.min(max, Math.round(n)));

    const user = await getDemoUser();
    const updated = await prisma.user.update({ where: { id: user.id }, data: { currentEp } });
    res.json(toMeDto(updated));
  } catch (e) {
    next(e);
  }
});
