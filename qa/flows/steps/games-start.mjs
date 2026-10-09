const GAMES = {
  marooned: {
    name: "Marooned",
    src: "https://marooned-island-e8bc6f06ff39.herokuapp.com/",
    leaderboard: true,
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
  await page.goto(url(), { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1, name: game.name, exact: true }).waitFor({ timeout: 20000 });
  await page.locator(`iframe[title="${game.name}"]`).waitFor({ state: "attached", timeout: 20000 });
  await page.getByText(`Loading ${game.name}...`).waitFor({ state: "hidden", timeout: 45000 });
  await page.waitForFunction(
    ({ name, src }) => {
      const iframe = document.querySelector("iframe");
      return iframe?.title === name && iframe.src.startsWith(src) && !document.body.innerText.includes("Game Failed to Load");
    },
    { name: game.name, src: game.src },
    { timeout: 20000 },
  );

  if (!game.leaderboard) return;

  await page.getByRole("button", { name: "Leaderboard" }).click();
  await page.getByRole("heading", { name: "Marooned Leaderboard" }).waitFor({ timeout: 10000 });
  await page.waitForFunction(() => {
    if (document.body.innerText.includes("Loading leaderboard")) return false;
    return [...document.querySelectorAll(".font-bold")].some((el) => /^(?:\d+d(?: \d+h)?|\d+h)$/.test(el.innerText.trim()));
  }, null, { timeout: 30000 });
}

export default gamesStart;
