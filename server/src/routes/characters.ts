import { Router } from "express";
import { resolveEp } from "../db.js";
import { kb } from "../kb/index.js";
import { toCharacterDto } from "../spoiler/filter.js";
import { getPresenter } from "../present/presenter.js";

export const charactersRouter = Router();

// GET /api/characters?ep=&q=  → search, spoiler-filtered bios.
// Not-yet-introduced characters are still returned (so the UI can show the
// "you haven't crossed paths yet" sealed card), but toCharacterDto strips the
// bio payload server-side.
charactersRouter.get("/", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
    const list = kb.characters().filter((c) => (q ? c.name.toLowerCase().includes(q) : true));
    res.json(list.map((c) => toCharacterDto(c, ep)));
  } catch (e) {
    next(e);
  }
});

// GET /api/characters/:id?ep=  → single spoiler-filtered character
charactersRouter.get("/:id", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const char = kb.character(req.params.id);
    if (!char) return res.status(404).json({ error: "character not found" });
    // filter first, then (optionally) reformat — presenter only ever sees the DTO
    res.json(getPresenter().character(toCharacterDto(char, ep)));
  } catch (e) {
    next(e);
  }
});
