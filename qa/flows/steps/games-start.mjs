const GAMES = {
  "gta-praha": {
    name: "GTA Praha",
    src: "https://gtapraha.online/",
    leaderboard: true,
    leaderboardHeading: "GTA Praha Leaderboard",
    // Keep false until leaderboards/gta-praha/scores has live rows after high-score ship.
    // Flip to true (and match km/m text) once scores exist in the preview env.
    requireScore: false,
  },
  marooned: {
    name: "Marooned",
    src: "https://marooned-island-e8bc6f06ff39.herokuapp.com/",
    leaderboard: true,
    leaderboardHeading: "Marooned Leaderboard",
    requireScore: true,
  },
  "crossy-road": {
    name: "Crossy Road",
    src: "https://crossy-road-adeb791dac1a.herokuapp.com/",
  },
  "traffic-run": {
    name: "Traffic Run",
    src: "https://traffic-run-50a7914ff3f5.herokuapp.com/",
  },
};

/** Open one hub game page and wait until its iframe has started. */
async function gamesStart({ page, url, node }) {
  const game = GAMES[node.id];
  // Answer game-host requests here so the browser never calls a dyno.
  await page.route("**/*", async (route) => {
    const target = route.request().url();
    if (/herokuapp\.com|playful\.smarlify\.co|gtapraha\.online/i.test(target)) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><html><head><title>local-game</title></head><body>local</body></html>",
      });
      return;
    }
    await route.continue();
  });
  await page.goto(url(), { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1, name: game.name, exact: true }).waitFor({ timeout: 20000 });
  const frame = page.locator(`iframe[title="${game.name}"]`);
  await frame.waitFor({ state: "attached", timeout: 20000 });
  const loading = page.getByText(`Loading ${game.name}...`);
  if (await loading.isVisible().catch(() => false)) {
    await frame.dispatchEvent("load");
  }
  await loading.waitFor({ state: "hidden", timeout: 10000 });
  await page.waitForFunction(
    ({ name, src }) => {
      const iframe = document.querySelector("iframe");
      return iframe?.title === name && iframe.getAttribute("src").startsWith(src) && !document.body.innerText.includes("Game Failed to Load");
    },
    { name: game.name, src: game.src },
    { timeout: 20000 },
  );

  if (!game.leaderboard) return;

  await page.getByRole("button", { name: "Leaderboard" }).click();
  await page.getByRole("heading", { name: game.leaderboardHeading }).waitFor({ timeout: 10000 });
  await page.waitForFunction(() => !document.body.innerText.includes("Loading leaderboard"), null, { timeout: 30000 });

  if (!game.requireScore) return;

  await page.waitForFunction(() => {
    return [...document.querySelectorAll(".font-bold")].some((el) => /^(?:\d+d(?: \d+h)?|\d+h)$/.test(el.innerText.trim()));
  }, null, { timeout: 30000 });
}

export default gamesStart;
