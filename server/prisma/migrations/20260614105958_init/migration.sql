-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "episodes" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "tracked" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "hue" INTEGER NOT NULL,
    "tagline" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arc" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "island" TEXT NOT NULL,
    "saga" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "moments" TEXT[],
    "watch" TEXT NOT NULL,
    "future" BOOLEAN NOT NULL DEFAULT false,
    "banner" TEXT,

    CONSTRAINT "Arc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "epithet" TEXT,
    "img" TEXT,
    "crew" BOOLEAN NOT NULL DEFAULT false,
    "bounty" TEXT,
    "epaffirst" INTEGER NOT NULL,
    "hue" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "affil" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "affiliations" TEXT[],
    "appearances" TEXT[],
    "relationships" TEXT[],

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockedFact" (
    "id" SERIAL NOT NULL,
    "characterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "unlockEp" INTEGER NOT NULL,
    "hint" TEXT NOT NULL,

    CONSTRAINT "LockedFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" SERIAL NOT NULL,
    "seriesId" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "arc" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "hype" INTEGER NOT NULL,
    "ago" TEXT NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currentEp" INTEGER NOT NULL DEFAULT 381,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Arc_seriesId_start_idx" ON "Arc"("seriesId", "start");

-- CreateIndex
CREATE INDEX "Character_seriesId_epaffirst_idx" ON "Character"("seriesId", "epaffirst");

-- CreateIndex
CREATE INDEX "LockedFact_characterId_idx" ON "LockedFact"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Arc" ADD CONSTRAINT "Arc_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockedFact" ADD CONSTRAINT "LockedFact_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
