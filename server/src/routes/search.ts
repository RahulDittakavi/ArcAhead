import { Router } from "express";
import { resolveEp } from "../db.js";
import { searchKb } from "../spoiler/search.js";

export const searchRouter = Router();

// GET /api/search?q=&ep=  → spoiler-safe search (see spoiler/search.ts).
searchRouter.get("/", async (req, res, next) => {
  try {
    const ep = await resolveEp(req.query.ep);
    const q = typeof req.query.q === "string" ? req.query.q : "";
    res.json(searchKb(q, ep));
  } catch (e) {
    next(e);
  }
});
