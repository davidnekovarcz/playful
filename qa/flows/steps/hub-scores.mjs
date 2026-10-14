/** Open the hub and wait until the live cards finish loading their scores. */
async function hubScores({ page, url }) {
  await page.goto(url(), { waitUntil: "domcontentloaded" });
  for (const name of ["GTA Praha", "Marooned", "Crossy Road", "Traffic Run"]) {
    await page.getByRole("heading", { level: 3, name, exact: true }).waitFor({ timeout: 20000 });
  }
  await page.waitForFunction(() => {
    const card = (name) =>
      [...document.querySelectorAll("h3")].find((heading) => heading.textContent.trim() === name)?.closest(".game-card");
    const gta = card("GTA Praha");
    const marooned = card("Marooned");
    const crossy = card("Crossy Road");
    const traffic = card("Traffic Run");
    if (!gta || !marooned || !crossy || !traffic) return false;
    if (document.body.innerText.includes("Crazy Vacuum")) return false;
    const loading = (el) => el.innerText.includes("Loading...");
    if (loading(gta) || loading(marooned) || loading(crossy) || loading(traffic)) return false;
    if (!/(?:\d+d(?: \d+h)?|\d+h) \S/.test(marooned.innerText)) return false;
    return [...document.querySelectorAll("h2")].some((el) => el.textContent.trim() === "GTA Praha");
  }, null, { timeout: 30000 });
}

export default hubScores;
