/* ============================================================================
   Seed — ports the mock data from the prototype's arc-data.js into Postgres.
   Banner/img values are IMAGES-registry KEYS (resolved to placeholders on the
   client), not file paths — keeping the "reference by semantic key" indirection.
   ============================================================================ */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERIES_ID = "one-piece";
const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL || "navigator@arcahead.app";

const series = {
  id: SERIES_ID,
  title: "One Piece",
  episodes: 1122,
  year: 1999,
  tracked: 248300,
  score: 96,
  hue: 32,
  tagline: "A grand voyage across an endless sea, in search of the ultimate treasure.",
  tag: "Adventure",
};

const arcs = [
  { id: "romance-dawn", name: "Romance Dawn", island: "Dawn Island", saga: "East Blue", start: 1, end: 3, rating: 8.1,
    summary: "Where the journey begins and a captain sets out with a single, unshakable promise.",
    moments: ["The first crew member joins", "A promise made under open sky", "Setting sail for the first time"], watch: "1h 10m" },
  { id: "orange-town", name: "Orange Town", island: "Orange Town", saga: "East Blue", start: 4, end: 8, rating: 7.6,
    summary: "A quiet town meets a loud crew, and a fight breaks out over the price of pride.",
    moments: ["A daring rooftop rescue", "An unlikely alliance", "A clown's grand entrance"], watch: "1h 55m" },
  { id: "syrup-village", name: "Syrup Village", island: "Gecko Islands", saga: "East Blue", start: 9, end: 18, rating: 8.0,
    summary: "A village on a cliff, a boy who cries wolf, and a ship worth defending.",
    moments: ["A slope battle at dawn", "A new crewmate's true colors", "The crew earns a vessel"], watch: "3h 50m" },
  { id: "baratie", name: "Baratie", island: "Sea Restaurant", saga: "East Blue", start: 19, end: 30, rating: 8.4,
    summary: "A floating restaurant becomes a battlefield of dreams, debts, and devotion.",
    moments: ["A cook's impossible standard", "A duel of swordsmen", "A dream worth starving for"], watch: "4h 35m" },
  { id: "arlong-park", name: "Arlong Park", island: "Conomi Islands", saga: "East Blue", start: 31, end: 44, rating: 9.1,
    summary: "A village under a long shadow, and a navigator who finally asks for help.",
    moments: ["The tattoo and the map room", "\"...help me.\"", "The end of a long debt"], watch: "5h 25m" },
  { id: "loguetown", name: "Loguetown", island: "Loguetown", saga: "East Blue", start: 45, end: 53, rating: 8.2,
    summary: "The town of beginnings and endings, and the last stop before the real adventure.",
    moments: ["A scaffold under stormy skies", "A new weapon, a new resolve", "The gateway to the Grand Line"], watch: "3h 25m" },
  { id: "whisky-peak", name: "Whisky Peak", island: "Cactus Island", saga: "Alabasta", start: 64, end: 67, rating: 7.9,
    summary: "A welcoming town that is not at all what it seems.",
    moments: ["A wine-soaked welcome", "A swordsman versus a crowd", "A secret organization revealed"], watch: "1h 30m" },
  { id: "little-garden", name: "Little Garden", island: "Little Garden", saga: "Alabasta", start: 70, end: 77, rating: 8.0,
    summary: "A prehistoric island where two old warriors keep a century-long promise.",
    moments: ["A duel that never ends", "A clash of giants", "An escape against the clock"], watch: "3h 05m" },
  { id: "drum-island", name: "Drum Island", island: "Drum Island", saga: "Alabasta", start: 78, end: 91, rating: 8.7,
    summary: "A snowbound kingdom, a castle on a peak, and the search for a doctor.",
    moments: ["A climb up a frozen mountain", "A reindeer's dream", "A new crewmate joins"], watch: "5h 25m" },
  { id: "alabasta", name: "Alabasta", island: "Sandy Kingdom", saga: "Alabasta", start: 92, end: 130, rating: 9.3,
    summary: "A desert kingdom on the edge of war, and a princess fighting for her people.",
    moments: ["A march across the sands", "A rooftop showdown", "An X marks a vow"], watch: "15h 10m", banner: "ARC_BANNER_ALABASTA" },
  { id: "jaya", name: "Jaya", island: "Jaya", saga: "Sky Island", start: 144, end: 152, rating: 8.5,
    summary: "A rough port town and a dreamer who believes in a city in the clouds.",
    moments: ["A bar full of trouble", "A liar worth believing", "A leap toward the sky"], watch: "3h 30m" },
  { id: "skypiea", name: "Skypiea", island: "Sky Island", saga: "Sky Island", start: 153, end: 195, rating: 9.0,
    summary: "An island in the heavens, an ancient bell, and a story written in gold.",
    moments: ["Arrival above the clouds", "A bell that rings for an explorer", "A 400-year-old dream"], watch: "16h 40m" },
  { id: "long-ring", name: "Long Ring Long Land", island: "Long Ring Land", saga: "Water 7", start: 207, end: 219, rating: 7.7,
    summary: "A stretched-out island and a contest where more than treasure is on the line.",
    moments: ["A strange long-legged land", "A race against rivals", "A captain's gamble"], watch: "5h 05m" },
  { id: "water-7", name: "Water 7", island: "Water 7", saga: "Water 7", start: 229, end: 263, rating: 9.2,
    summary: "A city of canals and shipwrights, where the crew faces its hardest question yet.",
    moments: ["A city built on water", "A painful misunderstanding", "A flag that will not fall"], watch: "13h 30m" },
  { id: "enies-lobby", name: "Enies Lobby", island: "Enies Lobby", saga: "Water 7", start: 264, end: 312, rating: 9.6,
    summary: "A fortress of judgment, a declaration of war, and a fight to bring someone home.",
    moments: ["A declaration over the sea", "Eight against an institution", "\"I want to live!\""], watch: "18h 50m", banner: "ARC_BANNER_ENIES_LOBBY" },
  { id: "post-enies", name: "Post-Enies Lobby", island: "Return to Water 7", saga: "Water 7", start: 313, end: 325, rating: 8.6,
    summary: "The quiet after the storm — farewells, a new ship, and a bounty that changes everything.",
    moments: ["A new dream-ship revealed", "A tearful goodbye", "Bounties posted"], watch: "5h 05m" },
  { id: "thriller-bark", name: "Thriller Bark", island: "Thriller Bark", saga: "Thriller Bark", start: 337, end: 381, rating: 8.8,
    summary: "A ghost ship the size of an island, a long night of fog, and a new face hiding behind a song.",
    moments: ["A mansion in the mist", "A shadow stolen at midnight", "A gentleman's debt repaid"], watch: "17h 20m" },
  // ---- Future islands (fogged relative to ep 381) ----
  { id: "sabaody", name: "Sabaody Archipelago", island: "Sabaody Archipelago", saga: "Summit War", start: 385, end: 405, rating: 9.4,
    summary: "The last stop before a far greater sea — a lawless grove where the crew meets the wider world.",
    moments: [], watch: "8h 05m", future: true },
  { id: "amazon-lily", name: "Amazon Lily", island: "Amazon Lily", saga: "Summit War", start: 408, end: 421, rating: 8.7,
    summary: "An island of warriors with rules of their own.",
    moments: [], watch: "5h 25m", future: true },
  { id: "impel-down", name: "Impel Down", island: "Impel Down", saga: "Summit War", start: 422, end: 456, rating: 9.2,
    summary: "A prison beneath the sea with six descending levels.",
    moments: [], watch: "13h 30m", future: true },
  { id: "marineford", name: "Marineford", island: "Marineford", saga: "Summit War", start: 457, end: 489, rating: 9.7,
    summary: "The arc everyone warns you about. We won't.",
    moments: [], watch: "12h 45m", future: true, banner: "ARC_BANNER_MARINEFORD" },
  { id: "wano", name: "Wano Country", island: "Wano Country", saga: "Yonko", start: 890, end: 1085, rating: 9.5,
    summary: "A faraway land of samurai, sealed borders, and a storm long in the making.",
    moments: [], watch: "70h+", future: true, banner: "ARC_BANNER_WANO" },
];

const characters = [
  { id: "luffy", name: "Monkey D. Luffy", epithet: "Straw Hat", img: "LUFFY_CHARACTER_IMAGE",
    crew: true, bounty: "300,000,000", epaffirst: 1, hue: 8, role: "Captain", affil: "The crew",
    overview: "The crew's fearless, rubber-bodied captain. Loud, loyal, and allergic to giving up, he sails toward the sea's greatest treasure with a straw hat and an open heart.",
    affiliations: ["Captain of the crew", "Carries a treasured straw hat"],
    appearances: ["Episode 1 onward"], relationships: ["Fiercely protective of every crewmate"],
    locked: [{ title: "A Family Name", unlockEp: 398, hint: "What his lineage means." }] },
  { id: "zoro", name: "Roronoa Zoro", epithet: "Pirate Hunter", img: "ZORO_CHARACTER_IMAGE",
    crew: true, bounty: "120,000,000", epaffirst: 2, hue: 152, role: "Swordsman", affil: "The crew",
    overview: "The crew's first mate and three-sword swordsman, chasing a promise to become the strongest blade on the sea. Stoic, fearless, and famously bad with directions.",
    affiliations: ["First to join the crew", "Wields three swords"],
    appearances: ["Episode 2 onward"], relationships: ["A fierce, unspoken loyalty to his captain"],
    locked: [{ title: "An Old Vow", unlockEp: 380, hint: "The full weight of his dream." }] },
  { id: "nami", name: "Nami", epithet: "Cat Burglar", img: "NAMI_CHARACTER_IMAGE",
    crew: true, bounty: "16,000,000", epaffirst: 1, hue: 42, role: "Navigator", affil: "The crew",
    overview: "The crew's brilliant navigator and map-maker, with a dream of charting the entire world. Sharp-tongued, quick-witted, and the one who actually keeps the ship on course.",
    affiliations: ["Navigator of the crew", "Dreams of mapping the world"],
    appearances: ["Episode 1 onward"], relationships: ["Hard-won trust in her crew"],
    locked: [{ title: "Her Hometown's Secret", unlockEp: 31, hint: "Where she truly comes from." }] },
  { id: "sanji", name: "Sanji", epithet: "Black Leg", img: "SANJI_CHARACTER_IMAGE",
    crew: true, bounty: "77,000,000", epaffirst: 20, hue: 248, role: "Cook", affil: "The crew",
    overview: "The crew's chivalrous cook, who fights with his legs to keep his hands safe for cooking. Romantic to a fault and devoted to never letting a soul go hungry.",
    affiliations: ["Cook of the crew", "Trained at a sea-faring restaurant"],
    appearances: ["Baratie arc onward"], relationships: ["A rivalry-friendship with the swordsman"],
    locked: [{ title: "A Mysterious Lineage", unlockEp: 795, hint: "The truth about his family." }] },
  { id: "robin", name: "Nico Robin", epithet: "Devil Child", img: "ROBIN_CHARACTER_IMAGE",
    crew: true, bounty: "80,000,000", epaffirst: 67, hue: 205, role: "Archaeologist", affil: "The crew",
    overview: "A calm, well-read archaeologist with a quiet past and an encyclopedic knowledge of history. She joined the crew after a long arc of mistrust and now reads the world as easily as a book.",
    affiliations: ["Member of the crew", "Once tied to a secret organization"],
    appearances: ["Whisky Peak onward"], relationships: ["Slowly learning to trust the crew"],
    locked: [{ title: "The Void Century", unlockEp: 395, hint: "What she's truly searching for." }] },
  { id: "chopper", name: "Tony Tony Chopper", epithet: "Cotton Candy Lover", img: "CHOPPER_CHARACTER_IMAGE",
    crew: true, bounty: "50", epaffirst: 81, hue: 18, role: "Doctor", affil: "The crew",
    overview: "The crew's earnest reindeer doctor, who ate a fruit that lets him walk and talk like a person. Gentle, easily flattered, and braver than he believes himself to be.",
    affiliations: ["Doctor of the crew", "A reindeer who can transform"],
    appearances: ["Drum Island onward"], relationships: ["Looks up to the whole crew like family"],
    locked: [{ title: "His Mentor's Lesson", unlockEp: 90, hint: "Who taught him to heal." }] },
  { id: "kuma", name: "Bartholomew Kuma", epithet: "Tyrant", img: null,
    crew: false, bounty: null, epaffirst: 234, hue: 22, role: "Warlord of the Sea", affil: "World Government (Warlord)",
    overview: "A towering, soft-spoken figure who rarely raises his voice and always carries a book. First seen observing from a distance, he is counted among the government-sanctioned Warlords. Little about his intentions is clear at this point in the story.",
    affiliations: ["Seven Warlords of the Sea", "Aligned with the World Government", "Frequently seen reading"],
    appearances: ["A brief, ominous appearance during the Water 7 saga"],
    relationships: ["Acquainted with fellow Warlords", "Known to the Marine high command"],
    locked: [
      { title: "True Allegiances", unlockEp: 513, hint: "A revelation about who Kuma really serves." },
      { title: "The Sabaody Encounter", unlockEp: 399, hint: "His actions at the next major island." },
      { title: "A Promise Kept", unlockEp: 521, hint: "Why this character matters far more than he seems." },
    ] },
  { id: "brook", name: "Brook", epithet: "Soul King", img: null,
    crew: false, bounty: null, epaffirst: 337, hue: 268, role: "Wandering Musician", affil: "Unaffiliated",
    overview: "A cheerful, courteous skeleton with a love of music and an unusual sense of humor. Found alone after many years adrift, he is searching for a way to keep an old promise to a friend.",
    affiliations: ["Former member of a music-loving crew", "Currently traveling alone"],
    appearances: ["Introduced during the Thriller Bark arc"],
    relationships: ["Haunted by the memory of an old crew", "A whale waits for him somewhere"],
    locked: [
      { title: "His Past Voyage", unlockEp: 381, hint: "The full story of his old crew." },
      { title: "A Joining", unlockEp: 381, hint: "What he decides at the end of this arc." },
    ] },
];

const reactions = [
  { user: "navigator_92", arc: "Thriller Bark", text: "the fog, the music, the vibes — peak spooky-adventure energy 🌫️", hype: 94, ago: "2h" },
  { user: "grandlinerookie", arc: "Thriller Bark", text: "no spoilers but ep 377 had me PACING around my room", hype: 88, ago: "5h" },
  { user: "sunny_sails", arc: "Thriller Bark", text: "whoever did the soundtrack for this arc deserves a raise", hype: 91, ago: "8h" },
  { user: "firstwatch_finn", arc: "Thriller Bark", text: "i was scared to start this one. so glad i didn't peek at anything 😅", hype: 96, ago: "1d" },
];

async function main() {
  // Idempotent: clear then re-insert.
  await prisma.lockedFact.deleteMany();
  await prisma.character.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.arc.deleteMany();
  await prisma.series.deleteMany();

  await prisma.series.create({ data: series });

  for (const a of arcs) {
    await prisma.arc.create({
      data: {
        id: a.id, seriesId: SERIES_ID, name: a.name, island: a.island, saga: a.saga,
        start: a.start, end: a.end, rating: a.rating, summary: a.summary,
        moments: a.moments, watch: a.watch, future: a.future ?? false, banner: a.banner ?? null,
      },
    });
  }

  for (const c of characters) {
    await prisma.character.create({
      data: {
        id: c.id, seriesId: SERIES_ID, name: c.name, epithet: c.epithet, img: c.img,
        crew: c.crew, bounty: c.bounty, epaffirst: c.epaffirst, hue: c.hue, role: c.role,
        affil: c.affil, overview: c.overview, affiliations: c.affiliations,
        appearances: c.appearances, relationships: c.relationships,
        locked: { create: c.locked.map((l) => ({ title: l.title, unlockEp: l.unlockEp, hint: l.hint })) },
      },
    });
  }

  for (const r of reactions) {
    await prisma.reaction.create({ data: { seriesId: SERIES_ID, ...r } });
  }

  await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: { email: DEMO_USER_EMAIL, currentEp: 381 },
  });

  console.log(`Seeded ${arcs.length} arcs, ${characters.length} characters, ${reactions.length} reactions.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
