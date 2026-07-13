import { chromium } from "playwright";
import path from "node:path";

const OUT = "/opt/cursor/artifacts/screenshots";
const BASE = "http://localhost:4321";

async function hoverToolbar(page) {
  await page.mouse.move(640, 760);
  await page.waitForTimeout(500);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Motion/i }).click();
await page.waitForTimeout(800);

await hoverToolbar(page);
await page.screenshot({ path: path.join(OUT, "08-slide-toolbar-hover.png") });
console.log("08-slide-toolbar-hover.png");

await page.getByRole("button", { name: /Overview/i }).click({ force: true });
await page.waitForSelector('button:has-text("Pan")', { timeout: 5000 });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, "09-slide-overview-canvas.png") });
console.log("09-slide-overview-canvas.png");

// draw a stroke on the canvas workspace
const box = await page.locator('[data-world-layer]').boundingBox();
if (box) {
  await page.mouse.move(box.x + 200, box.y + 180);
  await page.mouse.down();
  await page.mouse.move(box.x + 420, box.y + 260, { steps: 12 });
  await page.mouse.up();
}
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "10-slide-overview-ink.png") });
console.log("10-slide-overview-ink.png");

await hoverToolbar(page);
await page.getByRole("button", { name: "Textbook" }).click({ force: true });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, "11-textbook-header.png") });
console.log("11-textbook-header.png");

await hoverToolbar(page);
await page.getByRole("button", { name: "Overview" }).click({ force: true });
await page.waitForSelector('button:has-text("Pan")', { timeout: 5000 });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, "12-textbook-overview-canvas.png") });
console.log("12-textbook-overview-canvas.png");

await browser.close();
