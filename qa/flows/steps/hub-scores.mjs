/** Open the hub and wait until the live cards finish loading their scores. */
async function hubScores({ page, url }) {
  await page.goto(url(), { waitUntil: "domcontentloaded" });
  for (const name of ["Marooned", "Crossy Road", "Traffic Run", "Crazy Vacuum 3D"]) {
    await page.getByRole("heading", { level: 3, name, exact: true }).waitFor({ timeout: 20000 });
  }
  await page.waitForFunction(() => {
    const card = (name) =>
      [...document.querySelectorAll("h3")].find((heading) => heading.textContent.trim() === name)?.closest(".game-card");
    const marooned = card("Marooned");
    const crossy = card("Crossy Road");
    const traffic = card("Traffic Run");
    const vacuum = card("Crazy Vacuum 3D");
    if (!marooned || !crossy || !traffic || !vacuum) return false;
    const loading = (el) => el.innerText.includes("Loading...");
    if (loading(marooned) || loading(crossy) || loading(traffic)) return false;
    if (!/(?:\d+d(?: \d+h)?|\d+h) \S/.test(marooned.innerText)) return false;
    return vacuum.innerText.includes("Coming Soon");
  }, null, { timeout: 30000 });
}

export default hubScores;
