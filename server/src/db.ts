import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const SERIES_ID = "one-piece"; // single tracked title for this build
export const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL || "navigator@arcahead.app";

/** Single-user model: resolve (or lazily create) the one demo user. */
export async function getDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: { email: DEMO_USER_EMAIL },
  });
}

/** Resolve the effective episode for a request: explicit ?ep= wins, otherwise
 *  fall back to the demo user's saved currentEp. Clamped to [1, series.episodes]. */
export async function resolveEp(rawEp: unknown): Promise<number> {
  const series = await prisma.series.findUnique({ where: { id: SERIES_ID } });
  const max = series?.episodes ?? Number.MAX_SAFE_INTEGER;
  let ep: number;
  if (rawEp === undefined || rawEp === null || rawEp === "") {
    ep = (await getDemoUser()).currentEp;
  } else {
    ep = Number(rawEp);
    if (!Number.isFinite(ep)) ep = (await getDemoUser()).currentEp;
  }
  return Math.max(1, Math.min(max, Math.round(ep)));
}
