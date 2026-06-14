import express from "express";
import cors from "cors";
import { journeyRouter } from "./routes/journey.js";
import { arcsRouter } from "./routes/arcs.js";
import { charactersRouter } from "./routes/characters.js";
import { reactionsRouter } from "./routes/reactions.js";
import { meRouter } from "./routes/me.js";
import { seriesRouter } from "./routes/series.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/series", seriesRouter);
app.use("/api/journey", journeyRouter);
app.use("/api/arcs", arcsRouter);
app.use("/api/characters", charactersRouter);
app.use("/api/reactions", reactionsRouter);
app.use("/api/me", meRouter);

// Centralized error handler.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`ArcAhead API listening on http://localhost:${PORT}`));
