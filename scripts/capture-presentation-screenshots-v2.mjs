import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = "/opt/cursor/artifacts/screenshots/v2";
const BASE = "http://localhost:4321";

async function hoverBottomNav(page) {
  await page.mouse.move(640, 760);
  await page.waitForTimeout(500);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(file);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await mkdir(OUT, { recursive: true });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await shot(page, "01-map");

await page.getByRole("button", { name: /Motion/i }).click();
await page.waitForTimeout(900);
await shot(page, "02-topbar-textbook-default");

await page.getByRole("tab", { name: "Slides" }).click();
await page.waitForTimeout(800);
await shot(page, "03-slide-title-topbar");

await hoverBottomNav(page);
await shot(page, "04-slide-bottom-nav");

await page.keyboard.press("ArrowRight");
await page.waitForTimeout(600);
await shot(page, "05-slide-content");

await page.getByRole("button", { name: /Overview/i }).first().click();
await page.waitForTimeout(1000);
await page.getByRole("toolbar", { name: "Drawing tools" }).waitFor({ timeout: 8000 });
await shot(page, "06-slide-overview-ink-toolbar");

const layer = page.locator("[data-world-layer]");
const box = await layer.boundingBox();
if (box) {
  await page.getByRole("button", { name: "Pen", exact: true }).click();
  await page.mouse.move(box.x + 200, box.y + 200);
  await page.mouse.down();
  await page.mouse.move(box.x + 450, box.y + 320, { steps: 12 });
  await page.mouse.up();
}
await page.waitForTimeout(400);
await shot(page, "07-slide-overview-with-ink");

await page.getByRole("button", { name: /Present/i }).click();
await page.waitForTimeout(700);
await hoverBottomNav(page);
await page.getByRole("button", { name: "Annotate slide" }).click();
await page.waitForTimeout(600);
await page.getByRole("button", { name: "Pen", exact: true }).click();
const slideBox = await page.locator('[aria-roledescription="slide deck"]').boundingBox();
if (slideBox) {
  await page.mouse.move(slideBox.x + 400, slideBox.y + 280);
  await page.mouse.down();
  await page.mouse.move(slideBox.x + 700, slideBox.y + 400, { steps: 10 });
  await page.mouse.up();
}
await page.waitForTimeout(400);
await shot(page, "08-slide-annotate");

await page.getByRole("button", { name: "Done annotating" }).click();
await page.waitForTimeout(500);

await page.getByRole("tab", { name: "Textbook" }).click();
await page.waitForTimeout(800);
await shot(page, "09-textbook-read");

await page.getByRole("button", { name: /Overview/i }).first().click();
await page.waitForTimeout(1000);
await shot(page, "10-textbook-overview-9x16");

await browser.close();
