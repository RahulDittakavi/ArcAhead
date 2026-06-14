import { chromium } from "playwright";
import { mkdirSync } from "fs";

const OUT = "c:/ArcAhead/.verify";
mkdirSync(OUT, { recursive: true });

const errors = [];
const log = (...a) => console.log(...a);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("CONSOLE.ERROR: " + m.text());
});

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  log(`  📸 ${name}.png`);
}
// Reset saved episode to 381 so the run is deterministic.
await page.request.patch("http://localhost:4000/api/me", { data: { currentEp: 381 } });

// 1) LANDING
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
log("\n[1] LANDING");
log("  h1:", JSON.stringify(await page.locator("h1").first().innerText()));
const counts = await page.evaluate(() => {
  const body = document.body.innerText;
  const c = (s) => (body.match(new RegExp(s, "g")) || []).length;
  return { wanted: c("WANTED"), uncharted: c("UNCHARTED"), discovered: c("DISCOVERED") };
});
log("  WANTED posters:", counts.wanted, "| UNCHARTED islands:", counts.uncharted, "| DISCOVERED islands:", counts.discovered);
await shot("01-landing");

// 2) SETUP (click the hero CTA)
await page.getByRole("button", { name: /Start Your Voyage/i }).first().click();
await page.waitForTimeout(500);
log("\n[2] SETUP");
log("  heading:", JSON.stringify(await page.locator("h1").first().innerText()));
const epReadout = await page.locator("text=/^381$/").first().count();
log("  shows ep 381 readout:", epReadout > 0);
log("  current island tile text:", JSON.stringify(await page.getByText("Current island").locator("..").innerText()));
await shot("02-setup-ep381");

// 2b) Live refilter via preset: jump to ep 1 ("Just set sail")
await page.getByRole("button", { name: "Just set sail" }).click();
await page.waitForTimeout(600);
log("\n[2b] SETUP @ ep 1 (preset)");
log("  current island tile text:", JSON.stringify(await page.getByText("Current island").locator("..").innerText()));
await shot("03-setup-ep1");

// back to a known spot, then enter dashboard
await page.getByRole("button", { name: "Ep 381" }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Begin your voyage/i }).click();
await page.waitForTimeout(700);

// 3) DASHBOARD
log("\n[3] DASHBOARD @ ep 381");
log("  greeting h1:", JSON.stringify(await page.locator("h1").first().innerText()));
log("  current island heading:", JSON.stringify(await page.locator("h2").first().innerText()));
log("  TopBar episode:", JSON.stringify((await page.locator("header").getByText(/^[0-9]+$/).first().innerText()).replace(/\n/g, " ")));
log("  'On the horizon' present:", (await page.getByText("On the horizon").count()) > 0);
await shot("04-dashboard-ep381");

// 3b) Episode stepper: press minus on TopBar 5x, watch island/readout change live
const minusBtn = page.locator('button[title="Back one episode"]');
for (let i = 0; i < 5; i++) await minusBtn.click();
await page.waitForTimeout(500);
log("\n[3b] DASHBOARD after -5 (ep 376)");
log("  TopBar episode:", JSON.stringify((await page.locator("header").getByText(/^[0-9]+$/).first().innerText()).replace(/\n/g, " ")));
await shot("05-dashboard-ep376");

// 4) ARC DETAIL — click "Explore this island"
await page.getByRole("button", { name: /Explore this island/i }).click();
await page.waitForTimeout(700);
log("\n[4] ARC DETAIL (current arc)");
log("  arc h1:", JSON.stringify(await page.locator("h1").first().innerText()));
log("  'Moments worth the voyage' present:", (await page.getByText("Moments worth the voyage").count()) > 0);
log("  voyage-map fogged cards (blur):", await page.evaluate(() => Array.from(document.querySelectorAll('*')).filter(e => getComputedStyle(e).filter.includes('blur')).length));
await shot("06-arcdetail-current");

// 4b) Open a FUTURE island from the voyage map (Wano) → must be fogged, no summary
const wano = page.locator("text=Wano Country").first();
if (await wano.count()) {
  await wano.click();
  await page.waitForTimeout(700);
  log("\n[4b] ARC DETAIL (future = Wano)");
  log("  'Still in the fog' chip:", (await page.getByText("Still in the fog").count()) > 0);
  log("  'Hidden until you make landfall' locked panel:", (await page.getByText("Hidden until you make landfall").count()) > 0);
  await shot("07-arcdetail-future-wano");
}

// 5) CREW LOOKUP — sidebar "The Crew"
await page.getByRole("button", { name: "The Crew" }).click();
await page.waitForTimeout(700);
log("\n[5] CHARACTER LOOKUP @ ep 376 (default Luffy)");
log("  hero h2:", JSON.stringify(await page.locator("h2").first().innerText()));
log("  'Still in the fog' section:", (await page.getByText("Still in the fog").count()) > 0);
log("  sealed locked-fact 'Reached at Episode' chips:", await page.getByText(/Reached at Episode/).count());
await shot("08-crew-luffy");

// 5b) Search Sanji → his locked fact 'A Mysterious Lineage' (unlock 795) must be sealed, not revealed
await page.locator('input[placeholder="Search a pirate…"]').fill("Sanji");
await page.waitForTimeout(500);
log("\n[5b] CREW: Sanji");
log("  shows overview (introduced):", (await page.getByText(/chivalrous cook/i).count()) > 0);
log("  locked 'A Mysterious Lineage' title shown as sealed:", (await page.getByText("A Mysterious Lineage").count()) > 0);
await shot("09-crew-sanji");

// 5c) Drop episode to 100 via setup, then a not-yet-met char (Brook, epaffirst 337) → sealed "haven't crossed paths"
await page.getByRole("button", { name: "Voyage" }).click();
await page.waitForTimeout(400);
// hammer minus is slow; use Setup slider preset path instead
await page.getByText("Welcome back, navigator").waitFor();
// Go to setup via sidebar logo? Use the dashboard search → setup not available; use TopBar minus is too many.
// Instead set ep through the API + reload to simulate a fresh load at ep 100 (still a real render path).
await page.request.patch("http://localhost:4000/api/me", { data: { currentEp: 100 } });
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /See it in action/i }).click(); // → dashboard
await page.waitForTimeout(500);
await page.getByRole("button", { name: "The Crew" }).click();
await page.waitForTimeout(600);
await page.locator('input[placeholder="Search a pirate…"]').fill("Brook");
await page.waitForTimeout(500);
log("\n[5c] CREW @ ep 100: search Brook (first appears ep 337)");
log("  'You haven't crossed paths yet' sealed card:", (await page.getByText(/haven't crossed paths yet/i).count()) > 0);
log("  overview hidden (no skeleton bio):", (await page.getByText(/cheerful, courteous skeleton/i).count()) === 0);
await shot("10-crew-brook-sealed-ep100");

log("\n=== CONSOLE / PAGE ERRORS ===");
log(errors.length ? errors.join("\n") : "NONE ✅");

await browser.close();
process.exit(errors.length ? 1 : 0);
