import { Router } from "express";
import { prisma, resolveEp, SERIES_ID } from "../db.js";
import { toCharacterDto } from "../spoiler/filter.js";
import type { CharacterRecord } from "@arcahead/shared";

export const charactersRouter = Router();

// GET /api/characters?ep=&q=  → search, spoiler-filtered bios
// Note: we return characters even when not-yet-introduced (so the UI can show
// the "you haven't crossed paths yet" sealed card), but the bio payload itself
// is stripped server-side by toCharacterDto.
charactersRouter.get("/", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const chars = (await prisma.character.findMany({
      where: {
        seriesId: SERIES_ID,
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      include: { locked: true },
      orderBy: { epaffirst: "asc" },
    })) as unknown as CharacterRecord[];

    res.json(chars.map((c) => toCharacterDto(c, ep)));
  } catch (e) {
    next(e);
  }
});

// GET /api/characters/:id?ep=  → single spoiler-filtered character
charactersRouter.get("/:id", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const char = (await prisma.character.findUnique({
      where: { id: req.params.id },
      include: { locked: true },
    })) as unknown as CharacterRecord | null;
    if (!char) return res.status(404).json({ error: "character not found" });
    res.json(toCharacterDto(char, ep));
  } catch (e) {
    next(e);
  }
});
