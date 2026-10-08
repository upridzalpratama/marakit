// Render ulang OG image: node tools/render-og.mjs
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";
const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const name of ["og-image", "og-image-en"]) {
  await page.goto("file://" + path.join(dir, name + ".html"), { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(dir, "..", "assets", name + ".png") });
}
await browser.close();
