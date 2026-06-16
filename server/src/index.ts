import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { journeyRouter } from "./routes/journey.js";
import { arcsRouter } from "./routes/arcs.js";
import { charactersRouter } from "./routes/characters.js";
import { reactionsRouter } from "./routes/reactions.js";
import { seriesRouter } from "./routes/series.js";
import { milestonesRouter } from "./routes/milestones.js";
import { episodesRouter } from "./routes/episodes.js";
import { searchRouter } from "./routes/search.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/series", seriesRouter);
app.use("/api/journey", journeyRouter);
app.use("/api/arcs", arcsRouter);
app.use("/api/episodes", episodesRouter);
app.use("/api/characters", charactersRouter);
app.use("/api/reactions", reactionsRouter);
app.use("/api/milestones", milestonesRouter);
app.use("/api/search", searchRouter);

// ---- serve the built SPA (production single-service deploy) ----
// In dev, Vite serves the frontend and proxies /api here, so this is skipped.
const webDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../web/dist");
if (existsSync(webDist)) {
  app.use(express.static(webDist));
  // SPA fallback: any non-/api route returns index.html (client-side router).
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(webDist, "index.html")));
  console.log(`Serving SPA from ${webDist}`);
}

// Centralized error handler.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`ArcAhead API listening on http://localhost:${PORT}`));
